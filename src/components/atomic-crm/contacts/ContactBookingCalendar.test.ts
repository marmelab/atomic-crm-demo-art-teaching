/**
 * Unit tests for ContactBookingCalendar's pure helpers.
 *
 * groupBookingsByDay covers:
 * - A booking lands in the day cell matching its session's starts_at date.
 * - Multiple bookings on the same day are grouped together.
 * - Bookings whose session_id is not in the sessions map are skipped.
 * - The empty-month case: an empty bookings list produces an empty map.
 *
 * computeIsPending covers:
 * - Zero-bookings month: sessionsEnabled=false → sessionsPending is ignored → not stuck.
 * - Normal in-flight state: bookings loading → pending.
 * - Normal in-flight state: bookings done, sessions loading → pending.
 * - All done: both flags false → not pending.
 */

import { describe, expect, it } from "vitest";
import { groupBookingsByDay, computeIsPending } from "./ContactBookingCalendar";
import type { Booking, Session } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSession(id: number, startsAt: string): Session {
  return {
    id,
    starts_at: startsAt,
    duration_minutes: 60,
    capacity: 10,
    overbooking: 0,
    created_at: "2026-01-01T00:00:00Z",
  };
}

function makeBooking(id: number, sessionId: number): Booking {
  return {
    id,
    session_id: sessionId,
    contact_id: 1,
    type: "subscription",
    status: "booked",
    created_at: "2026-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// groupBookingsByDay
// ---------------------------------------------------------------------------

describe("groupBookingsByDay", () => {
  it("returns an empty map when bookings is empty", () => {
    const result = groupBookingsByDay([], new Map());
    expect(result.size).toBe(0);
  });

  it("places a booking in the day cell matching its session's starts_at", () => {
    // Arrange
    const session = makeSession(10, "2026-06-15T09:00:00Z");
    const booking = makeBooking(1, 10);
    const sessionsById = new Map([[10, session]]);

    // Act
    const result = groupBookingsByDay([booking], sessionsById);

    // Assert
    expect(result.has("2026-06-15")).toBe(true);
    expect(result.get("2026-06-15")).toHaveLength(1);
    expect(result.get("2026-06-15")![0].booking.id).toBe(1);
  });

  it("groups multiple bookings on the same day together", () => {
    // Arrange — two sessions on the same calendar day (different times)
    const session1 = makeSession(10, "2026-06-15T09:00:00Z");
    const session2 = makeSession(11, "2026-06-15T18:00:00Z");
    const booking1 = makeBooking(1, 10);
    const booking2 = makeBooking(2, 11);
    const sessionsById = new Map([
      [10, session1],
      [11, session2],
    ]);

    // Act
    const result = groupBookingsByDay([booking1, booking2], sessionsById);

    // Assert
    expect(result.get("2026-06-15")).toHaveLength(2);
  });

  it("places bookings on separate days in separate cells", () => {
    // Arrange
    const session1 = makeSession(10, "2026-06-10T09:00:00Z");
    const session2 = makeSession(11, "2026-06-20T09:00:00Z");
    const booking1 = makeBooking(1, 10);
    const booking2 = makeBooking(2, 11);
    const sessionsById = new Map([
      [10, session1],
      [11, session2],
    ]);

    // Act
    const result = groupBookingsByDay([booking1, booking2], sessionsById);

    // Assert
    expect(result.size).toBe(2);
    expect(result.has("2026-06-10")).toBe(true);
    expect(result.has("2026-06-20")).toBe(true);
  });

  it("skips bookings whose session_id is not in the sessions map", () => {
    // Arrange — session_id 99 is not in the map
    const booking = makeBooking(1, 99);

    // Act
    const result = groupBookingsByDay([booking], new Map());

    // Assert
    expect(result.size).toBe(0);
  });

  it("stores the dayKey on each BookingWithDate entry", () => {
    // Arrange
    const session = makeSession(10, "2026-03-07T10:00:00Z");
    const booking = makeBooking(1, 10);
    const sessionsById = new Map([[10, session]]);

    // Act
    const result = groupBookingsByDay([booking], sessionsById);

    // Assert
    const entry = result.get("2026-03-07")![0];
    expect(entry.dayKey).toBe("2026-03-07");
  });
});

// ---------------------------------------------------------------------------
// computeIsPending
// ---------------------------------------------------------------------------

describe("computeIsPending", () => {
  it("returns false when a contact has zero bookings (sessionsEnabled=false)", () => {
    // Regression test: a disabled query stays in "pending" status forever in
    // @tanstack/query-core. If we naively OR in sessionsPending when the sessions
    // query is never started, a contact with no bookings gets stuck on the
    // loading spinner indefinitely and the empty-state panel is never shown.
    //
    // Arrange: bookings finished loading (bookingsPending=false), no bookings
    // exist so the sessions query is disabled (sessionsEnabled=false).
    // Even though react-query reports sessionsPending=true for a disabled query,
    // computeIsPending must return false.
    expect(computeIsPending(false, false, true)).toBe(false);
  });

  it("returns true while the bookings query is still in-flight", () => {
    // Arrange: bookings still loading — sessions query not yet enabled
    expect(computeIsPending(true, false, false)).toBe(true);
  });

  it("returns true while the sessions query is in-flight (enabled)", () => {
    // Arrange: bookings done, at least one booking exists, sessions loading
    expect(computeIsPending(false, true, true)).toBe(true);
  });

  it("returns false when both active queries have resolved", () => {
    // Arrange: bookings done, sessions done (or were never needed)
    expect(computeIsPending(false, true, false)).toBe(false);
  });

  it("returns false when bookings done and sessions query is disabled and not pending", () => {
    // Belt-and-suspenders: disabled query with sessionsPending=false
    expect(computeIsPending(false, false, false)).toBe(false);
  });
});
