alter table public.training_sessions
  alter column user_id set not null;

alter table public.raw_imports
  alter column user_id set not null;

alter table public.training_exercises
  alter column user_id set not null;

alter table public.body_checks
  alter column user_id set not null;

alter table public.nutrition_checks
  alter column user_id set not null;

alter table public.training_sessions enable row level security;
alter table public.raw_imports enable row level security;
alter table public.training_exercises enable row level security;
alter table public.body_checks enable row level security;
alter table public.nutrition_checks enable row level security;

drop policy if exists "Users can read own training sessions" on public.training_sessions;
drop policy if exists "Users can insert own training sessions" on public.training_sessions;
drop policy if exists "Users can update own training sessions" on public.training_sessions;
drop policy if exists "Users can delete own training sessions" on public.training_sessions;

create policy "Users can read own training sessions"
on public.training_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert own training sessions"
on public.training_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own training sessions"
on public.training_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own training sessions"
on public.training_sessions
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own raw imports" on public.raw_imports;
drop policy if exists "Users can insert own raw imports" on public.raw_imports;
drop policy if exists "Users can update own raw imports" on public.raw_imports;
drop policy if exists "Users can delete own raw imports" on public.raw_imports;

create policy "Users can read own raw imports"
on public.raw_imports
for select
using (auth.uid() = user_id);

create policy "Users can insert own raw imports"
on public.raw_imports
for insert
with check (auth.uid() = user_id);

create policy "Users can update own raw imports"
on public.raw_imports
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own raw imports"
on public.raw_imports
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own training exercises" on public.training_exercises;
drop policy if exists "Users can insert own training exercises" on public.training_exercises;
drop policy if exists "Users can update own training exercises" on public.training_exercises;
drop policy if exists "Users can delete own training exercises" on public.training_exercises;

create policy "Users can read own training exercises"
on public.training_exercises
for select
using (auth.uid() = user_id);

create policy "Users can insert own training exercises"
on public.training_exercises
for insert
with check (auth.uid() = user_id);

create policy "Users can update own training exercises"
on public.training_exercises
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own training exercises"
on public.training_exercises
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own body checks" on public.body_checks;
drop policy if exists "Users can insert own body checks" on public.body_checks;
drop policy if exists "Users can update own body checks" on public.body_checks;
drop policy if exists "Users can delete own body checks" on public.body_checks;

create policy "Users can read own body checks"
on public.body_checks
for select
using (auth.uid() = user_id);

create policy "Users can insert own body checks"
on public.body_checks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own body checks"
on public.body_checks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own body checks"
on public.body_checks
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own nutrition checks" on public.nutrition_checks;
drop policy if exists "Users can insert own nutrition checks" on public.nutrition_checks;
drop policy if exists "Users can update own nutrition checks" on public.nutrition_checks;
drop policy if exists "Users can delete own nutrition checks" on public.nutrition_checks;

create policy "Users can read own nutrition checks"
on public.nutrition_checks
for select
using (auth.uid() = user_id);

create policy "Users can insert own nutrition checks"
on public.nutrition_checks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own nutrition checks"
on public.nutrition_checks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own nutrition checks"
on public.nutrition_checks
for delete
using (auth.uid() = user_id);
