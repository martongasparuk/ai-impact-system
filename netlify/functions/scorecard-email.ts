// Netlify Function: POST /api/scorecard-email
// Called by n8n drip scheduler with { email, firstName, band, score, weakestPillar, template }
// Renders the requested template and sends via Resend.
// Protected by X-Scorecard-Drip-Token header (set in both Netlify env + n8n credentials).

import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';
import { templates, type TemplateKey, type LeadData } from '../../emails/templates';

type Payload = {
  template: TemplateKey;
  email: string;
  firstName?: string;
  band: LeadData['band'];
  score: number;
  weakestPillar?: string;
};

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const authToken = process.env.SCORECARD_DRIP_TOKEN;
  const provided = event.headers['x-scorecard-drip-token'] ?? event.headers['X-Scorecard-Drip-Token'];
  if (!authToken || provided !== authToken) {
    return json(401, { error: 'Unauthorised' });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(event.body ?? '{}') as Payload;
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const tpl = templates[payload.template];
  if (!tpl) return json(400, { error: `Unknown template: ${payload.template}` });
  if (!payload.email?.includes('@')) return json(400, { error: 'Valid email required' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Marton Gaspar <marton@aiimpactsystem.com>';
  if (!RESEND_KEY) {
    console.warn('[scorecard-email] RESEND_API_KEY missing, email dropped', {
      email: payload.email,
      template: payload.template,
    });
    return json(200, { ok: true, stored: 'env_missing' });
  }

  const { subject, html, text } = tpl({
    firstName: payload.firstName,
    band: payload.band,
    score: payload.score,
    weakestPillar: payload.weakestPillar,
    calUrl: process.env.VITE_CAL_URL ?? 'https://cal.com/marton-gaspar/diagnostic-call',
  });

  try {
    const resend = new Resend(RESEND_KEY);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject,
      html,
      text,
      tags: [
        { name: 'type', value: 'scorecard_drip' },
        { name: 'template', value: payload.template },
        { name: 'band', value: payload.band },
      ],
    });
    return json(200, { ok: true, template: payload.template });
  } catch (err) {
    console.error('[scorecard-email] Resend failed', err);
    return json(500, { error: 'Send failed' });
  }
};
