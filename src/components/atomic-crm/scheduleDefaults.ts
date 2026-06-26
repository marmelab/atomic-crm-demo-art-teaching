/**
 * Default values for the scheduling domain (sessions, capacity, packs).
 *
 * These are the single source of truth shared by the create forms, the SQL
 * schema defaults, the FakeRest seed generators, and the e2e fixtures. Keep
 * them in sync with the column defaults in supabase/schemas/01_tables.sql.
 */

/** Default seats per class. */
export const DEFAULT_SESSION_CAPACITY = 15;

/** Default extra seats bookable beyond capacity (waiting-list style). */
export const DEFAULT_SESSION_OVERBOOKING = 2;

/** Default class length, in minutes. */
export const DEFAULT_SESSION_DURATION_MINUTES = 120;

/** Default number of prepaid sessions in a new pack. */
export const DEFAULT_PACK_SIZE = 20;

/** Highest number of live (non-cancelled) bookings a session can hold. */
export const MAX_BOOKINGS_PER_SESSION =
  DEFAULT_SESSION_CAPACITY + DEFAULT_SESSION_OVERBOOKING;
