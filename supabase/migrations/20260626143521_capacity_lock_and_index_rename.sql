-- Rename the partial unique index to the repo's <table>_<col>_idx convention.
-- ALTER ... RENAME is lossless (no rebuild), unlike the diff tool's drop+create.
alter index if exists "public"."uq__bookings__session_contact__active"
    rename to "bookings_active_session_contact_idx";

-- Serialize concurrent bookings per session to close the capacity TOCTOU race.
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_session_capacity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_capacity smallint;
  v_overbooking smallint;
  v_live_count bigint;
BEGIN
  -- Cancellations never consume capacity; skip check
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Serialize concurrent bookings for the same session. Without this lock,
  -- two concurrent inserts under READ COMMITTED each count the other's
  -- uncommitted row as absent, both pass the capacity check, and the session
  -- is overbooked past the cap (TOCTOU race). The transaction-scoped advisory
  -- lock forces the second transaction to wait until the first commits, so
  -- the count below always reflects all committed live bookings.
  PERFORM pg_advisory_xact_lock(NEW.session_id);

  -- Read capacity and overbooking allowance for this session
  SELECT capacity, overbooking
    INTO v_capacity, v_overbooking
    FROM public.sessions
   WHERE id = NEW.session_id;

  -- Count existing live (non-cancelled) bookings for the session,
  -- excluding the current row on UPDATE so a status change doesn't
  -- count the row twice.
  SELECT COUNT(*)
    INTO v_live_count
    FROM public.bookings
   WHERE session_id = NEW.session_id
     AND status <> 'cancelled'
     AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF v_live_count >= (v_capacity + v_overbooking) THEN
    RAISE EXCEPTION
      'Session % is fully booked (capacity=%, overbooking=%, live_bookings=%)',
      NEW.session_id, v_capacity, v_overbooking, v_live_count
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$
;
