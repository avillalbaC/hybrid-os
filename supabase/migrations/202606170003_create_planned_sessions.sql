create table if not exists public.planned_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_block_id uuid references public.goal_blocks(id) on delete set null,
  planned_date date not null,
  title text not null,
  type text not null,
  subtypes text[] not null default '{}'::text[],
  status text not null default 'planned',
  priority text not null default 'normal',
  planned_duration_minutes integer,
  planned_distance_meters integer,
  planned_rpe numeric,
  focus text[] not null default '{}'::text[],
  notes text,
  source text not null default 'manual',
  matched_training_session_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planned_sessions_type_check check (type in ('crossfit', 'hyrox', 'halterofilia', 'gimnasticos', 'running', 'fuerza', 'movilidad', 'actividad_funcional', 'mixed', 'descanso')),
  constraint planned_sessions_status_check check (status in ('planned', 'completed', 'skipped', 'moved', 'cancelled')),
  constraint planned_sessions_priority_check check (priority in ('low', 'normal', 'high')),
  constraint planned_sessions_source_check check (source in ('manual', 'template', 'import', 'suggestion')),
  constraint planned_sessions_duration_non_negative check (planned_duration_minutes is null or planned_duration_minutes >= 0),
  constraint planned_sessions_distance_non_negative check (planned_distance_meters is null or planned_distance_meters >= 0),
  constraint planned_sessions_rpe_range check (planned_rpe is null or (planned_rpe >= 0 and planned_rpe <= 10))
);

create index if not exists planned_sessions_user_date_idx
  on public.planned_sessions(user_id, planned_date);

create index if not exists planned_sessions_user_goal_idx
  on public.planned_sessions(user_id, goal_block_id);

create index if not exists planned_sessions_user_status_idx
  on public.planned_sessions(user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_planned_sessions_updated_at on public.planned_sessions;

create trigger set_planned_sessions_updated_at
before update on public.planned_sessions
for each row
execute function public.set_updated_at();

alter table public.planned_sessions enable row level security;

drop policy if exists "Users can read own planned sessions" on public.planned_sessions;
drop policy if exists "Users can insert own planned sessions" on public.planned_sessions;
drop policy if exists "Users can update own planned sessions" on public.planned_sessions;
drop policy if exists "Users can delete own planned sessions" on public.planned_sessions;

create policy "Users can read own planned sessions"
on public.planned_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert own planned sessions"
on public.planned_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own planned sessions"
on public.planned_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own planned sessions"
on public.planned_sessions
for delete
using (auth.uid() = user_id);
