import { datatype, random } from "faker/locale/en_US";

import type { Subscription, SubscriptionSummary } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const SESSION_PACK_SIZES = [5, 10, 20, 30] as const;
const PRICE_PER_SESSION = [10, 12, 15] as const;

/**
 * Generates fake subscription (prepaid session pack) base records.
 */
export const generateSubscriptions = (db: Db, size = 100): Subscription[] =>
  Array.from(Array(size).keys()).map<Subscription>((id) => {
    const contact = random.arrayElement(db.contacts);
    const total_sessions = random.arrayElement(SESSION_PACK_SIZES);
    const purchased_at = randomDate(new Date("2023-01-01"))
      .toISOString()
      .split("T")[0];

    return {
      id,
      created_at: purchased_at + "T00:00:00.000Z",
      contact_id: contact.id,
      total_sessions,
      purchased_at,
      price: datatype.boolean()
        ? parseFloat(
            (total_sessions * random.arrayElement(PRICE_PER_SESSION)).toFixed(
              2,
            ),
          )
        : null,
      notes: datatype.boolean() ? "No notes" : null,
      sales_id: contact.sales_id,
    };
  });

/**
 * Derives the subscriptions_summary view from the base subscription records.
 * sessions_used is 0 because the bookings table does not exist yet (TASK-005).
 * Once bookings ship, sessions_used should count attended bookings for the pack.
 */
export const toSubscriptionsSummary = (
  subscriptions: Subscription[],
): SubscriptionSummary[] =>
  subscriptions.map((s) => ({
    ...s,
    sessions_used: 0,
    sessions_remaining: s.total_sessions,
  }));
