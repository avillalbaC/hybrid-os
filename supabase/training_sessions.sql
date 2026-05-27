create table if not exists public.training_sessions (
  id text primary key,
  session_date date not null,
  title text not null,
  type text not null,
  source text not null,
  data_quality text not null,
  running_distance_meters integer not null default 0,
  duration_minutes integer,
  rpe numeric,
  session_muscle_summary jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_sessions
  add column if not exists running_distance_meters integer not null default 0,
  add column if not exists duration_minutes integer,
  add column if not exists rpe numeric,
  add column if not exists session_muscle_summary jsonb not null default '{}'::jsonb;

update public.training_sessions
set
  running_distance_meters = coalesce(nullif(payload #>> '{sessionMetrics,totalRunMeters}', '')::integer, 0),
  duration_minutes = nullif(payload ->> 'durationMinutes', '')::integer,
  rpe = nullif(payload ->> 'rpe', '')::numeric,
  session_muscle_summary = coalesce(payload -> 'sessionMuscleSummary', '{}'::jsonb)
where payload is not null;

create index if not exists training_sessions_session_date_idx
  on public.training_sessions (session_date desc);

create or replace function public.set_training_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_training_sessions_updated_at on public.training_sessions;

create trigger set_training_sessions_updated_at
before update on public.training_sessions
for each row
execute function public.set_training_sessions_updated_at();

alter table public.training_sessions enable row level security;

create table if not exists public.raw_imports (
  id uuid primary key default gen_random_uuid(),
  training_session_id text,
  import_type text not null default 'appInput',
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists raw_imports_training_session_id_idx
  on public.raw_imports (training_session_id);

alter table public.raw_imports enable row level security;

create table if not exists public.training_exercises (
  id text primary key,
  training_session_id text not null references public.training_sessions(id) on delete cascade,
  block_id text not null,
  block_name text not null,
  exercise_index integer not null,
  name text not null,
  canonical_name text not null,
  movement_pattern text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_exercises_training_session_id_idx
  on public.training_exercises (training_session_id);

alter table public.training_exercises enable row level security;

drop trigger if exists set_training_exercises_updated_at on public.training_exercises;

create trigger set_training_exercises_updated_at
before update on public.training_exercises
for each row
execute function public.set_training_sessions_updated_at();

create table if not exists public.body_checks (
  id text primary key,
  check_date date not null,
  weight_kg numeric,
  waist_cm numeric,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists body_checks_check_date_idx
  on public.body_checks (check_date desc);

alter table public.body_checks enable row level security;

drop trigger if exists set_body_checks_updated_at on public.body_checks;

create trigger set_body_checks_updated_at
before update on public.body_checks
for each row
execute function public.set_training_sessions_updated_at();

create table if not exists public.nutrition_checks (
  id text primary key,
  check_date date not null,
  day_type text not null,
  adherence_percent numeric,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nutrition_checks_check_date_idx
  on public.nutrition_checks (check_date desc);

alter table public.nutrition_checks enable row level security;

drop trigger if exists set_nutrition_checks_updated_at on public.nutrition_checks;

create trigger set_nutrition_checks_updated_at
before update on public.nutrition_checks
for each row
execute function public.set_training_sessions_updated_at();
