-- migration(b5ea0718): drop contacts.status column
--
-- The session removed the `status` field from contacts entirely (the field
-- was carried over from the generic CRM template but is unused in this
-- art-teaching deployment). The contacts_summary view referenced co.status,
-- so it must be recreated without it.
--
-- contacts_summary has no dependents in this schema (confirmed in previous
-- migration 20260626115748). DROP + CREATE is required here because
-- CREATE OR REPLACE VIEW cannot remove an existing column (Postgres 42P16).

-- 1. Drop contacts_summary view (no dependents; grants re-issued below).
DROP VIEW IF EXISTS public.contacts_summary;

-- 2. Drop the status column from contacts (idempotent).
ALTER TABLE public.contacts DROP COLUMN IF EXISTS status;

-- 3. Recreate contacts_summary without co.status.
--    Column order matches the previous view minus the removed status column
--    (positions 1..10 unchanged: id through has_newsletter; tags is now 11,
--    etc.). The view joins subscriptions_summary which is defined earlier.
CREATE OR REPLACE VIEW public.contacts_summary WITH (security_invoker = on) AS
SELECT
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
    co.tags,
    co.sales_id,
    co.linkedin_url,
    co.email_jsonb,
    co.phone_jsonb,
    (jsonb_path_query_array(co.email_jsonb, '$[*]."email"'))::text AS email_fts,
    (jsonb_path_query_array(co.phone_jsonb, '$[*]."number"'))::text AS phone_fts,
    count(DISTINCT t.id) FILTER (WHERE t.done_date IS NULL) AS nb_tasks,
    coalesce(sum(ss.sessions_remaining), 0) AS total_sessions_remaining
FROM public.contacts co
    LEFT JOIN public.tasks t ON co.id = t.contact_id
    LEFT JOIN public.subscriptions_summary ss ON co.id = ss.contact_id
GROUP BY co.id;

-- 4. Re-grant permissions (grants are lost when a view is dropped).
GRANT ALL ON TABLE public.contacts_summary TO anon;
GRANT ALL ON TABLE public.contacts_summary TO authenticated;
GRANT ALL ON TABLE public.contacts_summary TO service_role;
