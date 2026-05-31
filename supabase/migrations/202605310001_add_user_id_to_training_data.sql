alter table public.training_sessions
  add column if not exists user_id uuid references auth.users(id);

alter table public.raw_imports
  add column if not exists user_id uuid references auth.users(id);

alter table public.training_exercises
  add column if not exists user_id uuid references auth.users(id);

alter table public.body_checks
  add column if not exists user_id uuid references auth.users(id);

alter table public.nutrition_checks
  add column if not exists user_id uuid references auth.users(id);

create index if not exists training_sessions_user_date_idx
  on public.training_sessions(user_id, session_date desc);

create index if not exists raw_imports_user_session_idx
  on public.raw_imports(user_id, training_session_id);

create index if not exists training_exercises_user_session_idx
  on public.training_exercises(user_id, training_session_id);

create index if not exists body_checks_user_date_idx
  on public.body_checks(user_id, check_date desc);

create index if not exists nutrition_checks_user_date_idx
  on public.nutrition_checks(user_id, check_date desc);
