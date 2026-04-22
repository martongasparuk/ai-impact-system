// Helpers for building the scorecard submission payload.
// Kept separate from EmailCaptureForm so the form stays UI-only and the
// payload shape is unit-testable independently.

import type { Answers, Scorecard } from './scoring';

export const PRIVACY_VERSION = '2026-04-21';

export type Utm = {
  source: string | null;
  campaign: string | null;
  medium: string | null;
};

export type SubmissionPayload = {
  email: string;
  firstName: string;
  company: string;
  answers: Answers;
  scorecard: {
    rawScore: number;
    normalisedScore: number;
    band: Scorecard['band']['name'];
    pillarScores: Scorecard['pillarScores'];
    salesTriggerCount: number;
    ctaRoute: Scorecard['ctaRoute'];
  };
  utm: Utm;
  consent: {
    timestamp: string;
    privacyVersion: string;
    dripOptIn: boolean;
  };
  submittedAt: string;
};

export function readUtmFromSearch(search: string): Utm {
  const params = new URLSearchParams(search);
  return {
    source: params.get('utm_source'),
    campaign: params.get('utm_campaign'),
    medium: params.get('utm_medium'),
  };
}

export function buildSubmissionPayload(input: {
  email: string;
  firstName: string;
  company: string;
  answers: Answers;
  scorecard: Scorecard;
  utm: Utm;
  dripOptIn: boolean;
  now?: () => Date;
}): SubmissionPayload {
  const now = input.now ?? (() => new Date());
  const iso = now().toISOString();
  return {
    email: input.email.trim().toLowerCase(),
    firstName: input.firstName.trim(),
    company: input.company.trim(),
    answers: input.answers,
    scorecard: {
      rawScore: input.scorecard.rawScore,
      normalisedScore: input.scorecard.normalisedScore,
      band: input.scorecard.band.name,
      pillarScores: input.scorecard.pillarScores,
      salesTriggerCount: input.scorecard.salesTriggerCount,
      ctaRoute: input.scorecard.ctaRoute,
    },
    utm: input.utm,
    consent: {
      timestamp: iso,
      privacyVersion: PRIVACY_VERSION,
      dripOptIn: input.dripOptIn,
    },
    submittedAt: iso,
  };
}

export type FieldErrors = Partial<Record<'email' | 'firstName' | 'company', string>>;

export type SubmitResult =
  | { kind: 'ok' }
  | { kind: 'rate_limited' }
  | { kind: 'unconfigured' } // 503: beta grace — caller stores locally, shows success
  | { kind: 'validation'; fieldErrors: FieldErrors; message: string }
  | { kind: 'error'; status?: number; message: string };

type ValidationErrorBody = {
  error?: string;
  fields?: { field?: string; message?: string }[];
};

const ALLOWED_FIELDS = new Set(['email', 'firstName', 'company']);

async function parseFieldErrors(res: Response): Promise<FieldErrors> {
  try {
    const body = (await res.json()) as ValidationErrorBody;
    if (!Array.isArray(body.fields)) return {};
    const out: FieldErrors = {};
    for (const entry of body.fields) {
      if (!entry || typeof entry.field !== 'string' || typeof entry.message !== 'string') continue;
      if (!ALLOWED_FIELDS.has(entry.field)) continue;
      out[entry.field as keyof FieldErrors] = entry.message;
    }
    return out;
  } catch {
    return {};
  }
}

export async function postSubmission(
  payload: SubmissionPayload,
): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/scorecard-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { kind: 'ok' };
    if (res.status === 429) return { kind: 'rate_limited' };
    if (res.status === 503) return { kind: 'unconfigured' };
    if (res.status === 400) {
      const fieldErrors = await parseFieldErrors(res);
      if (Object.keys(fieldErrors).length > 0) {
        return {
          kind: 'validation',
          fieldErrors,
          message: 'Please check the highlighted fields.',
        };
      }
    }
    return { kind: 'error', status: res.status, message: `Server returned ${res.status}` };
  } catch (err) {
    return {
      kind: 'error',
      message: err instanceof Error && err.message ? err.message : 'Network error',
    };
  }
}
