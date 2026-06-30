/**
 * Hook that owns the calendar's stateful concerns: view mode, anchor date,
 * and navigation actions.
 *
 * State is persisted in URL search params so a page refresh restores the same
 * view and period:
 *   ?view=week&date=2025-03-17
 *
 * All mutations produce a new URL via the router's `setSearchParams` — they do
 * not mutate state directly.
 */

import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { isValid, parseISO } from "date-fns";

import {
  getMonthRange,
  getWeekRange,
  nextPeriodAnchor,
  prevPeriodAnchor,
  toCalendarDayKey,
} from "./calendarDates";

/** Calendar display mode. */
export type CalendarViewMode = "week" | "month";

const PARAM_VIEW = "view";
const PARAM_DATE = "date";

const DEFAULT_MODE: CalendarViewMode = "week";

/**
 * Parses the view mode from URL params.  Falls back to the default if the
 * value is absent or unrecognised.
 */
function parseViewMode(raw: string | null): CalendarViewMode {
  if (raw === "week" || raw === "month") return raw;
  return DEFAULT_MODE;
}

/**
 * Parses an ISO date string (yyyy-MM-dd) from URL params.  Falls back to
 * today's date if the value is absent or invalid.
 */
function parseAnchorDate(raw: string | null): Date {
  if (raw) {
    const parsed = parseISO(raw);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

/** Return value of {@link useCalendarState}. */
export interface CalendarState {
  /** Current display mode. */
  viewMode: CalendarViewMode;
  /** The focused/anchor date driving the visible period. */
  anchorDate: Date;
  /**
   * Inclusive start of the visible date range.
   * Derived from anchorDate + viewMode.
   */
  rangeStart: Date;
  /**
   * Exclusive end of the visible date range.
   * Derived from anchorDate + viewMode.
   */
  rangeEnd: Date;
  /** Navigate to the previous week or month. */
  goToPrev: () => void;
  /** Navigate to the next week or month. */
  goToNext: () => void;
  /** Jump to today's date (keeps current view mode). */
  goToToday: () => void;
  /** Switch display mode while keeping the anchor date. */
  setViewMode: (mode: CalendarViewMode) => void;
}

/**
 * Manages calendar view state (mode + anchor date) in URL search params.
 *
 * The hook reads `?view` and `?date` from the URL on mount and derives the
 * visible range from them.  Navigation actions update both params atomically
 * using `setSearchParams`, which triggers a re-render with the new URL.
 *
 * @returns {@link CalendarState} — reactive, URL-driven.
 */
export function useCalendarState(): CalendarState {
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = parseViewMode(searchParams.get(PARAM_VIEW));
  const anchorDate = parseAnchorDate(searchParams.get(PARAM_DATE));

  const [rangeStart, rangeEnd] =
    viewMode === "week" ? getWeekRange(anchorDate) : getMonthRange(anchorDate);

  /** Writes new view + date params while preserving unrelated search params. */
  const navigate = useCallback(
    (newMode: CalendarViewMode, newAnchor: Date) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PARAM_VIEW, newMode);
          next.set(PARAM_DATE, toCalendarDayKey(newAnchor));
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const goToPrev = useCallback(
    () => navigate(viewMode, prevPeriodAnchor(anchorDate, viewMode)),
    [navigate, viewMode, anchorDate],
  );

  const goToNext = useCallback(
    () => navigate(viewMode, nextPeriodAnchor(anchorDate, viewMode)),
    [navigate, viewMode, anchorDate],
  );

  const goToToday = useCallback(
    () => navigate(viewMode, new Date()),
    [navigate, viewMode],
  );

  const setViewMode = useCallback(
    (mode: CalendarViewMode) => navigate(mode, anchorDate),
    [navigate, anchorDate],
  );

  return {
    viewMode,
    anchorDate,
    rangeStart,
    rangeEnd,
    goToPrev,
    goToNext,
    goToToday,
    setViewMode,
  };
}
