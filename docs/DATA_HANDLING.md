# Data handling and DR posture

Operational doc for the AI Impact Gap Audit. Keeps the privacy policy honest.
Anything user-facing lives in `public/privacy.html`. This file is for the operator.

Last reviewed: 2026-04-21.

## 1. Data classification

| Class | Examples | Where it lives |
|---|---|---|
| **PII (direct)** | `first_name`, `email`, `company` | `scorecard_responses` table (Supabase) |
| **PII (behavioural)** | Answers to 24 scoring Qs + 4 context Qs, pillar breakdown, band, `utm_*` | `scorecard_responses` |
| **Consent evidence** | `consent_timestamp`, `privacy_version`, `drip_consent` | `scorecard_responses` |
| **Suppression record** | `email`, `unsubscribed_at` | `scorecard_responses` (flag, not separate table) |
| **Transient** | Submitter IP | Netlify request logs only. Never written to our DB. |
| **Derived / aggregate** | Band distribution counts, pillar averages across all responses | Safe to share publicly once n >= 50. |

No financial data, no special-category data, no auth credentials beyond the `RESEND_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` held in Netlify env vars.

## 2. Retention schedule

| Item | Window | Trigger for deletion |
|---|---|---|
| `scorecard_responses` row | 24 months from `created_at` | Automated pruning job (see Gap below) or user request. |
| Consent evidence | 24 months after last outbound email | Same as row. |
| Unsubscribed-but-retained suppression record | Indefinite until erasure request | User hits "Delete my data" or emails. |
| Netlify request logs (incl. IP) | Per Netlify retention (typically 30 days) | Not our control. |
| Resend email send logs | Per Resend retention (typically 72h to 30 days for content, longer for metadata) | Not our control. |
| Supabase point-in-time recovery backups | 7 days (Pro plan default) | Automatic rollover. |

**Gap (tracked):** the 24-month purge is currently manual. Add a scheduled Supabase function or n8n workflow to run `DELETE FROM scorecard_responses WHERE created_at < now() - interval '24 months'` monthly.

## 3. Access control

- Production Supabase service role key is only held in Netlify env vars (function runtime) and the operator's 1Password vault.
- No shared logins. Single operator (Marton Gaspar).
- Row-level security policies are restrictive by default on `scorecard_responses`. Writes only happen from the service-role-keyed function, never from the browser.
- No read access from the client. The result page recomputes the score from `localStorage` answers, not from the DB.

## 4. Sub-processors

Canonical list lives in `public/privacy.html` section 4. Summary:

- Supabase (EU / Ireland) — primary DB.
- Resend (US, SCCs) — transactional email delivery.
- n8n self-hosted on Hetzner (Germany) — drip sequence orchestration.
- Beehiiv (US, SCCs) — newsletter (separate opt-in from the audit).
- Netlify (US / edge, SCCs) — hosting and serverless functions.
- Calendly + Cal.com — scheduling widgets on the result page.
- Fontsource — self-hosted fonts, no third-party browser call.

## 5. Backup posture

- Supabase Pro plan runs daily logical backups plus point-in-time recovery (PITR) with 7-day retention.
- No additional third-party backup layer. Restore path is Supabase's built-in PITR (see Supabase docs).
- No local database dumps are kept on the operator's laptop.

## 6. Disaster recovery

### Scope
A "disaster" for this system means one of:
1. Supabase project deleted, corrupted, or unavailable for > 1 hour.
2. Netlify site deleted or DNS misrouted for > 1 hour.
3. `RESEND_API_KEY` compromised.
4. Bulk unauthorised read of `scorecard_responses`.

### Recovery targets
| | Target |
|---|---|
| **RTO** (Recovery Time Objective) | 4 hours to restore audit submission path, 24 hours for email delivery. |
| **RPO** (Recovery Point Objective) | 24 hours. We accept losing at most one day of submissions in a worst-case restore from daily backups. |

These are low-stakes targets by design. The audit is a lead-capture tool, not a life-safety system. If the form is down for 4 hours, the business impact is a small number of missed leads, not service failure for existing customers.

### Runbook (abbreviated)

**Supabase outage or data loss:**
1. Confirm via [Supabase status page](https://status.supabase.com/).
2. If < 1 hour: let the function 502 naturally. Submissions are idempotent per `(email, date)` — user can retry.
3. If > 1 hour: put a static `/audit` holding page live via Netlify redirect. Do not spin up a second DB (consent records must stay with the canonical data).
4. On recovery, use Supabase PITR to the last known-good point.

**Netlify outage:**
1. Check [Netlify status](https://www.netlifystatus.com/).
2. If site-level: flip DNS at Cloudflare to a maintenance page.
3. If function-level only: the form will fail. Accept the downtime. The scorecard has a beta-grace local fallback on 503, which keeps user-visible UX intact.

**RESEND_API_KEY compromise:**
1. Rotate the key in the Resend dashboard immediately.
2. Update Netlify env var `RESEND_API_KEY`.
3. Trigger a redeploy.
4. Audit `resend` dashboard for unauthorised sends in the preceding 72h.

**Bulk unauthorised read:**
1. Revoke service role key in Supabase.
2. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Netlify.
3. Audit Supabase logs for the timeframe.
4. If PII was exposed, notify ICO within 72 hours (UK GDPR Art. 33).
5. Notify affected users without undue delay.

## 7. Outstanding work

- [ ] Scheduled 24-month retention purge (manual today).
- [ ] Supabase logical backup export to a second region (PITR covers the common failure modes but a second geo is a harder floor).
- [ ] Tabletop rehearsal of the Supabase-down runbook before we ship to production.
