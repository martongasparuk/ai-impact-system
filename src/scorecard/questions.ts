// AI Impact Scorecard — canonical question data
// Source of truth. Do not modify without updating the spec doc.
// Spec: /Users/Marton/Downloads/AI automations agency/SCORECARD-v1-ai-strategy-gap.md
//
// v2 (2026-04-22): reduced 24 → 18 scoring questions (3 per pillar) and rewrote
// every prompt into a clean "yes-structured" question so the standard 5-option
// scale ("Yes / Mostly / Partially / Not really / Help") fits grammatically.

// ────────── Types ──────────

export type Pillar = 'Identify' | 'Map' | 'Prioritise' | 'Agree' | 'Call' | 'Tell';

export type ScoreOption = {
  value: 'A' | 'B' | 'C' | 'D' | 'E';
  label: string;
  points: 0 | 1 | 2 | 3 | 4;
  isSalesTrigger?: boolean;
};

export type ScoringQuestion = {
  id: string;
  pillar: Pillar;
  prompt: string;
  options: ScoreOption[];
};

export type ContextQuestion = {
  id: string;
  type: 'role' | 'headcount' | 'spend' | 'urgency';
  prompt: string;
  options: { value: string; label: string }[];
  /**
   * If the user picks this option value, a free-text input appears below the options.
   * The text is stored under `context[<id>_text]` and flows through to the Supabase
   * `answers` JSONB column — no schema change required.
   */
  freeTextOn?: string;
  /** Label shown above the free-text input. */
  freeTextPrompt?: string;
  /** Placeholder inside the free-text input. */
  freeTextPlaceholder?: string;
};

export type Band = {
  name: 'Exposed' | 'Reactive' | 'Directional' | 'Compounding';
  min: number;
  max: number;
  oneLiner: string;
};

// ────────── Standard answer scale ──────────
// Every scoring question uses the same five options.
// Option E is a sales trigger — scores 0, but flags the question for call routing.

export const standardOptions: ScoreOption[] = [
  { value: 'A', label: 'Yes, clearly, and defensible to the board', points: 4 },
  { value: 'B', label: 'Mostly, but not formal', points: 3 },
  { value: 'C', label: "Partially — we're trying but fragmented", points: 2 },
  { value: 'D', label: "Not really — we know it's a gap", points: 1 },
  { value: 'E', label: 'This is exactly where I want help', points: 0, isSalesTrigger: true },
];

// ────────── Pre-qualifying context questions ──────────
// Segment, never exclude. Drive email routing + sales-call priority + £ estimate.

export const preQualifyingQuestions: ContextQuestion[] = [
  {
    id: 'PQ1',
    type: 'role',
    prompt: 'What best describes your role?',
    options: [
      { value: 'ceo',            label: "I'm the CEO, Founder, or Managing Director" },
      { value: 'coo',            label: "I'm the COO or Ops Director" },
      { value: 'cto',            label: "I'm the CTO, CDO, CIO, or Head of Digital" },
      { value: 'transformation', label: "I'm the Transformation Director or change lead" },
      { value: 'cfo',            label: "I'm the CFO or Finance Director" },
      { value: 'other_senior',   label: 'Other senior leader' },
      { value: 'exploring',      label: "I'm exploring. Not a decision-maker yet" },
    ],
  },
  {
    id: 'PQ2',
    type: 'headcount',
    prompt: "What's your company's headcount right now?",
    options: [
      { value: 'lt_50',     label: 'Under 50' },
      { value: '50_100',    label: '50 to 100' },
      { value: '101_200',   label: '101 to 200' },
      { value: '201_500',   label: '201 to 500' },
      { value: 'gt_500',    label: 'Over 500' },
    ],
  },
  {
    id: 'PQ3',
    type: 'spend',
    prompt: 'What are you spending on AI across the business per quarter? Licences, tools, pilots, external help.',
    options: [
      { value: 'lt_5k',    label: 'Under £5,000' },
      { value: '5_25k',    label: '£5,000 to £25,000' },
      { value: '25_75k',   label: '£25,000 to £75,000' },
      { value: '75_200k',  label: '£75,000 to £200,000' },
      { value: 'gt_200k',  label: 'Over £200,000' },
      { value: 'unknown',  label: "I genuinely don't know" },
    ],
  },
  {
    id: 'PQ4',
    type: 'urgency',
    prompt: "What's forcing your hand on AI right now?",
    options: [
      { value: 'board',        label: 'Board or investor pressure on ROI' },
      { value: 'unused_tools', label: "We've bought licences we're not using well" },
      { value: 'competitor',   label: 'Fear of falling behind competitors' },
      { value: 'pilot_stall',  label: "We've had a pilot stall or a project overspend" },
      { value: 'get_ahead',    label: 'Nothing specific. We want to get ahead' },
      { value: 'other',        label: 'Other' },
    ],
    freeTextOn: 'other',
    freeTextPrompt: 'Tell me what else is pushing you on AI',
    freeTextPlaceholder: "e.g. a specific client request, a failed vendor demo, a note from Friday's board…",
  },
];

// ────────── Scoring questions ──────────
// 6 pillars × 3 questions = 18 questions. Max raw score 72. Normalised to 100.
// Every prompt is a yes-structured question. "Yes/Mostly/Partially/Not really/Help" all fit.

