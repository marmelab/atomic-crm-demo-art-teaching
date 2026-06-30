/**
 * Session calendar container.
 *
 * Orchestrates the calendar views for scheduled classes:
 * - Reads URL search params (?view=month|week, ?date=yyyy-MM-dd) via useCalendarState.
 * - Fetches sessions for the visible range via useCalendarSessions.
 * - Renders MonthView when view=month; falls back to a placeholder when view=week
 *   (WeekView will be implemented in a separate ticket).
 *
 * Navigation controls (Prev / Next / Today) and a view-mode toggle are shown
 * above the grid.
 */

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getMonthGrid } from "./calendarDates";
import { useCalendarState } from "./useCalendarState";
import { useCalendarSessions } from "./useCalendarSessions";
import { MonthView } from "./MonthView";

/**
 * Top-level calendar component.  Mount inside the sessions list page to add
 * the calendar view alongside the table list.
 */
export const SessionCalendar = () => {
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

  const { sessionsByDay, isPending } = useCalendarSessions(
    rangeStart,
    rangeEnd,
  );

  const weeks = getMonthGrid(anchorDate);

  // Header label: "June 2025" for month mode
  const periodLabel =
    viewMode === "month"
      ? format(anchorDate, "MMMM yyyy")
      : `Week of ${format(rangeStart, "MMM d, yyyy")}`;

  return (
    <div className="flex flex-col gap-3 p-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span
            className="ml-2 text-sm font-semibold"
            data-testid="period-label"
          >
            {periodLabel}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-md border">
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none border-r"
            onClick={() => setViewMode("week")}
            aria-pressed={viewMode === "week"}
          >
            Week
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode("month")}
            aria-pressed={viewMode === "month"}
            data-testid="month-view-button"
          >
            Month
          </Button>
        </div>
      </div>

      {/* View */}
      {isPending ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : viewMode === "month" ? (
        <MonthView
          weeks={weeks}
          anchorDate={anchorDate}
          sessionsByDay={sessionsByDay}
        />
      ) : (
        // Week view placeholder — will be implemented in a subsequent ticket
        <div
          className="flex h-48 items-center justify-center rounded-md border text-sm text-muted-foreground"
          data-testid="week-view-placeholder"
        >
          Week view coming soon
        </div>
      )}
    </div>
  );
};
