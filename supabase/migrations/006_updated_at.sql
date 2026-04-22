-- AI Impact Scorecard — updated_at tracking (DB-09)
-- Records the last mutation time. Back-filled to created_at so existing rows
-- have a sensible baseline. Trigger keeps it current on UPDATE.

alter table public.scorecard_responses
  add column if not exists updated_at timestamptz not null default now();

update public.scorecard_responses
  set updated_at = created_at
  where updated_at is null or updated_at < created_at;

create or replace function public.scorecard_responses_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_scorecard_responses_updated_at on public.scorecard_responses;

create trigger trg_scorecard_responses_updated_at
  before update on public.scorecard_responses
  for each row
  execute function public.scorecard_responses_set_updated_at();
