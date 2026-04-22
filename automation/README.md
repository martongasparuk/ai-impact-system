# Scorecard — Automation Setup

n8n on Hetzner orchestrates the drip sequence. Scorecard submissions land in Supabase. n8n polls hourly, finds leads who are due for the next email, and calls `/api/scorecard-email` (which renders the template + sends via Resend).

## Architecture

```
User completes scorecard
        ↓
POST /api/scorecard-submit (Netlify Function)
        ↓
Supabase: INSERT into scorecard_responses
        ↓
Resend: immediate report email fires
        ↓
… 24h later …
n8n polls → POST /api/scorecard-email → Resend: day 1 email fires
… 72h later …
n8n polls → POST /api/scorecard-email → Resend: day 3 email fires
… etc. for day 5, 7, 14
```

## Setup (do once)

### 1. Supabase

1. Create a **new Supabase project** (separate from the Knowledge Base project).
2. In SQL Editor, run `supabase/migrations/001_scorecard.sql`.
3. Add drip-tracking columns to the table:

```sql
alter table public.scorecard_responses
  add column if not exists day1_sent_at timestamptz,
  add column if not exists day3_sent_at timestamptz,
  add column if not exists day5_sent_at timestamptz,
  add column if not exists day7_sent_at timestamptz,
  add column if not exists day14_sent_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;
```

4. Project Settings → API → copy:
   - `Project URL` → set as Netlify env `SCORECARD_SUPABASE_URL`
   - `service_role` secret → set as Netlify env `SCORECARD_SUPABASE_SERVICE_ROLE_KEY`

### 2. Resend

1. Sign up at resend.com.
2. Add domain `aiimpactsystem.com` and verify with the DNS records Resend provides.
3. Create an API key → set as Netlify env `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` env in Netlify to `Marton Gaspar <marton@aiimpactsystem.com>` (or similar from a verified address).

### 3. Cal.com

1. Sign up at cal.com.
2. Create an event type called `AI Impact Diagnostic Call (30 min)`.
3. Cap it at **4 bookings per month** (Availability → Limits).
4. Copy the event's share URL → set as Netlify env `VITE_CAL_URL`.

### 4. Netlify env vars

In Netlify dashboard → Site settings → Environment variables, add:

| Key | Scope | Value |
|---|---|---|
| `SCORECARD_SUPABASE_URL` | Server | from step 1 |
| `SCORECARD_SUPABASE_SERVICE_ROLE_KEY` | Server | from step 1 |
| `RESEND_API_KEY` | Server | from step 2 |
| `RESEND_FROM_EMAIL` | Server | from step 2 |
| `VITE_CAL_URL` | All | from step 3 |
| `SCORECARD_DRIP_TOKEN` | Server | a random string, e.g. `openssl rand -hex 32` — also paste into n8n creds |

Deploy the site so new env vars take effect.

### 5. n8n

1. Import `automation/n8n-scorecard-drip.json` into your n8n instance.
2. Create a Supabase credential pointing at the scorecard project.
3. Set `SCORECARD_DRIP_TOKEN` as an n8n environment variable (must match Netlify).
4. **Duplicate the day-1 flow four more times** for day 3, 5, 7, 14 — each with:
   - Filter: `created_at < now() - 'Nd'::interval AND dayN_sent_at IS NULL AND unsubscribed_at IS NULL`
   - Template value in the HTTP body: `"day3"`, `"day5"`, `"day7"`, `"day14"`
   - After the HTTP node, add a Supabase UPDATE node to set `dayN_sent_at = now()` for that lead.
5. Activate the workflow.

## Testing the end-to-end flow

1. Visit `/audit`, complete the scorecard.
2. Enter a real email in the capture form.
3. Expect the immediate report email in your inbox within 60 seconds.
4. Check Supabase: `select * from scorecard_leads_recent` shows your row.
5. Wait 24h (or manually trigger n8n) → day 1 email arrives.

## Troubleshooting

- **No email received** → check Resend dashboard → Logs for delivery status.
- **Supabase insert failing** → check Netlify function logs at `/functions/scorecard-submit`.
- **`/api/scorecard-email` returns 401** → `SCORECARD_DRIP_TOKEN` mismatch between Netlify and n8n.
- **Bounces** → Resend may restrict sending if domain not verified. Verify domain in Resend dashboard.

## Costs

All free tiers sufficient for first 1,000+ completions:

- Supabase free: 500 MB, 50k MAU — plenty
- Resend free: 3,000 emails/month — 500 completions × 6 emails = 3,000
- Cal.com free: unlimited event types
- Netlify free: 125k function calls/month
- n8n self-hosted on Hetzner: £0 marginal cost

Upgrade thresholds — only relevant at 500+ completions/month:
- Resend Pro £17/month for 50,000 emails
- Supabase Pro £24/month for 8 GB + better performance
