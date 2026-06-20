drop policy if exists "Users can delete own programming sessions" on public.programming_sessions;

create policy "Users can delete own programming sessions"
on public.programming_sessions
for delete
using (auth.uid() = user_id);
