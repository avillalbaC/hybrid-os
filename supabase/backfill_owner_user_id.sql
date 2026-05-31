-- 1. Find the owner user id after logging in once with Google.
-- Replace the placeholder email before running.
select id, email
from auth.users
where email = '<OWNER_GOOGLE_EMAIL>';

-- 2. Verify current ownership state before backfill.
select 'training_sessions' as table_name, count(*) as null_user_id_count
from public.training_sessions
where user_id is null
union all
select 'raw_imports' as table_name, count(*) as null_user_id_count
from public.raw_imports
where user_id is null
union all
select 'training_exercises' as table_name, count(*) as null_user_id_count
from public.training_exercises
where user_id is null
union all
select 'body_checks' as table_name, count(*) as null_user_id_count
from public.body_checks
where user_id is null
union all
select 'nutrition_checks' as table_name, count(*) as null_user_id_count
from public.nutrition_checks
where user_id is null;

select 'training_sessions' as table_name, user_id, count(*) as row_count
from public.training_sessions
group by user_id
union all
select 'raw_imports' as table_name, user_id, count(*) as row_count
from public.raw_imports
group by user_id
union all
select 'training_exercises' as table_name, user_id, count(*) as row_count
from public.training_exercises
group by user_id
union all
select 'body_checks' as table_name, user_id, count(*) as row_count
from public.body_checks
group by user_id
union all
select 'nutrition_checks' as table_name, user_id, count(*) as row_count
from public.nutrition_checks
group by user_id;

-- 3. Backfill existing single-user data.
-- Replace the placeholder with the id returned by the auth.users query.
update public.training_sessions
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.raw_imports
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.training_exercises
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.body_checks
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.nutrition_checks
set user_id = '<OWNER_USER_ID>'
where user_id is null;

-- 4. Verify that all existing rows now have an owner.
select 'training_sessions' as table_name, count(*) as null_user_id_count
from public.training_sessions
where user_id is null
union all
select 'raw_imports' as table_name, count(*) as null_user_id_count
from public.raw_imports
where user_id is null
union all
select 'training_exercises' as table_name, count(*) as null_user_id_count
from public.training_exercises
where user_id is null
union all
select 'body_checks' as table_name, count(*) as null_user_id_count
from public.body_checks
where user_id is null
union all
select 'nutrition_checks' as table_name, count(*) as null_user_id_count
from public.nutrition_checks
where user_id is null;
