// AI Impact Scorecard — drip sequence templates
// Each template exports: subject, html, text as functions of lead data.
// Used by: netlify/functions/scorecard-email.ts (when n8n calls it) and by any other sender.

export type LeadData = {
  firstName?: string;
  band: 'Exposed' | 'Reactive' | 'Directional' | 'Compounding';
  score: number;
  weakestPillar?: string;
  calUrl?: string;
  unsubscribeUrl?: string;
  exportUrl?: string;
  eraseUrl?: string;
  postalAddress?: string;
};

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"'/]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' })[c]!,
  );

const defaults = (d: LeadData) => ({
  nameHtml: d.firstName ? `Hi ${escapeHtml(d.firstName)},` : 'Hi,',
  nameText: d.firstName ? `Hi ${d.firstName},` : 'Hi,',
  band: escapeHtml(d.band),
  bandText: d.band,
  score: d.score,
  weakPillarHtml: escapeHtml(d.weakestPillar ?? 'Agree'),
  weakPillarText: d.weakestPillar ?? 'Agree',
  cal: d.calUrl ?? 'https://cal.com/marton-gaspar/diagnostic-call',
  report: 'https://aiimpactsystem.com/audit/result',
  unsubscribe: d.unsubscribeUrl ?? 'https://aiimpactsystem.com/audit',
  exportUrl: d.exportUrl ?? 'https://aiimpactsystem.com/privacy.html',
  eraseUrl: d.eraseUrl ?? 'https://aiimpactsystem.com/privacy.html',
  postal: escapeHtml(d.postalAddress ?? 'Marton Gaspar, London, United Kingdom'),
  postalText: d.postalAddress ?? 'Marton Gaspar, London, United Kingdom',
});

type Footer = { unsub: string; exportUrl: string; eraseUrl: string; postal: string };

const wrap = (bodyHtml: string, f: Footer) => `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto;padding:24px;">
<p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#666;margin:0 0 8px;">AI IMPACT SYSTEM</p>
${bodyHtml}
<hr style="margin:32px 0;border:none;border-top:1px solid #eee;">
<p style="font-size:12px;color:#888;">You got this email because you completed the AI Strategy Gap Audit at aiimpactsystem.com/audit.<br>
<a href="${f.unsub}" style="color:#888;">Unsubscribe</a> &middot; <a href="${f.exportUrl}" style="color:#888;">Download my data</a> &middot; <a href="${f.eraseUrl}" style="color:#888;">Delete my data</a><br>
${f.postal}</p>
</body></html>`;

const footerText = (f: { unsub: string; exportUrl: string; eraseUrl: string; postal: string }) => `

Unsubscribe: ${f.unsub}
Download my data: ${f.exportUrl}
Delete my data: ${f.eraseUrl}

${f.postal}`;

// ═══════════════════════════════════════════════
// Day 1. The one pillar that costs most
// ═══════════════════════════════════════════════
export const day1 = (d: LeadData) => {
  const v = defaults(d);
  const subject = `The one pillar that costs most companies the most`;
  const html = wrap(`
<p>${v.nameHtml}</p>
<p>Looking at your score on <strong>${v.weakPillarHtml}</strong>, here is what I see in companies at your band:</p>
<p>Most ${v.band} organisations have 2-4 AI initiatives that cannot explain what they return in a board meeting. Usually one of them is genuinely working. The others are quietly spending money.</p>
<p>The pattern is consistent. The fix is specific to your situation. That is what the Diagnostic Call is for.</p>
<p style="margin:24px 0;"><a href="${v.cal}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Book the Diagnostic Call →</a></p>
<p>Marton</p>`, { unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postal });
  const text = `${v.nameText}

Looking at your score on ${v.weakPillarText}, here is what I see in companies at your band:

Most ${v.bandText} organisations have 2-4 AI initiatives that cannot explain what they return in a board meeting. Usually one of them is genuinely working. The others are quietly spending money.

The pattern is consistent. The fix is specific to your situation. That is what the Diagnostic Call is for.

Book the Diagnostic Call: ${v.cal}

Marton${footerText({ unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postalText })}`;
  return { subject, html, text };
};

