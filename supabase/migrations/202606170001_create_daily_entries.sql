create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  priorities jsonb not null default '[]'::jsonb,
  mobility_done boolean not null default false,
  mobility_minutes integer,
  mobility_focus text[] not null default '{}'::text[],
  daily_note text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_entries_user_date_unique unique (user_id, entry_date),
  constraint daily_entries_priorities_is_array check (jsonb_typeof(priorities) = 'array'),
  constraint daily_entries_mobility_minutes_non_negative check (mobility_minutes is null or mobility_minutes >= 0),
  constraint daily_entries_source_check check (source in ('manual', 'import', 'parser'))
);

create index if not exists daily_entries_user_date_idx
  on public.daily_entries(user_id, entry_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_daily_entries_updated_at on public.daily_entries;

create trigger set_daily_entries_updated_at
before update on public.daily_entries
for each row
execute function public.set_updated_at();

alter table public.daily_entries enable row level security;

drop policy if exists "Users can read own daily entries" on public.daily_entries;
drop policy if exists "Users can insert own daily entries" on public.daily_entries;
drop policy if exists "Users can update own daily entries" on public.daily_entries;
drop policy if exists "Users can delete own daily entries" on public.daily_entries;

create policy "Users can read own daily entries"
on public.daily_entries
for select
using (auth.uid() = user_id);

create policy "Users can insert own daily entries"
on public.daily_entries
for insert
with check (auth.uid() = user_id);

create policy "Users can update own daily entries"
on public.daily_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own daily entries"
on public.daily_entries
for delete
using (auth.uid() = user_id);
