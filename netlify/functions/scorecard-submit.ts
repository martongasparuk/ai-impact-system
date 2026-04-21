// Netlify Function: POST /api/scorecard-submit
// Receives completed scorecard, writes to Supabase, triggers immediate email via Resend.
// Fails gracefully: if env vars are missing, logs a warning and returns 200 so the client
// does not lose the lead (the client keeps a localStorage copy as fallback).

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
  submittedAt?: string;
};

const jsonResponse = (status: number, body: unknown) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, null);
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(event.body ?? '{}') as Payload;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  // Validation
  if (!payload.email || !payload.email.includes('@')) {
    return jsonResponse(400, { error: 'Valid email required' });
  }
  if (!payload.scorecard || typeof payload.scorecard.normalisedScore !== 'number') {
    return jsonResponse(400, { error: 'Invalid scorecard payload' });
  }

  // Env check — fail soft
  const SUPABASE_URL = process.env.SCORECARD_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Marton Gaspar <marton@aiimpactsystem.com>';

  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SCORECARD_SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SCORECARD_SUPABASE_SERVICE_ROLE_KEY');
  if (!RESEND_KEY) missing.push('RESEND_API_KEY');

  if (missing.length > 0) {
    console.warn(
      `[scorecard-submit] Missing env vars: ${missing.join(', ')}. Payload received but not persisted. Client will fall back to localStorage.`,
      { email: payload.email, band: payload.scorecard.band, score: payload.scorecard.normalisedScore },
    );
    // Return 200 so the client shows success — the lead is stored locally until we wire secrets.
    return jsonResponse(200, {
      ok: true,
      stored: 'env_missing_logged_only',
      missing,
    });
  }

  // ───── Write to Supabase ─────
  let insertedId: string | null = null;
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const { data, error } = await supabase
      .from('scorecard_responses')
      .insert({
        email: payload.email.toLowerCase(),
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
        submitted_at: payload.submittedAt ?? new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    insertedId = data.id;
  } catch (err) {
    console.error('[scorecard-submit] Supabase insert failed', err);
    // Don't fail — still try to send email. Client has localStorage backup.
  }

  // ───── Send immediate email via Resend ─────
  try {
    const resend = new Resend(RESEND_KEY!);
    const html = immediateReportHtml(payload);
    const text = immediateReportText(payload);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject: `Your AI Strategy Gap score: ${payload.scorecard.band}`,
      html,
      text,
      tags: [
        { name: 'type', value: 'scorecard_immediate' },
        { name: 'band', value: payload.scorecard.band },
      ],
    });
  } catch (err) {
    console.error('[scorecard-submit] Resend email failed', err);
    // Don't fail — record is in Supabase. We can retry via n8n.
  }

  return jsonResponse(200, { ok: true, id: insertedId });
};

// ─────────────────────────────────────────────────
// Email templates — keep inline to avoid runtime file I/O.
// Day 1/3/5/7/14 templates live in /emails/templates/ for n8n to read.
// ─────────────────────────────────────────────────

function immediateReportHtml(p: Payload): string {
  const name = p.firstName ? `Hi ${p.firstName},` : 'Hi,';
  const band = p.scorecard.band;
  const score = p.scorecard.normalisedScore;

  return `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; color: #111; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin: 0 0 8px;">AI IMPACT SYSTEM</p>
  <h1 style="font-size: 28px; margin: 0 0 20px; line-height: 1.2;">Your AI Strategy Gap score: <strong>${score}/100 — ${band}</strong></h1>

  <p>${name}</p>

  <p>Your full report is on the link below. It names the 2-3 pillars where you're carrying the most risk. It does not tell you how to fix them — that's what the Diagnostic Call is for.</p>

  <p style="margin: 24px 0;">
    <a href="https://aiimpactsystem.com/audit/result" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;">View full report →</a>
  </p>

  <p>I run 4 free Diagnostic Calls per month. 30 minutes, me, your real data. You leave with a one-page summary of where the money is going and one recommendation.</p>

  <p style="margin: 24px 0;">
    <a href="https://cal.com/marton-gaspar/diagnostic-call" style="display: inline-block; background: transparent; color: #6366f1; text-decoration: none; padding: 12px 20px; border-radius: 6px; border: 1px solid #6366f1; font-weight: 600;">Book the Diagnostic Call →</a>
  </p>

  <p>Marton</p>

  <p style="font-size: 13px; color: #666; margin-top: 32px;">P.S. If the score felt surprising, it's usually because the gap has been invisible. That's the point.</p>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #888;">
    You got this email because you completed the AI Strategy Gap Audit at aiimpactsystem.com/audit.<br>
    Unsubscribe any time by replying with "unsubscribe".
  </p>
</body>
</html>`;
}

function immediateReportText(p: Payload): string {
  const name = p.firstName ? `Hi ${p.firstName},` : 'Hi,';
  return `Your AI Strategy Gap score: ${p.scorecard.normalisedScore}/100 — ${p.scorecard.band}

${name}

Your full report is on the link below. It names the 2-3 pillars where you're carrying the most risk. It does not tell you how to fix them — that's what the Diagnostic Call is for.

View full report: https://aiimpactsystem.com/audit/result

I run 4 free Diagnostic Calls per month. 30 minutes, me, your real data. You leave with a one-page summary of where the money is going and one recommendation.

Book the Diagnostic Call: https://cal.com/marton-gaspar/diagnostic-call

Marton

P.S. If the score felt surprising, it's usually because the gap has been invisible. That's the point.

---
You got this email because you completed the AI Strategy Gap Audit at aiimpactsystem.com/audit.
Unsubscribe any time by replying with "unsubscribe".
`;
}
