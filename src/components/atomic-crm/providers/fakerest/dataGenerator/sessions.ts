import { datatype, random } from "faker/locale/en_US";

import type { Booking, Session, SessionSummary } from "../../../types";
import type { Db } from "./types";

const DURATION_OPTIONS = [60, 90, 120, 150] as const;

/**
 * Generates fake session (scheduled class) base records.
 * Sessions are spread across the next 12 weeks to populate the upcoming-sessions list.
 */
export const generateSessions = (db: Db, size = 40): Session[] =>
  Array.from(Array(size).keys()).map<Session>((id) => {
    const sale = random.arrayElement(db.sales);
    // Spread sessions across the next 12 weeks (some may be in the past for variety)
    const offsetDays = datatype.number({ min: -14, max: 84 });
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + offsetDays);
    // Fix to a round hour so the datetime-local input value is predictable
    startsAt.setMinutes(0, 0, 0);

    return {
      id,
      created_at: new Date().toISOString(),
      starts_at: startsAt.toISOString(),
      duration_minutes: random.arrayElement(DURATION_OPTIONS),
      capacity: 15,
      overbooking: 2,
      notes: datatype.boolean() ? "Regular class" : null,
      sales_id: sale.id,
    };
  });

/**
 * Derives the sessions_summary view from the base session records.
 * nb_booked = count of live (non-cancelled) bookings per session.
 * nb_attended = count of attended bookings per session.
 */
export const toSessionsSummary = (
  sessions: Session[],
  bookings: Booking[],
): SessionSummary[] =>
  sessions.map((s) => {
    const sessionBookings = bookings.filter((b) => b.session_id === s.id);
    return {
      ...s,
      nb_booked: sessionBookings.filter((b) => b.status !== "cancelled").length,
      nb_attended: sessionBookings.filter((b) => b.status === "attended")
        .length,
    };
  });
