/**
 * WeekView — a Google-Calendar-style 7-column time grid.
 *
 * Pure presentational component: it receives the 7-day array and a
 * day-indexed session map from the parent (CalendarPage), performs no
 * fetching of its own.
 *
 * Layout:
 *   - Left gutter column: hour labels from startHour to endHour (inclusive).
 *   - 7 day columns: each day column is a relative-positioned container.
 *     Sessions are placed as absolutely-positioned blocks whose top and height
 *     are derived from starts_at (time-of-day) and duration_minutes.
 *
 * Overlap handling: sessions in the same column that overlap in time are laid
 * out side-by-side by dividing the column width equally among concurrent
 * sessions. Sessions whose start falls outside the visible window are clamped
 * to the edge so they remain visible and clickable (not dropped).
 */

import { format, isToday } from "date-fns";
import { useTranslate } from "ra-core";

import { toCalendarDayKey } from "./calendarDates";
import {
  SessionEventBlock,
  type SessionBlockGeometry,
} from "./SessionEventBlock";
import type { SessionSummary } from "../../types";
import type { SessionsByDay } from "./useCalendarSessions";
import { cn } from "@/lib/utils";

/** Configurable visible hour window (inclusive on both ends). */
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 21;

/** Minimum height percentage for any block so it stays clickable. */
const MIN_HEIGHT_PERCENT = 1.5;

interface DayColumn {
  date: Date;
  sessions: SessionSummary[];
}

/**
 * Converts a session to its geometry within a day column.
 *
 * @param session - The session to place.
 * @param startHour - First visible hour (e.g. 7 for 07:00).
 * @param totalHours - Number of visible hours (endHour - startHour + 1).
 * @param widthFraction - Column width share (0–1) for overlap layout.
 * @param leftFraction - Left offset share (0–1) for overlap layout.
 */
function computeGeometry(
  session: SessionSummary,
  startHour: number,
  totalHours: number,
  widthFraction: number,
  leftFraction: number,
): SessionBlockGeometry {
  const starts = new Date(session.starts_at);
  const minutesFromMidnight = starts.getHours() * 60 + starts.getMinutes();
  const windowStartMinutes = startHour * 60;
  const windowTotalMinutes = totalHours * 60;

  // Raw top offset from the window start — clamp to [0, total] so out-of-window
  // sessions appear at the edge instead of being hidden.
  const rawOffsetMinutes = minutesFromMidnight - windowStartMinutes;
  const clampedOffset = Math.max(
    0,
    Math.min(rawOffsetMinutes, windowTotalMinutes),
  );

  const topPercent = (clampedOffset / windowTotalMinutes) * 100;
  const rawHeightPercent =
    (session.duration_minutes / windowTotalMinutes) * 100;
  const heightPercent = Math.max(MIN_HEIGHT_PERCENT, rawHeightPercent);

  return { topPercent, heightPercent, widthFraction, leftFraction };
}

/**
 * Lays out a group of sessions in a single day column.
 * Sessions that overlap in time are split side-by-side.
 *
 * Algorithm: sweep through sessions (already sorted by starts_at) and
 * maintain a list of "active lanes". Each session occupies the first free
 * lane; lanes whose session ended before the current one starts are freed.
 */
function layoutColumn(
  sessions: SessionSummary[],
  startHour: number,
  totalHours: number,
): Array<{ session: SessionSummary; geometry: SessionBlockGeometry }> {
  if (sessions.length === 0) return [];

  // Sort by start time
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  /** Each active lane tracks the end time (ms) of the session occupying it. */
  const laneEnds: number[] = [];

  const assignments: Array<{ session: SessionSummary; lane: number }> = [];

  for (const session of sorted) {
    const startMs = new Date(session.starts_at).getTime();
    const endMs = startMs + session.duration_minutes * 60 * 1000;

    // Find first free lane
    let assignedLane = laneEnds.findIndex((endTime) => endTime <= startMs);
    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(endMs);
    } else {
      laneEnds[assignedLane] = endMs;
    }

    assignments.push({ session, lane: assignedLane });
  }

  // Determine max concurrent sessions (max lane count at any point) by
  // grouping overlapping sessions and finding the group size.
  // Simplified: use the total number of lanes opened as the column count.
  const totalLanes = laneEnds.length;

  return assignments.map(({ session, lane }) => ({
    session,
    geometry: computeGeometry(
      session,
      startHour,
      totalHours,
      1 / totalLanes,
      lane / totalLanes,
    ),
  }));
}

export interface WeekViewProps {
  /** The 7 days of the week to display (Monday–Sunday). */
  days: Date[];
  /** Sessions grouped by yyyy-MM-dd key. */
  sessionsByDay: SessionsByDay;
  /** First visible hour (default 7). */
  startHour?: number;
  /** Last visible hour inclusive (default 21). */
  endHour?: number;
}

/**
 * Google-Calendar-style week grid.
 *
 * Renders a sticky header row with day names/dates, a left gutter with hour
 * labels, and 7 day columns where sessions are placed as positioned blocks.
 */
export const WeekView = ({
  days,
  sessionsByDay,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
}: WeekViewProps) => {
  const translate = useTranslate();

  const totalHours = endHour - startHour + 1;
  const hours = Array.from({ length: totalHours }, (_, i) => startHour + i);

  // Build column data
  const columns: DayColumn[] = days.map((date) => {
    const key = toCalendarDayKey(date);
    return { date, sessions: sessionsByDay.get(key) ?? [] };
  });

  return (
    <div
      className="flex flex-col border rounded-lg overflow-hidden bg-background"
      data-testid="week-view"
    >
      {/* Column header row */}
      <div className="flex border-b bg-secondary/30 sticky top-0 z-10">
        {/* Gutter spacer */}
        <div className="w-14 shrink-0 border-r" aria-hidden="true" />
        {columns.map(({ date }) => {
          const today = isToday(date);
          return (
            <div
              key={toCalendarDayKey(date)}
              className={cn(
                "flex-1 flex flex-col items-center py-2 border-r last:border-r-0",
                today && "bg-primary/10",
              )}
              aria-label={format(date, "EEEE d MMMM")}
            >
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wide text-muted-foreground",
                )}
              >
                {format(date, "EEE")}
              </span>
              <span
                className={cn(
                  "text-lg font-bold leading-none",
                  today ? "text-primary" : "text-foreground",
                )}
              >
                {format(date, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid body — scrolls with the page */}
      <div>
        <div className="flex">
          {/* Hour gutter */}
          <div
            className="w-14 shrink-0 border-r"
            aria-label={translate("resources.sessions.calendar.hour_gutter")}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-14 flex items-start justify-end pr-2 pt-0.5"
              >
                <span className="text-[0.65rem] text-muted-foreground select-none">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {columns.map(({ date, sessions }) => {
            const today = isToday(date);
            const key = toCalendarDayKey(date);
            const laid = layoutColumn(sessions, startHour, totalHours);

            return (
              <div
                key={key}
                className={cn(
                  "flex-1 border-r last:border-r-0 relative",
                  today && "bg-primary/5",
                )}
                style={{ height: `${totalHours * 3.5}rem` }}
                data-testid={`day-column-${key}`}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/40"
                    style={{
                      top: `${((hour - startHour) / totalHours) * 100}%`,
                    }}
                    aria-hidden="true"
                  />
                ))}

                {/* Session blocks */}
                {laid.map(({ session, geometry }) => (
                  <SessionEventBlock
                    key={session.id}
                    session={session}
                    geometry={geometry}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
