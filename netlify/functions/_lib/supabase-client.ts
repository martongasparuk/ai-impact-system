// Memoized Supabase client for Netlify Functions.
// Fluid Compute reuses function instances across warm invocations (PERF-14).
// Constructing the client once at module scope avoids ~30-60ms per warm request
// and cuts Supabase connection pool churn.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let cachedKey: string | null = null;

/**
 * Returns a Supabase service-role client, or null if the required env vars are
 * missing. Reuses the client across warm invocations in the same runtime.
 * Callers are still responsible for checking the env vars themselves when they
 * need to report "service unconfigured" to the user.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.SCORECARD_SUPABASE_URL;
  const key = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const signature = `${url}::${key}`;
  if (cached && cachedKey === signature) return cached;

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cachedKey = signature;
  return cached;
}
