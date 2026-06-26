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
    count(distinct t.id) filter (where t.done_date is null) as nb_tasks,
    coalesce(sum(ss.sessions_remaining), 0) as total_sessions_remaining
from public.contacts co
    left join public.tasks t on co.id = t.contact_id
    left join public.subscriptions_summary ss on co.id = ss.contact_id
group by co.id;

-- subscriptions_summary: sessions_used = count of attended bookings on the pack;
-- sessions_remaining = total_sessions - sessions_used.
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
    count(b.id) filter (where b.status = 'attended') as sessions_used,
    s.total_sessions - count(b.id) filter (where b.status = 'attended') as sessions_remaining
from public.subscriptions s
left join public.bookings b on b.subscription_id = s.id
group by s.id;

-- sessions_summary: nb_booked = live (non-cancelled) booking count;
-- nb_attended = count of attended bookings.
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
    count(b.id) filter (where b.status <> 'cancelled') as nb_booked,
    count(b.id) filter (where b.status = 'attended') as nb_attended
from public.sessions s
left join public.bookings b on b.session_id = s.id
group by s.id;

-- monthly_attendance: one row per (contact, calendar month), counting attended bookings.
-- id is a synthetic string: contact_id || '-' || 'YYYY-MM'.
create or replace view public.monthly_attendance with (security_invoker = on) as
select
    (co.id::text || '-' || to_char(date_trunc('month', s.starts_at), 'YYYY-MM')) as id,
    co.id as contact_id,
    co.first_name,
    co.last_name,
    date_trunc('month', s.starts_at)::date as month,
    count(b.id) as sessions_attended
from public.bookings b
join public.sessions s on s.id = b.session_id
join public.contacts co on co.id = b.contact_id
where b.status = 'attended'
group by co.id, co.first_name, co.last_name, date_trunc('month', s.starts_at);

create or replace view public.init_state with (security_invoker = off) as
select count(sub.id) as is_initialized
from (
    select sales.id from public.sales limit 1
) sub;
