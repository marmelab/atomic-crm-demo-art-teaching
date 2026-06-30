/**
 * Date utility functions for the calendar views.
 *
 * Wraps date-fns to produce the day matrices rendered by week and month views.
 * All functions are pure and produce new Date arrays — they do not mutate input.
 */

import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

/** Stable date key used as O(1) lookup key in session day-group maps. */
export type CalendarDayKey = string; // "yyyy-MM-dd"

/** Options for locale-aware week start (0 = Sunday, 1 = Monday). */
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

/**
 * Returns the 7 Date objects that make up the calendar week containing the
 * given anchor date. Week starts on Monday per {@link WEEK_START_OPTIONS}.
 *
 * @param anchor - Any date within the desired week.
 * @returns Array of exactly 7 Date objects, Monday through Sunday.
 */
export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, WEEK_START_OPTIONS);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Returns the month grid for the calendar month containing the anchor date.
 *
 * The grid is an array of week arrays. Each week always has exactly 7 Date
 * cells. Weeks are padded with leading days from the previous month (before
 * the 1st) and trailing days from the next month (after the last day) so
 * every row is complete. The grid always has at least 4 rows and at most 6.
 *
 * @param anchor - Any date within the desired month.
 * @returns Array of week arrays, each containing 7 Date objects.
 */
export function getMonthGrid(anchor: Date): Date[][] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  // Pad the grid boundaries to full weeks
  const gridStart = startOfWeek(monthStart, WEEK_START_OPTIONS);
  const gridEnd = endOfWeek(monthEnd, WEEK_START_OPTIONS);

  const weeks: Date[][] = [];
  let current = gridStart;

  while (current <= gridEnd) {
    const week: Date[] = Array.from({ length: 7 }, (_, i) =>
      addDays(current, i),
    );
    weeks.push(week);
    current = addDays(current, 7);
  }

  return weeks;
}

/**
 * Returns the inclusive start and exclusive end of the visible date range for
 * a week view, given the focused date.
 *
 * @param anchor - Any date within the desired week.
 * @returns Tuple [rangeStart, rangeEnd) — rangeEnd is exclusive (day after last cell).
 */
export function getWeekRange(anchor: Date): [Date, Date] {
  const start = startOfWeek(anchor, WEEK_START_OPTIONS);
  const end = addDays(start, 7); // exclusive
  return [start, end];
}

/**
 * Returns the inclusive start and exclusive end of the visible date range for
 * a month view, including grid padding days from adjacent months.
 *
 * @param anchor - Any date within the desired month.
 * @returns Tuple [rangeStart, rangeEnd) — rangeEnd is exclusive (day after last cell).
 */
export function getMonthRange(anchor: Date): [Date, Date] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const start = startOfWeek(monthStart, WEEK_START_OPTIONS);
  const end = addDays(endOfWeek(monthEnd, WEEK_START_OPTIONS), 1); // exclusive
  return [start, end];
}

/**
 * Formats a Date as a stable yyyy-MM-dd key for day-group maps.
 *
 * @param date - The date to format.
 * @returns ISO date string in "yyyy-MM-dd" format.
 */
export function toCalendarDayKey(date: Date): CalendarDayKey {
  return format(date, "yyyy-MM-dd");
}

/**
 * Returns the anchor date for navigating to the previous period.
 *
 * @param anchor - Current focused date.
 * @param mode - "week" or "month".
 */
export function prevPeriodAnchor(anchor: Date, mode: "week" | "month"): Date {
  return mode === "week" ? subWeeks(anchor, 1) : subMonths(anchor, 1);
}

/**
 * Returns the anchor date for navigating to the next period.
 *
 * @param anchor - Current focused date.
 * @param mode - "week" or "month".
 */
export function nextPeriodAnchor(anchor: Date, mode: "week" | "month"): Date {
  return mode === "week" ? addWeeks(anchor, 1) : addMonths(anchor, 1);
}
