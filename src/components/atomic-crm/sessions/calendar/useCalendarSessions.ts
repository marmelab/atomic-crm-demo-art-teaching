/**
 * Data-fetching hook for the calendar views.
 *
 * Given a visible date range [rangeStart, rangeEnd), fetches only the
 * SessionSummary records whose starts_at falls within that window, then
 * groups them by calendar day key (yyyy-MM-dd) for O(1) lookup by the view
 * components.
 *
 * The fetch is delegated to ra-core's `useGetList` which relies on the
 * sessions dataProvider and React Query's cache — switching periods triggers
 * exactly one query for the new range and reuses cached results where ranges
 * overlap.
 */

import { useMemo } from "react";
import { useGetList } from "ra-core";
import { format } from "date-fns";

import type { SessionSummary } from "../../types";
import type { CalendarDayKey } from "./calendarDates";

/** Map from yyyy-MM-dd key to the sessions starting on that day. */
export type SessionsByDay = Map<CalendarDayKey, SessionSummary[]>;

/** Return value of {@link useCalendarSessions}. */
export interface CalendarSessionsResult {
  /** Day-indexed session map for O(1) lookup in view components. */
  sessionsByDay: SessionsByDay;
  /** True while the initial fetch (or a range-change refetch) is in-flight. */
  isPending: boolean;
  /** Set when the fetch fails; null otherwise. */
  error: Error | null;
  /** All fetched sessions in the window (flat list). */
  sessions: SessionSummary[];
}

/**
 * Fetches sessions within the given date range and groups them by day.
 *
 * @param rangeStart - Inclusive lower bound (ISO-formatted by this hook).
 * @param rangeEnd   - Exclusive upper bound (ISO-formatted by this hook).
 * @returns {@link CalendarSessionsResult} — stable reference identity when
 *   data has not changed, thanks to `useMemo`.
 */
export function useCalendarSessions(
  rangeStart: Date,
  rangeEnd: Date,
): CalendarSessionsResult {
  const rangeStartIso = rangeStart.toISOString();
  const rangeEndIso = rangeEnd.toISOString();

  const {
    data: sessions = [],
    isPending,
    error,
  } = useGetList<SessionSummary>("sessions", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "starts_at", order: "ASC" },
    filter: {
      "starts_at@gte": rangeStartIso,
      "starts_at@lt": rangeEndIso,
    },
  });

  const sessionsByDay = useMemo<SessionsByDay>(() => {
    const map: SessionsByDay = new Map();

    for (const session of sessions) {
      const key: CalendarDayKey = format(
        new Date(session.starts_at),
        "yyyy-MM-dd",
      );
      const existing = map.get(key);
      if (existing) {
        existing.push(session);
      } else {
        map.set(key, [session]);
      }
    }

    return map;
  }, [sessions]);

  return {
    sessionsByDay,
    isPending,
    error: error as Error | null,
    sessions,
  };
}
