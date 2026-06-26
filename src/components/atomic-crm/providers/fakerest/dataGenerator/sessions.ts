import { datatype, random } from "faker/locale/en_US";

import type { Session, SessionSummary } from "../../../types";
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
 * nb_booked and nb_attended are both 0 because the bookings table does not exist yet (TASK-005).
 * Once bookings ship, these should be computed from booking records for each session.
 */
export const toSessionsSummary = (sessions: Session[]): SessionSummary[] =>
  sessions.map((s) => ({
    ...s,
    nb_booked: 0,
    nb_attended: 0,
  }));
