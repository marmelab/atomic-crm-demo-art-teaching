import type { Booking, MonthlyAttendance, Session } from "../../../types";
import type { Db } from "./types";

/**
 * Derives the monthly_attendance view from bookings, sessions, and contacts.
 *
 * For each (contact, calendar month) pair with at least one attended booking,
 * produces one MonthlyAttendance record whose id = "<contact_id>-<YYYY-MM>".
 * Mirrors the SQL view in supabase/schemas/03_views.sql.
 */
export const toMonthlyAttendance = (db: Db): MonthlyAttendance[] => {
  /** Map key: "<contact_id>-<YYYY-MM>" */
  const map = new Map<
    string,
    {
      contact_id: number;
      first_name: string;
      last_name: string;
      month: string;
      sessions_attended: number;
    }
  >();

  const sessionById = new Map<Booking["session_id"], Session>(
    db.sessions.map((s) => [s.id, s]),
  );

  const contactById = new Map(db.contacts.map((c) => [c.id, c]));

  for (const booking of db.bookings) {
    if (booking.status !== "attended") continue;

    const session = sessionById.get(booking.session_id);
    if (!session) continue;

    const contact = contactById.get(booking.contact_id);
    if (!contact) continue;

    const monthStart = new Date(session.starts_at);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const yearMonth = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
    const key = `${contact.id}-${yearMonth}`;

    const existing = map.get(key);
    if (existing) {
      existing.sessions_attended += 1;
    } else {
      map.set(key, {
        contact_id: contact.id as number,
        first_name: contact.first_name,
        last_name: contact.last_name,
        month: monthStart.toISOString().split("T")[0],
        sessions_attended: 1,
      });
    }
  }

  return Array.from(map.entries()).map(([id, row]) => ({ id, ...row }));
};

/**
 * Computes total_sessions_remaining per contact from subscriptions_summary.
 * Returns a map from contact_id to total remaining sessions.
 */
export const computeSessionsRemainingByContact = (
  db: Db,
): Map<number, number> => {
  const result = new Map<number, number>();
  for (const ss of db.subscriptions_summary) {
    const contactId = ss.contact_id as number;
    result.set(contactId, (result.get(contactId) ?? 0) + ss.sessions_remaining);
  }
  return result;
};
