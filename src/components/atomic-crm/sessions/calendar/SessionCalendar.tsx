/**
 * SessionCalendar — unified calendar container for sessions.
 *
 * Orchestrates:
 *   - useCalendarState  → URL-driven view mode + anchor date + navigation
 *   - useCalendarSessions → range-bounded fetch, groups sessions by day
 *   - CalendarToolbar   → period navigation, week/month toggle, New session CTA
 *   - WeekView          → 7-column time grid (view=week)
 *   - MonthView         → month grid with session chips (view=month)
 *
 * Loading state: renders a non-blocking skeleton placeholder.
 * Error state:   renders a friendly inline error message (no blank screen).
 *
 * Toggling the view or navigating updates URL search params (?view=, ?date=)
 * via useCalendarState — the component re-renders reactively.
 */

import { format } from "date-fns";
import { useTranslate } from "ra-core";

import { CalendarToolbar } from "./CalendarToolbar";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useCalendarState } from "./useCalendarState";
import { useCalendarSessions } from "./useCalendarSessions";
import { getWeekDays, getMonthGrid } from "./calendarDates";

/**
 * Formats a human-readable label for the current week range.
 * Example: "Jun 30 – Jul 6, 2026"
 *
 * @param rangeStart - Inclusive start of the week range.
 * @param rangeEnd   - Exclusive end of the week range (last day + 1).
 */
function formatWeekLabel(rangeStart: Date, rangeEnd: Date): string {
  // rangeEnd is exclusive; the last displayed day is rangeEnd - 1 day
  const lastDay = new Date(rangeEnd.getTime() - 24 * 60 * 60 * 1000);

  const startMonth = format(rangeStart, "MMM");
  const endMonth = format(lastDay, "MMM");
  const year = format(lastDay, "yyyy");

  if (startMonth === endMonth) {
    return `${startMonth} ${format(rangeStart, "d")} – ${format(lastDay, "d")}, ${year}`;
  }
  return `${startMonth} ${format(rangeStart, "d")} – ${endMonth} ${format(lastDay, "d")}, ${year}`;
}

/**
 * Skeleton placeholder shown while sessions are loading.
 * Maintains the toolbar height so the layout does not shift.
 */
const CalendarSkeleton = () => (
  <div
    className="flex h-96 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground"
    data-testid="calendar-skeleton"
    aria-busy="true"
    aria-label="Loading calendar…"
  >
    <span className="animate-pulse">Loading…</span>
  </div>
);

/**
 * Inline error message shown when the sessions fetch fails.
 */
const CalendarError = ({ message }: { message: string }) => (
  <div
    className="flex h-48 items-center justify-center rounded-md border border-destructive/30 bg-destructive/5 text-sm text-destructive"
    data-testid="calendar-error"
    role="alert"
  >
    {message}
  </div>
);

/**
 * Unified sessions calendar — week or month view, URL-driven state.
 *
 * Render this inside the sessions list page body.  The toolbar is self-contained
 * so the parent (SessionList) does not need to manage calendar state.
 */
export const SessionCalendar = () => {
  const translate = useTranslate();

  const {
    viewMode,
    anchorDate,
    rangeStart,
    rangeEnd,
    goToPrev,
    goToNext,
    goToToday,
    setViewMode,
  } = useCalendarState();

  const { sessionsByDay, isPending, error } = useCalendarSessions(
    rangeStart,
    rangeEnd,
  );

  // Compute period label for the toolbar
  const periodLabel =
    viewMode === "month"
      ? format(anchorDate, "MMMM yyyy")
      : formatWeekLabel(rangeStart, rangeEnd);

  // Pre-compute view data (cheap — just date arithmetic)
  const weekDays = getWeekDays(rangeStart);
  const monthWeeks = getMonthGrid(anchorDate);

  return (
    <div className="flex flex-col gap-3 overflow-hidden h-[calc(100vh-9rem)]">
      <div className="shrink-0">
        <CalendarToolbar
          viewMode={viewMode}
          periodLabel={periodLabel}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          onViewModeChange={setViewMode}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isPending ? (
          <CalendarSkeleton />
        ) : error ? (
          <CalendarError
            message={translate("resources.sessions.calendar.fetch_error")}
          />
        ) : viewMode === "week" ? (
          <WeekView days={weekDays} sessionsByDay={sessionsByDay} />
        ) : (
          <MonthView
            weeks={monthWeeks}
            anchorDate={anchorDate}
            sessionsByDay={sessionsByDay}
          />
        )}
      </div>
    </div>
  );
};
