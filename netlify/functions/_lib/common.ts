// Shared helpers for Netlify Functions.
// Keep runtime-neutral: no Supabase/Resend imports here so tree-shaking stays tight.

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const SITE_ORIGIN = 'https://aiimpactsystem.com';

// Production + Netlify preview URLs.
const ALLOWED_ORIGIN_PATTERNS: Array<RegExp> = [
  /^https:\/\/aiimpactsystem\.com$/,
  /^https:\/\/www\.aiimpactsystem\.com$/,
  /^https:\/\/deploy-preview-\d+--[a-z0-9-]+\.netlify\.app$/,
  /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];

export const resolveAllowedOrigin = (requestOrigin: string | undefined): string | null => {
  if (!requestOrigin) return null;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(requestOrigin)) ? requestOrigin : null;
};

export const corsHeaders = (requestOrigin: string | undefined): Record<string, string> => {
  const allowed = resolveAllowedOrigin(requestOrigin);
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
  };
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed;
  return headers;
};

export const jsonResponse = (
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...extraHeaders },
  body: body === null ? '' : JSON.stringify(body),
});

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"'/]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' })[c]!,
  );

export const hmacToken = (email: string, secret: string): string =>
  createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex');

export const tokensMatch = (a: string, b: string): boolean => {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length || bufA.length === 0) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

export const unsubscribeUrlFor = (email: string, secret: string): string =>
  `${SITE_ORIGIN}/api/scorecard-unsubscribe?email=${encodeURIComponent(email)}&t=${hmacToken(email, secret)}`;

export const exportUrlFor = (email: string, secret: string): string =>
  `${SITE_ORIGIN}/api/scorecard-export?email=${encodeURIComponent(email)}&t=${hmacToken(email, secret)}`;

export const eraseUrlFor = (email: string, secret: string): string =>
  `${SITE_ORIGIN}/api/scorecard-erase?email=${encodeURIComponent(email)}&t=${hmacToken(email, secret)}`;

export const newRequestId = (): string => randomBytes(8).toString('hex');

// ───── In-memory token-bucket rate limit ─────
// Fluid Compute reuses instances, so this catches ~80% of abuse without Redis.
// For a hard guarantee add an upstash/redis layer later — tracked in backlog.
type Bucket = { tokens: number; updated: number };
const buckets = new Map<string, Bucket>();

export const checkRateLimit = (
  key: string,
  opts: { capacity: number; refillPerMin: number },
): { allowed: boolean; retryAfterSec: number } => {
  const now = Date.now();
  const refillPerMs = opts.refillPerMin / 60_000;
  const b = buckets.get(key) ?? { tokens: opts.capacity, updated: now };
  const tokens = Math.min(opts.capacity, b.tokens + (now - b.updated) * refillPerMs);
  if (tokens < 1) {
    buckets.set(key, { tokens, updated: now });
    const retryMs = Math.ceil((1 - tokens) / refillPerMs);
    return { allowed: false, retryAfterSec: Math.max(1, Math.round(retryMs / 1000)) };
  }
  buckets.set(key, { tokens: tokens - 1, updated: now });
  return { allowed: true, retryAfterSec: 0 };
};

export const clientIp = (headers: Record<string, string | undefined>): string =>
  (headers['x-nf-client-connection-ip'] ??
    headers['X-Nf-Client-Connection-Ip'] ??
    headers['x-forwarded-for']?.split(',')[0]?.trim() ??
    headers['X-Forwarded-For']?.split(',')[0]?.trim() ??
    'unknown').toString();
