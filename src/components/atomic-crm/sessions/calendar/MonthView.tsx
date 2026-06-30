/**
 * Month view for the session calendar.
 *
 * Renders a Google-Calendar-style month grid: 7 columns (Mon–Sun), one row
 * per week, including padding days from adjacent months. Each day cell shows
 * up to MAX_VISIBLE_CHIPS session chips; excess sessions collapse into a
 * "+N more" affordance so no session is silently hidden.
 *
 * This is a pure presentational component — it receives the month grid and
 * day-grouped sessions as props and performs no data fetching of its own.
 */

import { isSameMonth, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";

import type { SessionsByDay } from "./useCalendarSessions";
import { toCalendarDayKey } from "./calendarDates";
import { SessionChip } from "./SessionChip";

/** Maximum chip rows shown before collapsing into "+N more". */
const MAX_VISIBLE_CHIPS = 3;

/** Abbreviated weekday header labels (Mon–Sun). */
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewProps {
  /** Month grid produced by {@link getMonthGrid}: array of 4–6 week arrays, each 7 Date objects. */
  weeks: Date[][];
  /** The anchor month used to determine which cells are padding days from adjacent months. */
  anchorDate: Date;
  /** Day-indexed session map from {@link useCalendarSessions}. */
  sessionsByDay: SessionsByDay;
}

/**
 * Month grid with session chips.
 *
 * @param weeks - Output of getMonthGrid(anchorDate).
 * @param anchorDate - The focused month (determines muted padding cells).
 * @param sessionsByDay - Sessions grouped by yyyy-MM-dd key.
 */
export const MonthView = ({
  weeks,
  anchorDate,
  sessionsByDay,
}: MonthViewProps) => {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border bg-background"
      data-testid="month-view"
    >
      {/* Weekday header row */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className="grid flex-1 grid-cols-7 border-b last:border-b-0"
        >
          {week.map((day, dayIndex) => (
            <DayCell
              key={dayIndex}
              day={day}
              anchorDate={anchorDate}
              sessionsByDay={sessionsByDay}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/** Props for a single day cell. */
interface DayCellProps {
  day: Date;
  anchorDate: Date;
  sessionsByDay: SessionsByDay;
}

/**
 * A single day cell in the month grid.
 *
 * Padding days (outside the focused month) are visually muted.
 * Today's cell is highlighted with a distinct background.
 */
const DayCell = ({ day, anchorDate, sessionsByDay }: DayCellProps) => {
  const key = toCalendarDayKey(day);
  const sessions = sessionsByDay.get(key) ?? [];
  const isCurrentMonth = isSameMonth(day, anchorDate);
  const isTodayCell = isToday(day);
  const overflow = sessions.length - MAX_VISIBLE_CHIPS;
  const visibleSessions = sessions.slice(0, MAX_VISIBLE_CHIPS);

  return (
    <div
      className={cn(
        "min-h-[80px] border-r p-1 last:border-r-0",
        !isCurrentMonth && "bg-muted/40",
        isTodayCell && "bg-primary/5",
      )}
      data-testid={`day-cell-${key}`}
    >
      {/* Day number */}
      <div className="mb-1 flex justify-end">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
            !isCurrentMonth && "text-muted-foreground",
            isTodayCell && "bg-primary text-primary-foreground",
          )}
          aria-label={format(day, "MMMM d, yyyy")}
        >
          {format(day, "d")}
        </span>
      </div>

      {/* Session chips */}
      <div className="flex flex-col gap-0.5">
        {visibleSessions.map((session) => (
          <SessionChip key={session.id} session={session} />
        ))}

        {/* "+N more" affordance */}
        {overflow > 0 && (
          <span
            className="block px-1 text-xs text-muted-foreground"
            data-testid={`overflow-${key}`}
          >
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
};
