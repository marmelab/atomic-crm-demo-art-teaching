/**
 * Unit tests for calendarDates utility functions.
 *
 * Covers:
 * - getWeekDays: correct 7-day week starting on Monday
 * - getMonthGrid: correct padding (first/last cells belong to adjacent months),
 *   correct row count including 6-row months
 * - getWeekRange / getMonthRange: correct [start, end) derivation, including
 *   a month that spans a year boundary
 * - toCalendarDayKey: correct yyyy-MM-dd formatting
 */

import { describe, expect, it } from "vitest";
import {
  getMonthGrid,
  getMonthRange,
  getWeekDays,
  getWeekRange,
  toCalendarDayKey,
} from "./calendarDates";

// ---------------------------------------------------------------------------
// getWeekDays
// ---------------------------------------------------------------------------

describe("getWeekDays", () => {
  it("returns exactly 7 Date objects", () => {
    const days = getWeekDays(new Date("2025-03-19"));
    expect(days).toHaveLength(7);
  });

  it("starts on Monday for a date in the middle of the week", () => {
    // 2025-03-19 is a Wednesday; the Monday of that week is 2025-03-17
    const days = getWeekDays(new Date("2025-03-19"));
    expect(toCalendarDayKey(days[0])).toBe("2025-03-17"); // Monday
    expect(toCalendarDayKey(days[6])).toBe("2025-03-23"); // Sunday
  });

  it("starts on Monday when the anchor is already a Monday", () => {
    const days = getWeekDays(new Date("2025-03-17"));
    expect(toCalendarDayKey(days[0])).toBe("2025-03-17");
    expect(toCalendarDayKey(days[6])).toBe("2025-03-23");
  });

  it("starts on Monday when the anchor is a Sunday", () => {
    // 2025-03-23 is Sunday → week Monday 2025-03-17
    const days = getWeekDays(new Date("2025-03-23"));
    expect(toCalendarDayKey(days[0])).toBe("2025-03-17");
    expect(toCalendarDayKey(days[6])).toBe("2025-03-23");
  });

  it("produces consecutive days with no gaps", () => {
    const days = getWeekDays(new Date("2025-06-15"));
    for (let i = 1; i < days.length; i++) {
      const diff =
        (days[i].getTime() - days[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// getMonthGrid
// ---------------------------------------------------------------------------

describe("getMonthGrid", () => {
  it("every row has exactly 7 cells", () => {
    const grid = getMonthGrid(new Date("2025-03-01"));
    for (const week of grid) {
      expect(week).toHaveLength(7);
    }
  });

  it("has at least 4 rows", () => {
    const grid = getMonthGrid(new Date("2025-02-01"));
    expect(grid.length).toBeGreaterThanOrEqual(4);
  });

  it("has at most 6 rows", () => {
    // February 2026 starts on Sunday — with Mon-start, needs 4 rows
    // March 2026 starts on Sunday — needs 5 rows (check)
    const grids = [
      getMonthGrid(new Date("2026-02-01")),
      getMonthGrid(new Date("2025-03-01")),
    ];
    for (const grid of grids) {
      expect(grid.length).toBeLessThanOrEqual(6);
    }
  });

  it("first cell belongs to the previous month when the 1st is not Monday", () => {
    // March 2025 starts on a Saturday → grid starts on Mon 2025-02-24
    const grid = getMonthGrid(new Date("2025-03-01"));
    const firstCell = grid[0][0];
    expect(firstCell.getMonth()).toBe(1); // February (0-indexed)
    expect(firstCell.getFullYear()).toBe(2025);
  });

  it("first cell is the 1st when the month starts on Monday", () => {
    // September 2025 starts on Monday
    const grid = getMonthGrid(new Date("2025-09-01"));
    expect(toCalendarDayKey(grid[0][0])).toBe("2025-09-01");
  });

  it("last cell belongs to the next month when the last day is not Sunday", () => {
    // March 2025 ends on Monday 2025-03-31 → grid ends on Sun 2025-04-06
    const grid = getMonthGrid(new Date("2025-03-01"));
    const lastWeek = grid[grid.length - 1];
    const lastCell = lastWeek[lastWeek.length - 1];
    expect(lastCell.getMonth()).toBe(3); // April (0-indexed)
  });

  it("last cell is the last day of the month when it falls on Sunday", () => {
    // August 2021: Aug 1 is Sunday with Mon-start → grid[0][0] = Mon July 26
    // More precisely, find a month ending on Sunday
    // November 2020 ends on Mon → skip
    // May 2025: May 31 is a Saturday → last cell is Jun 1
    // October 2021: Oct 31 is Sunday
    const grid = getMonthGrid(new Date("2021-10-01"));
    const lastWeek = grid[grid.length - 1];
    const lastCell = lastWeek[lastWeek.length - 1];
    expect(lastCell.getMonth()).toBe(9); // October
    expect(lastCell.getDate()).toBe(31);
  });

  it("produces a 6-row grid for a month requiring it", () => {
    // December 2019: Dec 1 is Sunday (Mon-start) → grid starts Mon Nov 25
    // Dec 31 is Tuesday → last cell is Sun Jan 5 → 6 rows
    const grid = getMonthGrid(new Date("2019-12-01"));
    expect(grid.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// getWeekRange
// ---------------------------------------------------------------------------

describe("getWeekRange", () => {
  it("returns [Monday, next-Monday) for a mid-week anchor", () => {
    const [start, end] = getWeekRange(new Date("2025-03-19")); // Wednesday
    expect(toCalendarDayKey(start)).toBe("2025-03-17"); // Monday
    expect(toCalendarDayKey(end)).toBe("2025-03-24"); // next Monday (exclusive)
  });

  it("end is exactly 7 days after start", () => {
    const [start, end] = getWeekRange(new Date("2025-06-15"));
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// getMonthRange — including year-boundary case
// ---------------------------------------------------------------------------

describe("getMonthRange", () => {
  it("returns a range that covers the full month grid", () => {
    const anchor = new Date("2025-03-15");
    const [start, end] = getMonthRange(anchor);
    const grid = getMonthGrid(anchor);
    const firstCell = grid[0][0];
    const lastWeek = grid[grid.length - 1];
    const dayAfterLastCell = new Date(
      lastWeek[lastWeek.length - 1].getTime() + 24 * 60 * 60 * 1000,
    );

    expect(toCalendarDayKey(start)).toBe(toCalendarDayKey(firstCell));
    expect(toCalendarDayKey(end)).toBe(toCalendarDayKey(dayAfterLastCell));
  });

  it("handles a month that spans a year boundary (December → January)", () => {
    // December 2024: Dec 1 is Sunday (Mon-start) → grid starts Mon Nov 25
    // Dec 31 is Tuesday → last visible cell is Sun Jan 5 2025 → end = Jan 6
    const [start, end] = getMonthRange(new Date("2024-12-15"));
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(10); // November (0-indexed) — padded start
    expect(end.getFullYear()).toBe(2025);
    expect(end.getMonth()).toBe(0); // January — exclusive end
  });

  it("handles January spanning backward to the previous year", () => {
    // January 2025: Jan 1 is Wednesday (Mon-start) → grid starts Mon Dec 30 2024
    const [start] = getMonthRange(new Date("2025-01-15"));
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(11); // December
  });

  it("end is strictly after start", () => {
    const [start, end] = getMonthRange(new Date("2025-06-01"));
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});

// ---------------------------------------------------------------------------
// toCalendarDayKey
// ---------------------------------------------------------------------------

describe("toCalendarDayKey", () => {
  it("formats a date as yyyy-MM-dd", () => {
    expect(toCalendarDayKey(new Date("2025-03-07"))).toBe("2025-03-07");
  });

  it("zero-pads month and day", () => {
    expect(toCalendarDayKey(new Date("2025-01-05"))).toBe("2025-01-05");
  });
});
