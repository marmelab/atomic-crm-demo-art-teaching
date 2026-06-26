# MEMORY

Durable Atomic CRM knowledge. One sentence per bullet, freshest first. Maintained by the `documentator` agent — see [.claude/agents/documentator.md](.claude/agents/documentator.md).

## Business Knowledge

- The app was repurposed from a generic CRM into a drawing-teacher management tool; contacts are students (Élèves), and companies/deals were removed entirely.
- Three new resources were added: sessions (scheduled classes), subscriptions (prepaid session packs), and bookings (junction between students and sessions).
- A session has `capacity` (default 15) and `overbooking` (default 2) columns; the DB trigger `check_session_capacity` blocks inserts/updates when live (non-cancelled) bookings reach `capacity + overbooking` (17).
- A booking's `type` is one of `subscription`, `single`, or `discovery`; `status` is one of `booked`, `attended`, `cancelled`, or `no_show`.
- A partial unique index on `bookings (session_id, contact_id) where status <> 'cancelled'` prevents double-booking the same student in the same session, but allows re-booking after cancellation.
- `subscriptions.total_sessions` defaults to 20 and is a stored value; `sessions_remaining` is computed in the `subscriptions_summary` view as `total_sessions - count(bookings where status = 'attended')` — it is never stored.
- Only bookings with `status = 'attended'` decrement a subscription pack; `booked`, `no_show`, and `cancelled` statuses do not.
- `contacts_summary` was extended with `total_sessions_remaining` (sum of all open subscription packs for a student).
- Three summary views support the UI: `subscriptions_summary` (pack consumption), `sessions_summary` (live/attended head-counts per class), and `monthly_attendance` (per-student per-month attended count, with a synthetic string id `contact_id-YYYY-MM`).
- The student self-booking portal was explicitly deferred to Phase 2, as it requires an RLS/auth rewrite.
- Core resources: contacts, companies, deals (Kanban pipeline), tasks, notes, tags, and sales (team members).
- Domain options (genders, sectors, deal stages/categories, note statuses, task types) are `<CRM>` props in `src/App.tsx`, not hardcoded.
- Sales users sync with Supabase `auth.users` via triggers; deletion is unsupported — accounts are disabled instead.
- Aggregated reads use database views (`contacts_summary`, `companies_summary`), which FakeRest emulates in the frontend.
- Two interchangeable data providers: Supabase (production) and FakeRest (in-browser demo, resets on reload).
- Filters use `ra-data-postgrest` syntax (`field_name@operator`); operators must be supported by the FakeRest `supabaseAdapter`.
