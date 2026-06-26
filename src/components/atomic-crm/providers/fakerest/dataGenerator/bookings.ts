import { datatype, random } from "faker/locale/en_US";

import type { Booking, BookingStatus, BookingType } from "../../../types";
import { MAX_BOOKINGS_PER_SESSION } from "../../../scheduleDefaults";
import type { Db } from "./types";

/** Status distribution for past sessions: realistic attended/no_show/cancelled mix. */
const PAST_STATUS_WEIGHTS: { status: BookingStatus; weight: number }[] = [
  { status: "attended", weight: 65 },
  { status: "no_show", weight: 15 },
  { status: "cancelled", weight: 20 },
];

/**
 * Picks a booking status for a past session according to the configured weights.
 */
const pickPastStatus = (): BookingStatus => {
  const total = PAST_STATUS_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = datatype.number({ min: 0, max: total - 1 });
  for (const { status, weight } of PAST_STATUS_WEIGHTS) {
    if (roll < weight) return status;
    roll -= weight;
  }
  return "attended";
};

/**
 * Generates fake booking records.
 *
 * Rules:
 * - Past sessions receive 8–17 bookings with a realistic attended/no_show/cancelled mix.
 * - Future sessions receive 1–10 bookings with status 'booked'.
 * - ~70 % of bookings use type 'subscription' (with a linked subscription_id from the
 *   same contact when available); the remainder are 'single' or 'discovery'.
 * - The live (non-cancelled) booking count per session never exceeds the 17-slot cap.
 */
export const generateBookings = (db: Db): Booking[] => {
  const now = new Date();
  const bookings: Booking[] = [];
  let nextId = 0;

  for (const session of db.sessions) {
    const isPast = new Date(session.starts_at) < now;
    const count = isPast
      ? datatype.number({ min: 8, max: MAX_BOOKINGS_PER_SESSION })
      : datatype.number({ min: 1, max: 10 });

    // Track live bookings per session to respect the cap
    let liveCount = 0;

    // Shuffle contacts to avoid always picking the same ones
    const shuffledContacts = random.arrayElements(
      db.contacts,
      Math.min(count, db.contacts.length),
    );

    for (const contact of shuffledContacts) {
      const status: BookingStatus = isPast ? pickPastStatus() : "booked";
      const isLive = status !== "cancelled";

      // Enforce capacity cap for live bookings
      if (isLive && liveCount >= MAX_BOOKINGS_PER_SESSION) {
        break;
      }

      // Decide booking type: ~70 % subscription, rest single/discovery
      const roll = datatype.number({ min: 0, max: 99 });
      let type: BookingType;
      let subscriptionId: number | null = null;

      if (roll < 70) {
        // Try to find a subscription belonging to this contact
        const contactSubscriptions = db.subscriptions.filter(
          (s) => s.contact_id === contact.id,
        );
        if (contactSubscriptions.length > 0) {
          type = "subscription";
          subscriptionId = random.arrayElement(contactSubscriptions)
            .id as number;
        } else {
          // Fall back to single if no subscription exists
          type = "single";
        }
      } else {
        type = roll < 85 ? "single" : "discovery";
      }

      const cancelledAt =
        status === "cancelled"
          ? new Date(session.starts_at).toISOString()
          : null;

      bookings.push({
        id: nextId++,
        created_at: session.starts_at,
        session_id: session.id,
        contact_id: contact.id,
        subscription_id: subscriptionId,
        type,
        status,
        cancelled_at: cancelledAt,
        sales_id: contact.sales_id,
      });

      if (isLive) {
        liveCount++;
      }
    }
  }

  return bookings;
};
