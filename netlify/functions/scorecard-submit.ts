// Netlify Function: POST /api/scorecard-submit
// Receives completed scorecard, writes to Supabase, triggers immediate email via Resend.
// Hard-fails when Supabase insert fails so the client can retry; soft-fails the email
// (record exists and n8n can retry the send).

import type { Handler } from '@netlify/functions';
import {
  SITE_ORIGIN,
  corsHeaders,
  resolveAllowedOrigin,
  unsubscribeUrlFor,
  exportUrlFor,
  eraseUrlFor,
  newRequestId,
  checkRateLimit,
  clientIp,
  jsonResponse,
} from './_lib/common';
import { sendImmediateReport } from './_lib/immediate-report';
import { getSupabaseServiceClient } from './_lib/supabase-client';

const MAX_BODY_BYTES = 32 * 1024;
const PRIVACY_VERSION = '2026-04-21';

type ConsentBlock = {
  timestamp?: string;
  privacyVersion?: string;
  dripOptIn?: boolean;
};

type Payload = {
  email?: string;
  firstName?: string;
  company?: string;
  answers: {
    context: Record<string, string>;
    scoring: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  };
  scorecard: {
    rawScore: number;
    normalisedScore: number;
    band: 'Exposed' | 'Reactive' | 'Directional' | 'Compounding';
    pillarScores: Record<string, number>;
    salesTriggerCount: number;
    ctaRoute: 'diagnostic_call' | 'webinar' | 'nurture_only' | 'waitlist';
  };
  utm?: {
    source?: string | null;
    campaign?: string | null;
    medium?: string | null;
  };
  consent?: ConsentBlock;
  submittedAt?: string;
};

const respond = (
  status: number,
  body: unknown,
  requestOrigin: string | undefined,
  requestId: string,
) =>
  jsonResponse(status, body, {
    ...corsHeaders(requestOrigin),
    'X-Request-Id': requestId,
  });

