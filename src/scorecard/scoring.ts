// AI Impact Scorecard — scoring engine
// Pure functions. No side effects. Easy to unit-test.

import {
  scoringQuestions,
  bands,
  pillarOrder,
  maxRawScore,
  standardOptions,
  type Pillar,
  type Band,
} from './questions';

// ────────── Types ──────────

export type ScoreLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export type Answers = {
  /** Pre-qualifying context answers keyed by question id (PQ1-PQ4) */
  context: Partial<Record<string, string>>;
  /** Scoring answers keyed by question id (Q1-Q24) */
  scoring: Partial<Record<string, ScoreLetter>>;
};

export type WasteEstimate = {
  min: number;
  max: number;
  note: string;
};

export type Scorecard = {
  rawScore: number;
  maxRawScore: number;
  /** 0-100, rounded */
  normalisedScore: number;
  /** Pillar averages 0-4 each, keyed by pillar name */
  pillarScores: Record<Pillar, number>;
  band: Band;
  /** How many E answers (sales triggers) across the 24 scoring questions */
  salesTriggerCount: number;
  /** Top 1-2 pillars by average score, strongest first */
  strongestPillars: Pillar[];
  /** Bottom 2-3 pillars by average score, weakest first */
  weakestPillars: Pillar[];
  /** Estimated annual unproductive AI spend range */
  estimatedWaste: WasteEstimate;
  /** Which result-page CTA to route to, based on segmentation */
  ctaRoute: 'diagnostic_call' | 'webinar' | 'nurture_only' | 'waitlist';
};

// ────────── Helpers ──────────

const pointsFor = (letter?: ScoreLetter): number => {
  if (!letter) return 0;
  return standardOptions.find((o) => o.value === letter)?.points ?? 0;
};

/** Quarterly AI-spend midpoints in £ for each PQ3 bracket.
 *  Midpoints of the declared ranges, with `gt_200k` set to £300k as a
 *  conservative midpoint of the open-ended top bracket and `unknown` set to
 *  the lower-mid-market typical we see across the pipeline (£25k/quarter). */
const SPEND_MIDPOINTS_GBP: Record<string, number> = {
  lt_5k:   2_500,
  '5_25k': 15_000,
  '25_75k': 50_000,
  '75_200k': 137_500,
  gt_200k: 300_000,
  unknown: 25_000,
};

const DEFAULT_QUARTERLY_SPEND_GBP = SPEND_MIDPOINTS_GBP.unknown;

const spendMidpoint = (pq3?: string): number => {
  if (!pq3) return DEFAULT_QUARTERLY_SPEND_GBP;
  return SPEND_MIDPOINTS_GBP[pq3] ?? DEFAULT_QUARTERLY_SPEND_GBP;
};

/** Waste multipliers by band — % of annual AI spend likely unproductive */
const WASTE_BY_BAND: Record<Band['name'], { min: number; max: number }> = {
  Exposed:      { min: 0.40, max: 0.70 },
  Reactive:     { min: 0.25, max: 0.45 },
  Directional: { min: 0.10, max: 0.25 },
  Compounding: { min: 0.00, max: 0.05 },
};

/** Round to nearest £1k for display */
const roundToThousand = (n: number): number => Math.round(n / 1000) * 1000;

// ────────── Public API ──────────

export function calculateScorecard(answers: Answers): Scorecard {
  // 1. Sum raw score + pillar sums + sales triggers
  let rawScore = 0;
  let salesTriggerCount = 0;

  const pillarSums: Record<Pillar, { sum: number; count: number }> = {
    Identify:   { sum: 0, count: 0 },
    Map:        { sum: 0, count: 0 },
    Prioritise: { sum: 0, count: 0 },
    Agree:      { sum: 0, count: 0 },
    Call:       { sum: 0, count: 0 },
    Tell:       { sum: 0, count: 0 },
  };

  for (const q of scoringQuestions) {
    const letter = answers.scoring[q.id];
    if (!letter) continue;
    const pts = pointsFor(letter);
    rawScore += pts;
    pillarSums[q.pillar].sum += pts;
    pillarSums[q.pillar].count += 1;
    if (letter === 'E') salesTriggerCount += 1;
  }

  // 2. Normalise 0-100
  const normalisedScore = Math.round((rawScore / maxRawScore) * 100);

  // 3. Pillar averages (0-4)
  const pillarScores = pillarOrder.reduce((acc, p) => {
    const { sum, count } = pillarSums[p];
    acc[p] = count > 0 ? sum / count : 0;
    return acc;
  }, {} as Record<Pillar, number>);

  // 4. Band assignment
  const band =
    bands.find((b) => normalisedScore >= b.min && normalisedScore <= b.max) ??
    bands[0];

  // 5. Top / bottom pillars by average
  const sorted = [...pillarOrder].sort((a, b) => pillarScores[b] - pillarScores[a]);
  const strongestPillars = sorted.slice(0, 2);
  const weakestPillars = sorted.slice(-3).reverse(); // weakest first

  // 6. Waste estimate
  const annualSpend = spendMidpoint(answers.context.PQ3) * 4;
  const wasteBand = WASTE_BY_BAND[band.name];
  const estimatedWaste: WasteEstimate = {
    min: roundToThousand(annualSpend * wasteBand.min),
    max: roundToThousand(annualSpend * wasteBand.max),
    note:
      answers.context.PQ3 === 'unknown' || !answers.context.PQ3
        ? 'Estimated against typical UK mid-market AI spend.'
        : `Based on your answer of roughly £${spendMidpoint(answers.context.PQ3).toLocaleString('en-GB')} quarterly AI spend.`,
  };

  // 7. CTA routing
  const ctaRoute = routeCta({
    bandName: band.name,
    pq3: answers.context.PQ3,
    pq4: answers.context.PQ4,
    salesTriggerCount,
  });

  return {
    rawScore,
    maxRawScore,
    normalisedScore,
    pillarScores,
    band,
    salesTriggerCount,
    strongestPillars,
    weakestPillars,
    estimatedWaste,
    ctaRoute,
  };
}

/** Routing logic for the primary result-page CTA. Segment, never exclude. */
function routeCta(input: {
  bandName: Band['name'];
  pq3?: string;
  pq4?: string;
  salesTriggerCount: number;
}): Scorecard['ctaRoute'] {
  // Compounding → refer to roundtable, not the Intensive
  if (input.bandName === 'Compounding') return 'waitlist';

  const hasRealSpend = input.pq3 && !['lt_5k'].includes(input.pq3);
  const hasUrgency =
    input.pq4 &&
    ['board', 'unused_tools', 'competitor', 'pilot_stall'].includes(input.pq4);

  // Clear buyer signal → Diagnostic Call
  if (hasRealSpend && (hasUrgency || input.salesTriggerCount >= 3)) {
    return 'diagnostic_call';
  }

  // Under-5k spend or 'exploring' role → nurture only
  if (input.pq3 === 'lt_5k') return 'nurture_only';

  // Middle ground → webinar signup
  return 'webinar';
}
