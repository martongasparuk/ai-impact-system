// Netlify Function: GET /api/scorecard-export?email=...&t=...
// Satisfies UK GDPR Art. 15 (right of access) + Art. 20 (data portability).
// Same HMAC token scheme as unsubscribe. Returns JSON download of all rows for the email.

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

  if (event.httpMethod !== 'GET') {
    return htmlResponse(405, page('Method not allowed', 'Use GET.'), requestId);
  }

  const qs = event.queryStringParameters ?? {};
  const email = (qs.email ?? '').toString().toLowerCase().trim();
  const token = (qs.t ?? '').toString().trim();

  if (!email || !email.includes('@') || !token) {
    return htmlResponse(400, page('Link incomplete', 'Missing email or token.'), requestId);
  }

  const SECRET = process.env.UNSUBSCRIBE_SECRET;
  const SUPABASE_URL = process.env.SCORECARD_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;

  if (!SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error(`[scorecard-export ${requestId}] env missing`);
    return htmlResponse(500, page('Server misconfigured', 'Please email marton@aiimpactsystem.com for a manual export.'), requestId);
  }

  if (!tokensMatch(hmacToken(email, SECRET), token)) {
    return htmlResponse(400, page('Link invalid', 'This link is not valid. Please email marton@aiimpactsystem.com for a manual export.'), requestId);
  }

  try {
    const supabase = getSupabaseServiceClient()!;
    const { data, error } = await supabase
      .from('scorecard_responses')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const payload = {
      email,
      exportedAt: new Date().toISOString(),
      records: data ?? [],
      note:
        'This file contains every scorecard submission associated with your email address, plus any associated metadata we hold.',
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="aiimpactsystem-export-${email}.json"`,
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(payload, null, 2),
    };
  } catch (err) {
    console.error(`[scorecard-export ${requestId}] supabase query failed`, err);
    return htmlResponse(500, page('Export failed', 'Please email marton@aiimpactsystem.com and we will send a manual copy.'), requestId);
  }
};