export const handler: Handler = async (event) => {
  const requestId = newRequestId();
  const origin = (event.headers['origin'] ?? event.headers['Origin']) as string | undefined;
  const allowedOrigin = resolveAllowedOrigin(origin);

  if (event.httpMethod === 'OPTIONS') {
    return respond(allowedOrigin ? 204 : 403, null, origin, requestId);
  }
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, origin, requestId);
  }

  // Origin check — reject browser submissions from foreign sites.
  // Server-to-server callers (no Origin header) are permitted so ops can replay.
  if (origin && !allowedOrigin) {
    console.warn(`[scorecard-submit ${requestId}] origin rejected`, { origin });
    return respond(403, { error: 'Origin not allowed' }, origin, requestId);
  }

  // Body size cap (DoS guard).
  const rawBody = event.body ?? '';
  if (rawBody.length > MAX_BODY_BYTES) {
    return respond(413, { error: 'Payload too large' }, origin, requestId);
  }

  // IP-based rate limit. 20 submissions per minute per IP, burst 30.
  const ip = clientIp(event.headers);
  const rl = checkRateLimit(`submit:${ip}`, { capacity: 30, refillPerMin: 20 });
  if (!rl.allowed) {
    return respond(429, { error: 'Too many requests', retryAfterSec: rl.retryAfterSec }, origin, requestId);
  }

  let payload: Payload;
  try {
    payload = JSON.parse(rawBody || '{}') as Payload;
  } catch {
    return respond(400, { error: 'Invalid JSON' }, origin, requestId);
  }

  // Field-level validation. `fields` is surfaced next to the relevant input.
  const fieldErrors: { field: string; message: string }[] = [];
  if (!payload.email || typeof payload.email !== 'string' || !payload.email.includes('@')) {
    fieldErrors.push({ field: 'email', message: 'Please enter a valid email address.' });
  } else if (payload.email.length > 254) {
    fieldErrors.push({ field: 'email', message: 'Email address is too long.' });
  }
  if (typeof payload.firstName === 'string' && payload.firstName.length > 100) {
    fieldErrors.push({ field: 'firstName', message: 'First name is too long.' });
  }
  if (typeof payload.company === 'string' && payload.company.length > 200) {
    fieldErrors.push({ field: 'company', message: 'Company name is too long.' });
  }
  if (fieldErrors.length > 0) {
    return respond(
      400,
      { error: 'Validation failed', fields: fieldErrors },
      origin,
      requestId,
    );
  }
  if (!payload.scorecard || typeof payload.scorecard.normalisedScore !== 'number') {
    return respond(400, { error: 'Invalid scorecard payload' }, origin, requestId);
  }

  // Per-email rate limit. 5 submissions per hour per email (legitimate retakes allowed).
  const emailRl = checkRateLimit(`submit-email:${payload.email.toLowerCase()}`, {
    capacity: 5,
    refillPerMin: 5 / 60,
  });
  if (!emailRl.allowed) {
    return respond(429, { error: 'Rate limit: try again later', retryAfterSec: emailRl.retryAfterSec }, origin, requestId);
  }

  const SUPABASE_URL = process.env.SCORECARD_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Marton Gaspar <marton@aiimpactsystem.com>';
  const POSTAL_ADDRESS =
    process.env.POSTAL_ADDRESS ?? 'Marton Gaspar, London, United Kingdom';

  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SCORECARD_SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SCORECARD_SUPABASE_SERVICE_ROLE_KEY');
  if (!RESEND_KEY) missing.push('RESEND_API_KEY');

  if (missing.length > 0) {
    console.warn(
      `[scorecard-submit ${requestId}] missing env vars, payload accepted as localStorage-only`,
      { missing, email: payload.email, band: payload.scorecard.band },
    );
    return respond(
      503,
      { error: 'Service not configured', missing, requestId },
      origin,
      requestId,
    );
  }

  // ───── Write to Supabase ─────
  const consent: ConsentBlock = payload.consent ?? {};
  const normalisedEmail = payload.email.toLowerCase();

  let insertedId: string | null = null;
  try {
    const supabase = getSupabaseServiceClient()!;
    const { data, error } = await supabase
      .from('scorecard_responses')
      .insert({
        email: normalisedEmail,
        first_name: payload.firstName ?? null,
        company: payload.company ?? null,
        role: payload.answers.context.PQ1 ?? null,
        headcount: payload.answers.context.PQ2 ?? null,
        ai_spend: payload.answers.context.PQ3 ?? null,
        urgency: payload.answers.context.PQ4 ?? null,
        raw_score: payload.scorecard.rawScore,
        normalised_score: payload.scorecard.normalisedScore,
        band: payload.scorecard.band,
        pillar_identify: payload.scorecard.pillarScores.Identify ?? 0,
        pillar_map: payload.scorecard.pillarScores.Map ?? 0,
        pillar_prioritise: payload.scorecard.pillarScores.Prioritise ?? 0,
        pillar_agree: payload.scorecard.pillarScores.Agree ?? 0,
        pillar_call: payload.scorecard.pillarScores.Call ?? 0,
        pillar_tell: payload.scorecard.pillarScores.Tell ?? 0,
        sales_trigger_count: payload.scorecard.salesTriggerCount,
        cta_route: payload.scorecard.ctaRoute,
        answers: payload.answers,
        utm_source: payload.utm?.source ?? null,
        utm_campaign: payload.utm?.campaign ?? null,
        utm_medium: payload.utm?.medium ?? null,
        consent_timestamp: consent.timestamp ?? new Date().toISOString(),
        privacy_version: consent.privacyVersion ?? PRIVACY_VERSION,
        drip_consent: Boolean(consent.dripOptIn),
        submitted_at: payload.submittedAt ?? new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    insertedId = data.id;
  } catch (err) {
    // 23505 = unique violation. Treat as idempotent (double-click, refresh, n8n retry).
    const code = (err as { code?: string } | null)?.code;
    if (code === '23505') {
      console.warn(`[scorecard-submit ${requestId}] duplicate same-day submission, treating as idempotent`, { email: normalisedEmail });
    } else {
      console.error(`[scorecard-submit ${requestId}] supabase insert failed`, {
        err,
        email: normalisedEmail,
        utm: payload.utm,
      });
      return respond(
        502,
        { error: 'Could not save submission', requestId },
        origin,
        requestId,
      );
    }
  }

  // ───── Send immediate email via Resend ─────
  // Soft-fail: the Supabase record exists, n8n can retry.
  let emailStatus: 'sent' | 'failed' = 'sent';
  try {
    const unsubSecret = process.env.UNSUBSCRIBE_SECRET;
    const unsubUrl = unsubSecret ? unsubscribeUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/audit`;
    const exportUrl = unsubSecret ? exportUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/privacy.html`;
    const eraseUrl = unsubSecret ? eraseUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/privacy.html`;
    await sendImmediateReport(RESEND_KEY!, FROM_EMAIL, {
      firstName: payload.firstName,
      email: payload.email,
      band: payload.scorecard.band,
      normalisedScore: payload.scorecard.normalisedScore,
      unsubUrl,
      exportUrl,
      eraseUrl,
      postal: POSTAL_ADDRESS,
      includeListUnsubscribeHeaders: Boolean(unsubSecret),
    });
  } catch (err) {
    emailStatus = 'failed';
    console.error(`[scorecard-submit ${requestId}] resend send failed`, {
      err,
      email: normalisedEmail,
    });
  }

  return respond(
    200,
    { ok: true, id: insertedId, emailStatus, requestId },
    origin,
    requestId,
  );
};