export const scoringQuestions: ScoringQuestion[] = [
  // ═══════ Pillar 1 — IDENTIFY: where AI actually matters ═══════
  {
    id: 'Q1',
    pillar: 'Identify',
    prompt: 'Do you have a clear list of the 3 to 5 workflows where AI will most change cost, speed, or revenue for your business?',
    options: standardOptions,
  },
  {
    id: 'Q2',
    pillar: 'Identify',
    prompt: 'For each AI initiative you have today, can you name the specific workflow and the KPI it is meant to improve?',
    options: standardOptions,
  },
  {
    id: 'Q3',
    pillar: 'Identify',
    prompt: 'Can you explain in one sentence how each AI tool in use today earns its licence cost?',
    options: standardOptions,
  },

  // ═══════ Pillar 2 — MAP: what is really happening ═══════
  {
    id: 'Q4',
    pillar: 'Map',
    prompt: 'Do you have a current inventory of every AI pilot, tool, and workflow running in the business right now?',
    options: standardOptions,
  },
  {
    id: 'Q5',
    pillar: 'Map',
    prompt: 'Do you know who owns each AI initiative and what outcome they are on the hook to deliver?',
    options: standardOptions,
  },
  {
    id: 'Q6',
    pillar: 'Map',
    prompt: 'Would your answer to "how many AI projects are running here?" match your CTO\'s answer, and both match reality?',
    options: standardOptions,
  },

  // ═══════ Pillar 3 — PRIORITISE: the bets that matter ═══════
  {
    id: 'Q7',
    pillar: 'Prioritise',
    prompt: 'Do you have a written ranking of your AI bets by value, feasibility, and risk?',
    options: standardOptions,
  },
  {
    id: 'Q8',
    pillar: 'Prioritise',
    prompt: 'Are your AI resources (budget, people, attention) focused on your top 1 to 3 bets, rather than spread thin across 10 or more?',
    options: standardOptions,
  },
  {
    id: 'Q9',
    pillar: 'Prioritise',
    prompt: 'Do you kill or pause AI initiatives when a better bet comes along, rather than letting them quietly continue?',
    options: standardOptions,
  },

  // ═══════ Pillar 4 — AGREE: success criteria before you start ═══════
  {
    id: 'Q10',
    pillar: 'Agree',
    prompt: 'For every live AI initiative, do you have a written baseline number it must move?',
    options: standardOptions,
  },
  {
    id: 'Q11',
    pillar: 'Agree',
    prompt: 'For every live AI initiative, do you have a written kill criteria — the result at which you stop?',
    options: standardOptions,
  },
  {
    id: 'Q12',
    pillar: 'Agree',
    prompt: 'Are your AI success metrics tied to a real P&L line, rather than internal proxies like "users onboarded"?',
    options: standardOptions,
  },

  // ═══════ Pillar 5 — CALL: stop, continue, scale based on proof ═══════
  {
    id: 'Q13',
    pillar: 'Call',
    prompt: 'In the last 6 months, have you made a real stop-or-scale decision on an AI initiative based on evidence, not opinion?',
    options: standardOptions,
  },
  {
    id: 'Q14',
    pillar: 'Call',
    prompt: 'Do your AI reviews happen on a fixed cadence (monthly or quarterly), rather than only when someone panics?',
    options: standardOptions,
  },
  {
    id: 'Q15',
    pillar: 'Call',
    prompt: 'When an AI project is underperforming, is the stop-or-continue decision made within 30 days?',
    options: standardOptions,
  },

  // ═══════ Pillar 6 — TELL: explain the story ═══════
  {
    id: 'Q16',
    pillar: 'Tell',
    prompt: 'If your board asked today "what is AI actually doing for us?", could you answer in under 2 minutes with numbers?',
    options: standardOptions,
  },
  {
    id: 'Q17',
    pillar: 'Tell',
    prompt: 'Do you have a standing way of telling the business what AI work was chosen, what was stopped, and why?',
    options: standardOptions,
  },
  {
    id: 'Q18',
    pillar: 'Tell',
    prompt: 'When a senior leader questions the AI budget, do you win the conversation with evidence?',
    options: standardOptions,
  },
];

// ────────── Bands ──────────

export const bands: Band[] = [
  {
    name: 'Exposed',
    min: 0,
    max: 30,
    oneLiner: "You're spending money on AI. You cannot yet tell anyone what it's returning. That is a Board-level risk wearing a technology badge.",
  },
  {
    name: 'Reactive',
    min: 31,
    max: 55,
    oneLiner: 'You have AI in the business. You do not have an AI strategy. There is a difference, and it costs money every quarter.',
  },
  {
    name: 'Directional',
    min: 56,
    max: 80,
    oneLiner: "You know what you're doing with AI. The gap is rarely strategy. It is execution discipline: baselines, kill criteria, stop-or-scale muscle.",
  },
  {
    name: 'Compounding',
    min: 81,
    max: 100,
    oneLiner: 'You are in the top 5%. Most of my work is getting people to where you already are.',
  },
];

// ────────── Pillar order (for radar chart axes) ──────────

export const pillarOrder: Pillar[] = [
  'Identify',
  'Map',
  'Prioritise',
  'Agree',
  'Call',
  'Tell',
];

// ────────── Derived counts ──────────

export const totalScoringQuestions = scoringQuestions.length;   // 18
export const maxRawScore = totalScoringQuestions * 4;           // 72
export const totalContextQuestions = preQualifyingQuestions.length; // 4
export const totalQuestions = totalScoringQuestions + totalContextQuestions; // 22
