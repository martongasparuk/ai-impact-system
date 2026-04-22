// Netlify Function: POST /api/scorecard-email
// Called by n8n drip scheduler with { email, firstName, band, score, weakestPillar, template }
// Renders the requested template and sends via Resend.
// Protected by X-Scorecard-Drip-Token header (set in both Netlify env + n8n credentials).

import type { Handler } from '@netlify/functions';
import { templates, type TemplateKey, type LeadData } from '../../emails/templates';
import {
  SITE_ORIGIN,
  unsubscribeUrlFor,
  exportUrlFor,
  eraseUrlFor,
  newRequestId,
} from './_lib/common';
import { getSupabaseServiceClient } from './_lib/supabase-client';
import { getResendClient } from './_lib/resend-client';

type Payload = {
  template: TemplateKey;
  email: string;
  firstName?: string;
  band: LeadData['band'];
  score: number;
  weakestPillar?: string;
};

const json = (status: number, body: unknown, requestId: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  const requestId = newRequestId();

  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, requestId);

  const authToken = process.env.SCORECARD_DRIP_TOKEN;
  const provided = event.headers['x-scorecard-drip-token'] ?? event.headers['X-Scorecard-Drip-Token'];
  if (!authToken || provided !== authToken) {
    return json(401, { error: 'Unauthorised' }, requestId);
  }

  let payload: Payload;
  try {
    payload = JSON.parse(event.body ?? '{}') as Payload;
  } catch {
    return json(400, { error: 'Invalid JSON' }, requestId);
  }

  const tpl = templates[payload.template];
  if (!tpl) return json(400, { error: `Unknown template: ${payload.template}` }, requestId);
  if (!payload.email?.includes('@')) return json(400, { error: 'Valid email required' }, requestId);

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Marton Gaspar <marton@aiimpactsystem.com>';
  const POSTAL_ADDRESS =
    process.env.POSTAL_ADDRESS ?? 'Marton Gaspar, London, United Kingdom';
  if (!RESEND_KEY) {
    console.warn(`[scorecard-email ${requestId}] RESEND_API_KEY missing, email dropped`, {
      email: payload.email,
      template: payload.template,
    });
    return json(200, { ok: true, stored: 'env_missing', requestId }, requestId);
  }

  // ───── Suppression check + drip-consent check ─────
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('scorecard_responses')
        .select('unsubscribed_at, drip_consent')
        .eq('email', payload.email.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      const row = data?.[0];
      if (row?.unsubscribed_at) {
        return json(200, { ok: true, suppressed: 'unsubscribed', requestId }, requestId);
      }
      if (row && row.drip_consent === false) {
        return json(200, { ok: true, suppressed: 'no_drip_consent', requestId }, requestId);
      }
    } catch (err) {
      console.error(`[scorecard-email ${requestId}] suppression check failed, proceeding`, err);
    }
  }

  const unsubSecret = process.env.UNSUBSCRIBE_SECRET;
  const unsubUrl = unsubSecret ? unsubscribeUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/audit`;
  const exportUrl = unsubSecret ? exportUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/privacy.html`;
  const eraseUrl = unsubSecret ? eraseUrlFor(payload.email, unsubSecret) : `${SITE_ORIGIN}/privacy.html`;

  const { subject, html, text } = tpl({
    firstName: payload.firstName,
    band: payload.band,
    score: payload.score,
    weakestPillar: payload.weakestPillar,
    calUrl: process.env.VITE_CAL_URL ?? 'https://cal.com/marton-gaspar/diagnostic-call',
    unsubscribeUrl: unsubUrl,
    exportUrl,
    eraseUrl,
    postalAddress: POSTAL_ADDRESS,
  });

  try {
    const resend = getResendClient()!;
    const headers: Record<string, string> = {};
    if (unsubSecret) {
      headers['List-Unsubscribe'] = `<${unsubUrl}>, <mailto:unsubscribe@aiimpactsystem.com?subject=unsubscribe>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject,
      html,
      text,
      headers,
      tags: [
        { name: 'type', value: 'scorecard_drip' },
        { name: 'template', value: payload.template },
        { name: 'band', value: payload.band },
      ],
    });
    return json(200, { ok: true, template: payload.template, requestId }, requestId);
  } catch (err) {
    console.error(`[scorecard-email ${requestId}] Resend failed`, err);
    return json(500, { error: 'Send failed', requestId }, requestId);
  }
};
