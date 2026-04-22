import { describe, expect, it } from 'vitest';
import { calculateScorecard, type Answers, type ScoreLetter } from './scoring';
import { scoringQuestions, bands } from './questions';

// ────────── Helpers ──────────

function allAnswersAs(letter: ScoreLetter): Answers['scoring'] {
  return scoringQuestions.reduce<Record<string, ScoreLetter>>((acc, q) => {
    acc[q.id] = letter;
    return acc;
  }, {});
}

function buildAnswers(
  scoring: Answers['scoring'],
  context: Answers['context'] = {},
): Answers {
  return { context, scoring };
}

// ────────── Band boundaries ──────────

describe('band boundaries', () => {
  it('all-A (96/96 → 100) is Compounding', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('A')));
    expect(s.rawScore).toBe(96);
    expect(s.normalisedScore).toBe(100);
    expect(s.band.name).toBe('Compounding');
  });

  it('all-E (0/96 → 0) is Exposed', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('E')));
    expect(s.rawScore).toBe(0);
    expect(s.normalisedScore).toBe(0);
    expect(s.band.name).toBe('Exposed');
  });

  it('all-D (1pt × 24 = 24/96 → 25) is Exposed', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('D')));
    expect(s.rawScore).toBe(24);
    expect(s.normalisedScore).toBe(25);
    expect(s.band.name).toBe('Exposed');
  });

  it('all-C (2pt × 24 = 48/96 → 50) is Reactive', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('C')));
    expect(s.rawScore).toBe(48);
    expect(s.normalisedScore).toBe(50);
    expect(s.band.name).toBe('Reactive');
  });

  it('all-B (3pt × 24 = 72/96 → 75) is Directional', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('B')));
    expect(s.rawScore).toBe(72);
    expect(s.normalisedScore).toBe(75);
    expect(s.band.name).toBe('Directional');
  });

  it('bands cover 0-100 with no gaps and no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBe(100);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
  });
});

// ────────── Sales triggers ──────────

describe('sales trigger count', () => {
  it('counts only E answers', () => {
    const scoring: Answers['scoring'] = {};
    // First 3 questions E, rest C
    scoringQuestions.forEach((q, i) => {
      scoring[q.id] = i < 3 ? 'E' : 'C';
    });
    const s = calculateScorecard(buildAnswers(scoring));
    expect(s.salesTriggerCount).toBe(3);
  });

  it('zero when no E answers present', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('A')));
    expect(s.salesTriggerCount).toBe(0);
  });
});

// ────────── CTA routing ──────────

describe('CTA routing', () => {
  it('Compounding → waitlist regardless of spend', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('A'), { PQ3: 'gt_200k', PQ4: 'board' }),
    );
    expect(s.ctaRoute).toBe('waitlist');
  });

  it('Reactive + real spend + urgency → diagnostic_call', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('C'), { PQ3: '25_75k', PQ4: 'board' }),
    );
    expect(s.band.name).toBe('Reactive');
    expect(s.ctaRoute).toBe('diagnostic_call');
  });

  it('Reactive + real spend + 3+ sales triggers → diagnostic_call even without urgency', () => {
    const scoring: Answers['scoring'] = {};
    scoringQuestions.forEach((q, i) => {
      scoring[q.id] = i < 4 ? 'E' : 'C';
    });
    const s = calculateScorecard(
      buildAnswers(scoring, { PQ3: '25_75k', PQ4: 'get_ahead' }),
    );
    expect(s.salesTriggerCount).toBe(4);
    expect(s.ctaRoute).toBe('diagnostic_call');
  });

  it('under-£5k spend → nurture_only', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('C'), { PQ3: 'lt_5k', PQ4: 'board' }),
    );
    expect(s.ctaRoute).toBe('nurture_only');
  });

  it('mid-spend + no urgency + no triggers → webinar', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('C'), { PQ3: '5_25k', PQ4: 'get_ahead' }),
    );
    expect(s.ctaRoute).toBe('webinar');
  });
});

// ────────── Pillar averaging ──────────

describe('pillar averaging', () => {
  it('uniform answers produce uniform pillar averages', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('B')));
    for (const pillar of Object.keys(s.pillarScores)) {
      expect(s.pillarScores[pillar as keyof typeof s.pillarScores]).toBe(3);
    }
  });

  it('isolates weakest and strongest pillars correctly', () => {
    // Make Identify all-A (avg 4), Tell all-E (avg 0), everything else C (avg 2)
    const scoring: Answers['scoring'] = {};
    for (const q of scoringQuestions) {
      if (q.pillar === 'Identify') scoring[q.id] = 'A';
      else if (q.pillar === 'Tell') scoring[q.id] = 'E';
      else scoring[q.id] = 'C';
    }
    const s = calculateScorecard(buildAnswers(scoring));
    expect(s.pillarScores.Identify).toBe(4);
    expect(s.pillarScores.Tell).toBe(0);
    expect(s.strongestPillars[0]).toBe('Identify');
    expect(s.weakestPillars[0]).toBe('Tell');
  });

  it('unanswered pillar questions drop to 0 average', () => {
    const scoring: Answers['scoring'] = {};
    for (const q of scoringQuestions) {
      if (q.pillar !== 'Tell') scoring[q.id] = 'A';
    }
    const s = calculateScorecard(buildAnswers(scoring));
    expect(s.pillarScores.Tell).toBe(0);
    expect(s.pillarScores.Identify).toBe(4);
  });
});

// ────────── Waste estimate ──────────

describe('waste estimate', () => {
  it('Exposed uses 40-70% of annual spend', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('E'), { PQ3: '25_75k' }),
    );
    // spendMidpoint('25_75k') = 50000, × 4 = 200000 annual
    // min = 200000 × 0.40 = 80000, max = 200000 × 0.70 = 140000
    expect(s.estimatedWaste.min).toBe(80000);
    expect(s.estimatedWaste.max).toBe(140000);
  });

  it('Compounding waste range is near zero', () => {
    const s = calculateScorecard(
      buildAnswers(allAnswersAs('A'), { PQ3: 'gt_200k' }),
    );
    expect(s.estimatedWaste.min).toBe(0);
    expect(s.estimatedWaste.max).toBeLessThanOrEqual(60000);
  });

  it('missing PQ3 falls back to generic note', () => {
    const s = calculateScorecard(buildAnswers(allAnswersAs('C')));
    expect(s.estimatedWaste.note).toMatch(/typical UK mid-market/i);
  });
});
