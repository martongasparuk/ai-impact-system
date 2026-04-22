# AI Impact Scorecard — Project Context

> **Read this first.** Every Claude Code session working on this project should start with this file + the Knowledge Base search.

## What this project is

The **AI Impact Gap Audit** — a self-serve scorecard at `aiimpactsystem.com/audit` that is the top-of-funnel lead magnet for Marton Gaspar's AI Impact System advisory practice.

**Offer ladder (canonical):**

1. **Scorecard** (free) → this project
2. **Diagnostic Call** (free, 30 min) → Cal.com booking at `/audit/result`
3. **AI Strategy Intensive** (£5,000, 10 days) → sold on the call
4. **AI Impact Implementation** (£20,000, 30 days) → upsold after the Intensive

Guarantee: *If we don't identify at least £100,000/year in impact, full refund.*

## Who this is for (ICP)

- COOs, CTOs, Chief Digital Officers, Transformation Directors, CFOs
- UK service businesses, **50–200 employees**
- Already spending on AI (tools, pilots, external help) — can't show return
- Pressure from board to demonstrate impact

## The methodology

**AI IMPACT System** (Marton's own, don't invent a new one):

- **I**dentify — where AI actually matters in real workflows
- **M**ap — what is really happening across the business right now
- **P**rioritise — the bets that matter
- **A**gree — success criteria, baselines, kill criteria
- **C**all — stop, continue, or scale based on proof
- **T**ell — explain the story to the board

Each pillar drives 4 scorecard questions → 24 scoring questions total.

## Tech stack

- **Frontend:** Vite + React (matches main `ai-impact-system` repo)
- **Styling:** Follow `/Users/Marton/Downloads/AI Impact System — Design System-handoff.zip` tokens. Font stack: Fraunces (display serif), Archivo (body sans), IBM Plex Mono (labels). Palette tokens in `colors_and_type.css`.
- **Storage:** Supabase (already in Marton's stack). Table `scorecard_responses`.
- **Email:** Resend (transactional). n8n on Hetzner for drip sequence.
- **Booking:** Cal.com embed.
- **Deploy:** Netlify (same pipeline as `ai-impact-system`). Feature branch → merge to main when ready.

## Supporting documents (read these before making design decisions)

All in `/Users/Marton/Downloads/AI automations agency/`:

- `SCORECARD-v1-ai-strategy-gap.md` — the full spec (questions, bands, report copy, email sequence, call script, landing page copy)
- `research-05-priestley-scorecard-methodology.md` — tease-not-tell principles
- `research-06-scorecard-benchmarks.md` — 12 live scorecards dissected

Memory files in `/Users/Marton/.claude/projects/-Users-Marton-Downloads-0-Claude-Marton-s-website/memory/`:

- `user_profile.md` — Marton's credentials (what CAN be claimed)
- `brand_safety_rules.md` — **HARD RULE: never claim NHS £260M delivery in public content**
- `sales_strategy_linkedin.md` — LinkedIn sales mechanics
- `user_frameworks.md` — Priestley KPI / Oversubscribed / Donnelly context

Voice profile: `/Users/Marton/Studio/voice/archive/voice-profile-2026-03-27.md`

## Knowledge Base integration

**Remote MCP endpoint:** `https://knowledge-base.aiimpactsystem.workers.dev/mcp`
Token: macOS Keychain `claude-code/mcp-auth-token`

Before any content decision, `search_knowledge` first.

Canonical source types: `book · course · post · comment · voice · context · meeting`.

## Brand + voice rules (non-negotiable)

- **Report is tease-not-tell.** Names the gap. Withholds the fix. Fix happens on the Diagnostic Call.
- **No em-dashes.** Anywhere in any public-facing copy.
- **No AI slop:** "quietly", "drifting", "share", "delve", "in the realm of".
- **8/10 polish** — clean but not perfect. Marton is a non-native English speaker. Perfect prose reads as AI-generated.
- **Warm delivery, uncompromising substance.**
- **Never claim NHS savings delivery.** See `brand_safety_rules.md`.
- **Money language throughout** — £, cost, revenue, speed, ROI, waste.

## The 4 bands

- **Exposed** (0–30) — AI spend with no visible return story
- **Reactive** (31–55) — tools + pilots, fragmented, slow decisions
- **Directional** (56–80) — has strategy, execution discipline gap
- **Compounding** (81–100) — top 5%, referral to roundtable

Band names drive positioning. Don't change without Marton's explicit approval.

## Sales-trigger answer

Every scoring question has 5 options (A/B/C/D/E). Option **E** = "This is exactly where I want help." It scores 0 points but flags the question as a sales trigger for routing. Total E-count on submission routes Exposed/Reactive users with 3+ E-answers straight to the Diagnostic Call CTA.

## Segmentation (not exclusion)

Pre-qualifying questions (PQ1–PQ4) segment, they do not reject. Outcome routing:

- Budget + urgency high → 1:1 Diagnostic Call CTA on result page
- Budget low / no urgency → webinar signup + email nurture CTA
- £0 spend + early-stage → long nurture, no immediate call ask

## File layout

```
ai-impact-scorecard/
├── CLAUDE.md                    (this file)
├── PLAN.md                      (phased build plan)
├── src/scorecard/
│   ├── questions.ts             (canonical question data)
│   ├── scoring.ts               (band + pillar calculations)
│   ├── report.ts                (band verdict copy)
│   ├── LandingPage.tsx
│   ├── ScorecardFlow.tsx
│   └── ResultPage.tsx
├── api/
│   └── submit.ts                (Supabase + Resend)
├── supabase/
│   └── migrations/
│       └── 001_scorecard.sql
└── package.json
```

## When editing

1. Search KB for relevant precedent before guessing.
2. Check `brand_safety_rules.md` before writing any public-facing copy.
3. Match voice profile 8/10 polish — no em-dashes.
4. Ingest any significant content change back to the KB as `source_type: context`.
