# AI IMPACT — AI Strategy Consulting

Marketing site + AI Impact Gap Audit scorecard for Marton Gaspar's AI strategy
consulting practice. Live at [aiimpactsystem.com](https://aiimpactsystem.com),
scorecard at `/audit`.

## Tech stack

- **React 19** + **Vite 8** + **react-router-dom 7**
- **Tailwind CSS 4** for styling
- **TypeScript** (scorecard + Netlify Functions)
- **Supabase** (Postgres) for lead storage
- **Resend** for transactional email
- **n8n** (self-hosted on Hetzner) for the drip sequence
- **Netlify** for hosting + serverless Functions

## Getting started

```bash
npm install
npm run dev          # Vite dev server
npm run build        # production build to dist/
npm run preview      # serve the built bundle
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # vitest run (scoring engine unit tests)
```

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Client (VITE_*)

| Variable | Description |
|----------|-------------|
| `VITE_CALENDLY_URL` | Calendly booking link used on the marketing page |
| `VITE_CAL_URL` | Cal.com booking link used on the Diagnostic Call CTA |
| `VITE_CONTACT_EMAIL` | Public contact address |
| `VITE_BRAND_EMAIL` | From-address shown in the immediate report email |
| `VITE_AUDIT_BETA_CODE` | Optional: restricts `/audit` to invited testers during beta |

### Server (Netlify Functions)

| Variable | Description |
|----------|-------------|
| `SCORECARD_SUPABASE_URL` | Supabase project URL |
| `SCORECARD_SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only, never ship to browser) |
| `RESEND_API_KEY` | Resend API key for transactional sends |
| `RESEND_FROM_EMAIL` | Verified from-address (e.g. `Marton Gaspar <marton@aiimpactsystem.com>`) |
| `UNSUBSCRIBE_SECRET` | HMAC secret for unsubscribe / export / erase links |
| `SCORECARD_DRIP_TOKEN` | Shared secret the n8n drip workflow sends as `X-Scorecard-Drip-Token` |
| `POSTAL_ADDRESS` | UK GDPR Art. 13 postal address shown on transactional emails |

ESLint enforces that server-only packages (`@supabase/supabase-js`, `resend`)
are never imported from `src/**`.

## Project structure

```
src/
  App.jsx                       marketing page (sections, nav, footer)
  main.jsx                      React entry + routes + ErrorBoundary
  config.ts                     centralised VITE_* env reader
  fonts.css                     Latin + Latin-ext Inter only (self-hosted)
  scorecard/                    /audit flow (TypeScript)
    AuditLanding.tsx            /audit (landing)
    ScorecardFlow.tsx           /audit/start (multi-step form)
    ResultPage.tsx              /audit/result (score + radar + CTAs)
    BetaGate.tsx                beta access gate
    ErrorBoundary.tsx           render-time crash recovery
    questions.ts                canonical question data (24 scoring + 4 context)
    scoring.ts                  band + pillar + CTA routing (pure functions)
    scoring.test.ts             vitest unit tests (19 cases)
    submissionPayload.ts        build + POST submission payload
    report.ts                   per-band verdict copy
    RadarChart.tsx              SVG radar chart (no chart library)
    EmailCaptureForm.tsx        post-score email capture (GDPR Art. 7 consent)
    DiagnosticCallCTA.tsx       Cal.com CTA
  components/
    CookieConsent.jsx           localStorage consent banner
  lib/
    consent.js                  consent storage helper
netlify/
  functions/
    scorecard-submit.ts         POST /api/scorecard-submit
    scorecard-email.ts          POST /api/scorecard-email (n8n drip)
    scorecard-unsubscribe.ts    GET/POST /api/scorecard-unsubscribe
    scorecard-export.ts         GET /api/scorecard-export (Art. 15/20)
    scorecard-erase.ts          GET/POST /api/scorecard-erase (Art. 17)
    _lib/
      common.ts                 CORS, HMAC tokens, rate limit, request id
      supabase-client.ts        memoized service-role client
      resend-client.ts          memoized Resend client
      immediate-report.ts       score email template
supabase/migrations/            001–007 (see DATA_HANDLING.md)
emails/templates/               drip email templates (Days 0-21)
public/
  privacy.html                  UK GDPR privacy policy (versioned)
  terms.html                    Terms of service (versioned)
docs/
  DATA_HANDLING.md              operator-facing data / retention / DR runbook
```

## Deployment

Deployed to **Netlify** (see `netlify.toml`). The build command is
`npm run build`; the publish directory is `dist/`; Netlify Functions live under
`netlify/functions/` and are routed as `/api/*` via the redirects in
`netlify.toml`. Node 22.

**Every push** to `main` triggers a production deploy. Feature branches get
deploy previews. GitHub Actions CI (`.github/workflows/ci.yml`) runs
`lint → typecheck → test → build` on every push and PR.

### Supabase migrations

Migrations live in `supabase/migrations/NNN_name.sql` with matching
`.down.sql`. Apply manually via the Supabase SQL editor in NN-ascending order.
See `docs/DATA_HANDLING.md` for the runbook.

## Operational docs

- `docs/DATA_HANDLING.md` — data classification, retention schedule, sub-processor
  list, backup posture, DR runbook.
- `CLAUDE.md` — project context used by Claude Code (voice, methodology, brand
  rules). Read before editing any public-facing copy.
