// Netlify Function: GET/POST /api/scorecard-erase?email=...&t=...
// Satisfies UK GDPR Art. 17 (right to erasure).
// GET renders a confirm page; POST performs the delete.

import type { Handler } from '@netlify/functions';
import { hmacToken, tokensMatch, newRequestId } from './_lib/common';
import { getSupabaseServiceClient } from './_lib/supabase-client';

const htmlResponse = (status: number, body: string, requestId: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Request-Id': requestId },
  body,
});

const page = (title: string, bodyHtml: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:480px;margin:80px auto;padding:24px;line-height:1.6}h1{font-size:22px;margin:0 0 16px}p{color:#444}button{background:#e11d48;color:white;border:0;padding:10px 16px;border-radius:6px;font-weight:600;cursor:pointer}a{color:#6366f1}</style></head><body><h1>${title}</h1>${bodyHtml}</body></html>`;

export const handler: Handler = async (event) => {
  const requestId = newRequestId();

  const qs = event.queryStringParameters ?? {};
  const email = (qs.email ?? '').toString().toLowerCase().trim();
  const token = (qs.t ?? '').toString().trim();

  if (!email || !email.includes('@') || !token) {
    return htmlResponse(400, page('Link incomplete', '<p>Missing email or token.</p>'), requestId);
  }

  const SECRET = process.env.UNSUBSCRIBE_SECRET;
  const SUPABASE_URL = process.env.SCORECARD_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SCORECARD_SUPABASE_SERVICE_ROLE_KEY;

  if (!SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error(`[scorecard-erase ${requestId}] env missing`);
    return htmlResponse(500, page('Server misconfigured', '<p>Please email marton@aiimpactsystem.com to request deletion.</p>'), requestId);
  }

  if (!tokensMatch(hmacToken(email, SECRET), token)) {
    return htmlResponse(400, page('Link invalid', '<p>This link is not valid. Please email marton@aiimpactsystem.com to request deletion.</p>'), requestId);
  }

  if (event.httpMethod === 'GET') {
    const action = `/api/scorecard-erase?email=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;
    return htmlResponse(
      200,
      page(
        'Confirm deletion',
        `<p>You are about to permanently delete every scorecard response associated with <strong>${email.replace(/[<>&]/g, '')}</strong>. This cannot be undone.</p><form method="POST" action="${action}"><button type="submit">Delete my data</button> <a href="/" style="margin-left:12px">Cancel</a></form><p style="margin-top:24px;font-size:13px;color:#888">If you only want to stop emails, use the Unsubscribe link instead.</p>`,
      ),
      requestId,
    );
  }

  if (event.httpMethod !== 'POST') {
    return htmlResponse(405, page('Method not allowed', '<p>Use GET or POST.</p>'), requestId);
  }

  try {
    const supabase = getSupabaseServiceClient()!;
    const { error, count } = await supabase
      .from('scorecard_responses')
      .delete({ count: 'exact' })
      .eq('email', email);
    if (error) throw error;
    console.info(`[scorecard-erase ${requestId}] deleted ${count ?? 0} rows for ${email}`);
  } catch (err) {
    console.error(`[scorecard-erase ${requestId}] supabase delete failed`, err);
    return htmlResponse(500, page('Deletion failed', '<p>We could not complete the deletion. Please email marton@aiimpactsystem.com and we will handle it manually.</p>'), requestId);
  }

  return htmlResponse(
    200,
    page(
      'Deleted',
      '<p>All scorecard responses associated with your email have been permanently removed. You will not receive further emails.</p>',
    ),
    requestId,
  );
};
