// Immediate "here is your score" email sent by /api/scorecard-submit.
// Kept separate so the function handler stays focused on HTTP + storage.

import { SITE_ORIGIN, escapeHtml } from './common';
import { getResendClient } from './resend-client';

export type ImmediateReportInput = {
  firstName?: string;
  email: string;
  band: 'Exposed' | 'Reactive' | 'Directional' | 'Compounding';
  normalisedScore: number;
  unsubUrl: string;
  exportUrl: string;
  eraseUrl: string;
  postal: string;
  includeListUnsubscribeHeaders: boolean;
};

export function renderImmediateReportHtml(p: ImmediateReportInput): string {
  const name = p.firstName ? `Hi ${escapeHtml(p.firstName)},` : 'Hi,';
  const band = escapeHtml(p.band);

  return `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; color: #111; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin: 0 0 8px;">AI IMPACT SYSTEM</p>
  <h1 style="font-size: 28px; margin: 0 0 20px; line-height: 1.2;">Your AI Strategy Gap score: <strong>${p.normalisedScore}/100, ${band}</strong></h1>

  <p>${name}</p>

  <p>Your full report is on the link below. It names the 2-3 pillars where you are carrying the most risk. It does not tell you how to fix them. That is what the Diagnostic Call is for.</p>

  <p style="margin: 24px 0;">
    <a href="${SITE_ORIGIN}/audit/result" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;">View full report →</a>
  </p>

  <p>I run 4 free Diagnostic Calls per month. 30 minutes, me, your real data. You leave with a one-page summary of where the money is going and one recommendation.</p>

  <p style="margin: 24px 0;">
    <a href="https://cal.com/marton-gaspar/diagnostic-call" style="display: inline-block; background: transparent; color: #6366f1; text-decoration: none; padding: 12px 20px; border-radius: 6px; border: 1px solid #6366f1; font-weight: 600;">Book the Diagnostic Call →</a>
  </p>

  <p>Marton</p>

  <p style="font-size: 13px; color: #666; margin-top: 32px;">P.S. If the score felt surprising, it is usually because the gap has been invisible. That is the point.</p>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #888;">
    You got this email because you completed the AI Strategy Gap Audit at aiimpactsystem.com/audit.<br>
    <a href="${p.unsubUrl}" style="color: #888;">Unsubscribe</a>
    &nbsp;·&nbsp; <a href="${p.exportUrl}" style="color: #888;">Download my data</a>
    &nbsp;·&nbsp; <a href="${p.eraseUrl}" style="color: #888;">Delete my data</a><br>
    ${escapeHtml(p.postal)}
  </p>
</body>
</html>`;
}

export function renderImmediateReportText(p: ImmediateReportInput): string {
  const name = p.firstName ? `Hi ${p.firstName},` : 'Hi,';
  return `Your AI Strategy Gap score: ${p.normalisedScore}/100, ${p.band}

${name}

Your full report is on the link below. It names the 2-3 pillars where you are carrying the most risk. It does not tell you how to fix them. That is what the Diagnostic Call is for.

View full report: ${SITE_ORIGIN}/audit/result

I run 4 free Diagnostic Calls per month. 30 minutes, me, your real data. You leave with a one-page summary of where the money is going and one recommendation.

Book the Diagnostic Call: https://cal.com/marton-gaspar/diagnostic-call

Marton

P.S. If the score felt surprising, it is usually because the gap has been invisible. That is the point.

---
You got this email because you completed the AI Strategy Gap Audit at aiimpactsystem.com/audit.
Unsubscribe: ${p.unsubUrl}
Download my data: ${p.exportUrl}
Delete my data: ${p.eraseUrl}

${p.postal}
`;
}

export async function sendImmediateReport(
  _resendKey: string,
  fromEmail: string,
  p: ImmediateReportInput,
): Promise<void> {
  // Module-scoped memoized client (PERF-14). _resendKey kept for signature
  // stability but sourced from process.env inside getResendClient().
  const resend = getResendClient();
  if (!resend) throw new Error('RESEND_API_KEY not configured');
  const headers: Record<string, string> = {};
  if (p.includeListUnsubscribeHeaders) {
    headers['List-Unsubscribe'] = `<${p.unsubUrl}>, <mailto:unsubscribe@aiimpactsystem.com?subject=unsubscribe>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }
  await resend.emails.send({
    from: fromEmail,
    to: p.email,
    subject: `Your AI Strategy Gap score: ${p.band}`,
    html: renderImmediateReportHtml(p),
    text: renderImmediateReportText(p),
    headers,
    tags: [
      { name: 'type', value: 'scorecard_immediate' },
      { name: 'band', value: p.band },
    ],
  });
}
