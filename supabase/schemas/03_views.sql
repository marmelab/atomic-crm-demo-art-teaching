--
-- Views
-- This file declares all views in the public schema.
--

create or replace view public.activity_log with (security_invoker = on) as
select
    ('contact.' || co.id || '.created') as id,
    'contact.created' as type,
    co.first_seen as date,
    co.sales_id,
    to_json(co.*) as contact,
    null::json as contact_note
from public.contacts co
union all
select
    ('contactNote.' || cn.id || '.created') as id,
    'contactNote.created' as type,
    cn.date,
    cn.sales_id,
    null::json as contact,
    to_json(cn.*) as contact_note
from public.contact_notes cn;

create or replace view public.contacts_summary with (security_invoker = on) as
select
    co.id,
    co.first_name,
    co.last_name,
    co.gender,
    co.title,
    co.background,
    co.avatar,
    co.first_seen,
    co.last_seen,
    co.has_newsletter,
    co.status,
    co.tags,
    co.sales_id,
    co.linkedin_url,
    co.email_jsonb,
    co.phone_jsonb,
    (jsonb_path_query_array(co.email_jsonb, '$[*]."email"'))::text as email_fts,
    (jsonb_path_query_array(co.phone_jsonb, '$[*]."number"'))::text as phone_fts,
    count(distinct t.id) filter (where t.done_date is null) as nb_tasks
from public.contacts co
    left join public.tasks t on co.id = t.contact_id
group by co.id;

-- subscriptions_summary: exposes sessions_used and sessions_remaining.
-- Currently sessions_used is 0 (bookings table does not exist yet — see TASK-005).
-- TASK-005 will rewrite this view to LEFT JOIN bookings and compute the real
-- attended count: sessions_used = COUNT(*) FILTER (WHERE b.status = 'attended').
create or replace view public.subscriptions_summary with (security_invoker = on) as
select
    s.id,
    s.created_at,
    s.contact_id,
    s.total_sessions,
    s.purchased_at,
    s.price,
    s.notes,
    s.sales_id,
    0::bigint as sessions_used,
    s.total_sessions::bigint as sessions_remaining
from public.subscriptions s;

-- sessions_summary: exposes nb_booked and nb_attended.
-- Currently both are 0 because the bookings table does not exist yet (TASK-005).
-- TASK-005 will rewrite this view to LEFT JOIN bookings and compute the real counts:
--   nb_booked  = COUNT(*) FILTER (WHERE b.status <> 'cancelled')
--   nb_attended = COUNT(*) FILTER (WHERE b.status = 'attended')
create or replace view public.sessions_summary with (security_invoker = on) as
select
    s.id,
    s.created_at,
    s.starts_at,
    s.duration_minutes,
    s.capacity,
    s.overbooking,
    s.notes,
    s.sales_id,
    0::bigint as nb_booked,
    0::bigint as nb_attended
from public.sessions s;

create or replace view public.init_state with (security_invoker = off) as
select count(sub.id) as is_initialized
from (
    select sales.id from public.sales limit 1
) sub;