// ═══════════════════════════════════════════════
// Day 3. What happens in a Diagnostic Call
// ═══════════════════════════════════════════════
export const day3 = (d: LeadData) => {
  const v = defaults(d);
  const subject = `What actually happens in a Diagnostic Call`;
  const html = wrap(`
<p>${v.nameHtml}</p>
<p>In case it helps, here is exactly what the 30-minute Diagnostic Call is:</p>
<ol>
  <li>I ask three questions about your AI spend.</li>
  <li>You talk. I listen and take notes.</li>
  <li>I tell you what I am seeing, not what I think you want to hear.</li>
  <li>You leave with a one-page AI Decision Summary in 24 hours.</li>
</ol>
<p>No pitch on the call. If what I say is useful, the Intensive is there. If not, the summary is yours to keep.</p>
<p style="margin:24px 0;"><a href="${v.cal}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Book the Diagnostic Call →</a></p>
<p>Marton</p>`, { unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postal });
  const text = `${v.nameText}

In case it helps, here is exactly what the 30-minute Diagnostic Call is:

1. I ask three questions about your AI spend.
2. You talk. I listen and take notes.
3. I tell you what I am seeing, not what I think you want to hear.
4. You leave with a one-page AI Decision Summary in 24 hours.

No pitch on the call. If what I say is useful, the Intensive is there. If not, the summary is yours to keep.

Book the Diagnostic Call: ${v.cal}

Marton${footerText({ unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postalText })}`;
  return { subject, html, text };
};

// ═══════════════════════════════════════════════
// Day 5. Story: what killing AI initiatives looks like
// ═══════════════════════════════════════════════
export const day5 = (d: LeadData) => {
  const v = defaults(d);
  const subject = `The AI initiative most boards should kill`;
  const html = wrap(`
<p>${v.nameHtml}</p>
<p>At EY I sat in a room with 60+ senior partners on their AI strategy. Most of them had more pilots than focus. The ones who won were always the ones cutting the list, not adding to it.</p>
<p>Most people think AI strategy is about what you add. In a ${v.band} organisation, it is almost always about what you stop.</p>
<p>This is the muscle the AI Strategy Intensive builds. 1-3 bets sized in real pounds. A stop list. A 90-day plan your board can actually read.</p>
<p style="margin:24px 0;"><a href="${v.cal}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Book the Diagnostic Call →</a></p>
<p>Marton</p>`, { unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postal });
  const text = `${v.nameText}

At EY I sat in a room with 60+ senior partners on their AI strategy. Most of them had more pilots than focus. The ones who won were always the ones cutting the list, not adding to it.

Most people think AI strategy is about what you add. In a ${v.bandText} organisation, it is almost always about what you stop.

This is the muscle the AI Strategy Intensive builds. 1-3 bets sized in real pounds. A stop list. A 90-day plan your board can actually read.

Book the Diagnostic Call: ${v.cal}

Marton${footerText({ unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postalText })}`;
  return { subject, html, text };
};

// ═══════════════════════════════════════════════
// Day 7. Scarcity nudge
// ═══════════════════════════════════════════════
export const day7 = (d: LeadData) => {
  const v = defaults(d);
  const subject = `3 slots left this month`;
  const html = wrap(`
<p>${v.nameHtml}</p>
<p>Quick update. I have 3 Diagnostic Call slots left this month. First come, first served.</p>
<p>If the timing is not right, reply to this email and I will hold a slot for next month.</p>
<p style="margin:24px 0;"><a href="${v.cal}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Book the Diagnostic Call →</a></p>
<p>Marton</p>`, { unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postal });
  const text = `${v.nameText}

Quick update. I have 3 Diagnostic Call slots left this month. First come, first served.

If the timing is not right, reply to this email and I will hold a slot for next month.

Book the Diagnostic Call: ${v.cal}

Marton${footerText({ unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postalText })}`;
  return { subject, html, text };
};

// ═══════════════════════════════════════════════
// Day 14. Wind-down
// ═══════════════════════════════════════════════
export const day14 = (d: LeadData) => {
  const v = defaults(d);
  const subject = `Should I stop emailing you?`;
  const html = wrap(`
<p>${v.nameHtml}</p>
<p>Two weeks since your AI Strategy Gap score. I have sent five emails. I do not want to be the person still in your inbox in six months.</p>
<p>Three options:</p>
<ul>
  <li><a href="${v.cal}" style="color:#6366f1;">Book a Diagnostic Call</a></li>
  <li>Reply with "not now" and I will mute for 90 days</li>
  <li><a href="${v.unsubscribe}" style="color:#6366f1;">Unsubscribe</a>. No hard feelings.</li>
</ul>
<p>Marton</p>`, { unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postal });
  const text = `${v.nameText}

Two weeks since your AI Strategy Gap score. I have sent five emails. I do not want to be the person still in your inbox in six months.

Three options:
- Book a Diagnostic Call: ${v.cal}
- Reply with "not now" and I will mute for 90 days
- Unsubscribe: ${v.unsubscribe}

Marton${footerText({ unsub: v.unsubscribe, exportUrl: v.exportUrl, eraseUrl: v.eraseUrl, postal: v.postalText })}`;
  return { subject, html, text };
};

// ═══════════════════════════════════════════════
// Template registry
// ═══════════════════════════════════════════════
export const templates = {
  day1,
  day3,
  day5,
  day7,
  day14,
} as const;

export type TemplateKey = keyof typeof templates;
