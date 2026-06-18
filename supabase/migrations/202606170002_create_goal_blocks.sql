create table if not exists public.goal_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  profile text not null,
  status text not null default 'active',
  start_date date not null,
  end_date date,
  targets jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_blocks_status_check check (status in ('active', 'paused', 'completed', 'archived')),
  constraint goal_blocks_profile_check check (profile in ('recomposition', 'running_base', 'hyrox_build', 'strength_maintenance', 'deload', 'custom')),
  constraint goal_blocks_targets_is_object check (jsonb_typeof(targets) = 'object'),
  constraint goal_blocks_date_order_check check (end_date is null or end_date >= start_date)
);

create index if not exists goal_blocks_user_status_idx
  on public.goal_blocks(user_id, status);

create index if not exists goal_blocks_user_dates_idx
  on public.goal_blocks(user_id, start_date, end_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_goal_blocks_updated_at on public.goal_blocks;

create trigger set_goal_blocks_updated_at
before update on public.goal_blocks
for each row
execute function public.set_updated_at();

alter table public.goal_blocks enable row level security;

drop policy if exists "Users can read own goal blocks" on public.goal_blocks;
drop policy if exists "Users can insert own goal blocks" on public.goal_blocks;
drop policy if exists "Users can update own goal blocks" on public.goal_blocks;
drop policy if exists "Users can delete own goal blocks" on public.goal_blocks;

create policy "Users can read own goal blocks"
on public.goal_blocks
for select
using (auth.uid() = user_id);

create policy "Users can insert own goal blocks"
on public.goal_blocks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own goal blocks"
on public.goal_blocks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own goal blocks"
on public.goal_blocks
for delete
using (auth.uid() = user_id);
