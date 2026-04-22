// Beta feature flag for the scorecard.
//
// Behaviour:
// - If env VITE_BETA_REQUIRED is "true", the scorecard is gated to beta testers only.
// - A user is "in beta" if EITHER:
//     - the URL has ?beta=true (one-time grant → saves to localStorage for future visits)
//     - localStorage.ais_beta === 'true' (previously granted)
// - Passing ?beta=false removes the grant (for testing).
//
// Once the scorecard is ready for everyone, unset VITE_BETA_REQUIRED in Netlify env.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ais_beta';

export type BetaState = {
  /** Whether beta gating is active at all (driven by env var) */
  betaRequired: boolean;
  /** Whether the current user has beta access */
  hasAccess: boolean;
};

export function useBetaFlag(): BetaState {
  const betaRequired =
    (import.meta.env.VITE_BETA_REQUIRED ?? '').toLowerCase() === 'true';

  const [hasAccess] = useState<boolean>(() => {
    if (!betaRequired) return true;
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const urlGrant = params.get('beta');
    if (urlGrant === 'true') return true;
    if (urlGrant === 'false') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Side-effect only: persist the URL grant to localStorage so future visits
  // don't need the query param. State itself was already set by the initializer.
  useEffect(() => {
    if (!betaRequired) return;
    const params = new URLSearchParams(window.location.search);
    const urlGrant = params.get('beta');
    if (urlGrant === 'true') {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else if (urlGrant === 'false') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [betaRequired]);

  return { betaRequired, hasAccess };
}

/** Simple utility: are we in beta mode AT ALL (flag is on) */
export function isBetaEnvironment(): boolean {
  const betaRequired =
    (import.meta.env.VITE_BETA_REQUIRED ?? '').toLowerCase() === 'true';
  return betaRequired;
}
