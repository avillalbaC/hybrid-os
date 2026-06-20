create table if not exists public.programming_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  scheduled_date date not null,
  estimated_duration_minutes integer,
  status text not null default 'planned',
  source text not null default 'manual',
  blocks jsonb not null default '[]'::jsonb,
  final_log jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programming_sessions_type_check check (type in ('gimnasticos', 'running', 'fuerza', 'halterofilia', 'crossfit', 'hyrox', 'movilidad', 'mixed', 'other')),
  constraint programming_sessions_status_check check (status in ('planned', 'in_progress', 'completed', 'partially_completed', 'skipped')),
  constraint programming_sessions_duration_non_negative check (estimated_duration_minutes is null or estimated_duration_minutes >= 0),
  constraint programming_sessions_blocks_array check (jsonb_typeof(blocks) = 'array'),
  constraint programming_sessions_final_log_object check (final_log is null or jsonb_typeof(final_log) = 'object')
);

create index if not exists programming_sessions_user_date_idx
  on public.programming_sessions(user_id, scheduled_date);

create index if not exists programming_sessions_user_status_idx
  on public.programming_sessions(user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_programming_sessions_updated_at on public.programming_sessions;

create trigger set_programming_sessions_updated_at
before update on public.programming_sessions
for each row
execute function public.set_updated_at();

alter table public.programming_sessions enable row level security;

drop policy if exists "Users can read own programming sessions" on public.programming_sessions;
drop policy if exists "Users can insert own programming sessions" on public.programming_sessions;
drop policy if exists "Users can update own programming sessions" on public.programming_sessions;

create policy "Users can read own programming sessions"
on public.programming_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert own programming sessions"
on public.programming_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own programming sessions"
on public.programming_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
