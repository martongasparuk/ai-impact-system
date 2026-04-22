// Netlify Function: GET/POST /api/scorecard-unsubscribe?email=...&t=...
// Handles List-Unsubscribe clicks AND Gmail/Yahoo one-click POST (RFC 8058).
// Token is HMAC-SHA256(email, UNSUBSCRIBE_SECRET) hex, no expiry, stable per email.

import type { Handler } from '@netlify/functions';
import { hmacToken, tokensMatch, newRequestId } from './_lib/common';
import { getSupabaseServiceClient } from './_lib/supabase-client';

const htmlResponse = (status: number, body: string, requestId: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Request-Id': requestId },
  body,
});

const page = (title: string, message: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:480px;margin:80px auto;padding:24px;line-height:1.6}h1{font-size:22px;margin:0 0 16px}p{color:#444}</style></head><body><h1>${title}</h1><p>${message}</p><p style="margin-top:24px"><a href="https://aiimpactsystem.com" style="color:#6366f1">Back to aiimpactsystem.com</a></p></body></html>`;

export const handler: Handler = async (event) => {
  const requestId = newRequestId();

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return htmlResponse(405, page('Method not allowed', 'Use GET or POST.'), requestId);
  }

  const qs = event.queryStringParameters ?? {};
  let email = (qs.email ?? '').toString().toLowerCase().trim();
  let token = (qs.t ?? '').toString().trim();

  if (event.httpMethod === 'POST' && (!email || !token) && event.body) {
    const params = new URLSearchParams(event.body);
    email = email || (params.get('email') ?? '').toLowerCase().trim();
    token = token || (params.get('t') ?? '').trim();
  }

  if (!email || !email.includes('@') || !token) {
    return htmlResponse(400, page('Link incomplete', 'This unsubscribe link is missing its email or token.'), requestId);
  }

  const SECRET = process.env.UNSUBSCRIBE_SECRET;
  const SUPABASE_URL = process.env.SCORECARD_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;

  if (!SECRET) {
    console.error(`[scorecard-unsubscribe ${requestId}] UNSUBSCRIBE_SECRET not configured`);
    return htmlResponse(500, page('Server misconfigured', 'Please email marton@aiimpactsystem.com to unsubscribe.'), requestId);
  }

  if (!tokensMatch(hmacToken(email, SECRET), token)) {
    return htmlResponse(400, page('Link invalid', 'This unsubscribe link is not valid. Please email marton@aiimpactsystem.com and we will remove you manually.'), requestId);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(`[scorecard-unsubscribe ${requestId}] supabase env missing, accepted but not persisted`, { email });
    return htmlResponse(200, page('Unsubscribed', 'You will not receive further emails. Please allow a few minutes for this to propagate.'), requestId);
  }

  try {
    const supabase = getSupabaseServiceClient()!;
    const { error } = await supabase
      .from('scorecard_responses')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email)
      .is('unsubscribed_at', null);
    if (error) throw error;
  } catch (err) {
    console.error(`[scorecard-unsubscribe ${requestId}] supabase update failed`, err);
    return htmlResponse(500, page('Something went wrong', 'We could not save your preference. Please email marton@aiimpactsystem.com and we will remove you manually.'), requestId);
  }

  return htmlResponse(200, page('Unsubscribed', 'You will not receive further emails from the AI Strategy Gap Audit sequence. If this was a mistake, reply to any prior email.'), requestId);
};
