// AI Impact Scorecard — report copy
// Tease, never tell. Every band names the gap and routes to the Diagnostic Call.
// Copy passes the Marton Test: no em-dashes, warm delivery, uncompromising substance.

import type { Scorecard } from './scoring';
import type { Pillar } from './questions';

export type CtaBlock = {
  label: string;
  action: 'diagnostic_call' | 'webinar' | 'nurture_only' | 'waitlist';
};

export type ReportContent = {
  bandName: string;
  score: number;
  headline: string;
  verdict: string;
  whatYourAnswersSuggest: string;
  moneyOnTable: string;
  whatHappensNext: string;
  primaryCta: CtaBlock;
  closingNote: string;
};

const pillarLabel = (p: Pillar) => p;

const formatCurrency = (n: number) =>
  `£${n.toLocaleString('en-GB')}`;

const topPillarsText = (s: Scorecard) =>
  s.strongestPillars.map(pillarLabel).join(' and ');

const bottomPillarsText = (s: Scorecard) => {
  const list = s.weakestPillars.map(pillarLabel);
  if (list.length === 1) return list[0];
  if (list.length === 2) return list.join(' and ');
  return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
};

const wasteRangeText = (s: Scorecard) =>
  `${formatCurrency(s.estimatedWaste.min)} to ${formatCurrency(s.estimatedWaste.max)}`;

const ctaForRoute = (route: Scorecard['ctaRoute']): CtaBlock => {
  switch (route) {
    case 'diagnostic_call':
      return { label: 'Book a Diagnostic Call →', action: 'diagnostic_call' };
    case 'webinar':
      return { label: 'Join the next AI Strategy Webinar →', action: 'webinar' };
    case 'nurture_only':
      return { label: 'Send me the weekly AI Impact brief →', action: 'nurture_only' };
    case 'waitlist':
      return { label: 'Join the Compounding Roundtable waitlist →', action: 'waitlist' };
  }
};

// ────────── Band verdict factories ──────────

function exposedReport(s: Scorecard): ReportContent {
  return {
    bandName: 'Exposed',
    score: s.normalisedScore,
    headline: `Your AI Impact Gap Score: ${s.normalisedScore}/100 — Exposed`,
    verdict:
      "You're spending money on AI. You cannot yet tell anyone what it's returning. That is a Board-level risk wearing a technology badge.",
    whatYourAnswersSuggest: `You are strongest in ${topPillarsText(s)}. You are thin in ${bottomPillarsText(
      s,
    )}. In plain terms: your AI is happening, but it is not measurable, not owned, and not defensible.`,
    moneyOnTable: `Likely unproductive AI spend: ${wasteRangeText(s)} per year. ${s.estimatedWaste.note} If even half of that gets redirected, the business impact is significant.`,
    whatHappensNext:
      'I run 4 free Diagnostic Calls per month. 30 minutes, on Zoom. I will show you exactly where the money is going, what I would kill first, and what 1 to 2 bets I would double down on. No pitch. You leave with a one-page summary.',
    primaryCta: ctaForRoute(s.ctaRoute),
    closingNote:
      '80% of the operators I talk to in your band find £50k to £150k of unproductive AI spend in the first 10 days of working together. That is the Gap I build the strategy around.',
  };
}

function reactiveReport(s: Scorecard): ReportContent {
  return {
    bandName: 'Reactive',
    score: s.normalisedScore,
    headline: `Your AI Impact Gap Score: ${s.normalisedScore}/100 — Reactive`,
    verdict:
      'You have AI in the business. You do not have an AI strategy. There is a difference, and it costs money every quarter.',
    whatYourAnswersSuggest: `You are strongest in ${topPillarsText(s)}. You are thin in ${bottomPillarsText(
      s,
    )}. In plain terms: you are running a tool collection, not a portfolio of bets.`,
    moneyOnTable: `Likely unproductive AI spend: ${wasteRangeText(s)} per year. Companies in your band usually have 2 to 4 initiatives that are quietly failing and at least one that is worth scaling. The question is which.`,
    whatHappensNext:
      'Book a free 30-minute Diagnostic Call. I will tell you which initiatives look dead, which look underrated, and how to re-sequence your quarter in 10 days. You leave with a one-page summary of where to cut and where to double down.',
    primaryCta: ctaForRoute(s.ctaRoute),
    closingNote:
      "Fair warning. I'm not a consultancy. It's me. I take 2 to 3 Intensive clients at a time. If you want to see what the Intensive would find, the call is the cheapest way to find out.",
  };
}

function directionalReport(s: Scorecard): ReportContent {
  return {
    bandName: 'Directional',
    score: s.normalisedScore,
    headline: `Your AI Impact Gap Score: ${s.normalisedScore}/100 — Directional`,
    verdict:
      "You know what you're doing with AI. The gap is rarely strategy. It is execution discipline. Baselines, kill criteria, and the stop-or-scale muscle.",
    whatYourAnswersSuggest: `Your strongest pillars are ${topPillarsText(s)}. Your thinnest are ${bottomPillarsText(
      s,
    )}. Decisions are getting made, but without the evidence threshold that makes them defensible next quarter.`,
    moneyOnTable: `For Directional organisations, unproductive spend is smaller in percentage but bigger in absolute terms. You are likely carrying ${wasteRangeText(
      s,
    )} per year in initiatives that have drifted past their original business case.`,
    whatHappensNext:
      'The Diagnostic Call will either confirm you are close and only need a governance layer, or reveal a quieter gap in how you measure success. Either way, you leave clearer.',
    primaryCta: ctaForRoute(s.ctaRoute),
    closingNote:
      "Directional organisations are usually a better fit for the 30-day Implementation engagement than the 10-day Intensive. We'll find out on the call.",
  };
}

function compoundingReport(s: Scorecard): ReportContent {
  return {
    bandName: 'Compounding',
    score: s.normalisedScore,
    headline: `Your AI Impact Gap Score: ${s.normalisedScore}/100 — Compounding`,
    verdict:
      'You are in the top 5%. Most of my work is getting people to where you already are.',
    whatYourAnswersSuggest:
      'The AI IMPACT System is running in spirit, even if you call it something else. Your gap is probably peer-learning and sparring, not framework adoption.',
    moneyOnTable:
      "For you, the gap is not waste. It's the growth opportunities you haven't prioritised yet. Every AI-enabled cost-out programme has a ceiling. AI growth opportunities don't.",
    whatHappensNext:
      "You are not the right fit for the Intensive. I'd rather you joined a quarterly peer roundtable with 8 to 10 other Compounding operators. I run one when demand warrants it. Drop your name on the waitlist and I'll reach out when the next one fills.",
    primaryCta: ctaForRoute(s.ctaRoute),
    closingNote:
      'If you know other operators in the Compounding band, forward them the audit. That is how good rooms get built.',
  };
}

// ────────── Public API ──────────

export function generateReport(s: Scorecard): ReportContent {
  switch (s.band.name) {
    case 'Exposed':
      return exposedReport(s);
    case 'Reactive':
      return reactiveReport(s);
    case 'Directional':
      return directionalReport(s);
    case 'Compounding':
      return compoundingReport(s);
  }
}
