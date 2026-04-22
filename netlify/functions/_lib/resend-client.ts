// Memoized Resend client for Netlify Functions.
// Fluid Compute reuses function instances across warm invocations (PERF-14).
// Constructing once at module scope removes ~20ms and a TLS handshake per warm request.

import { Resend } from 'resend';

let cached: Resend | null = null;
let cachedKey: string | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached && cachedKey === key) return cached;
  cached = new Resend(key);
  cachedKey = key;
  return cached;
}
