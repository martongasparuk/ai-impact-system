-- Rollback for 004_email_uniqueness.sql
drop index if exists public.uq_scorecard_email_day;
