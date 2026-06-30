/**
 * CalendarPage — the sessions calendar route page.
 *
 * Wires together:
 *   - useCalendarState  → URL-driven view mode + anchor date + navigation actions
 *   - useCalendarSessions → fetches sessions in the visible range, groups by day
 *   - WeekView          → renders the 7-column time grid
 *
 * The page owns the toolbar (Prev / Today / Next navigation buttons and the
 * period label). It does not fetch data directly — that is delegated to
 * useCalendarSessions.
 */

import { useTranslate } from "ra-core";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCalendarState } from "./useCalendarState";
import { useCalendarSessions } from "./useCalendarSessions";
import { getWeekDays } from "./calendarDates";
import { WeekView } from "./WeekView";
import { TopToolbar } from "../../layout/TopToolbar";
import { CreateButton } from "@/components/admin/create-button";

/**
 * Formats a human-readable label for the current week, e.g. "Jun 30 – Jul 6, 2025".
 */
function weekLabel(rangeStart: Date, rangeEnd: Date): string {
  // rangeEnd is exclusive; the last day is rangeEnd - 1
  const lastDay = new Date(rangeEnd.getTime() - 24 * 60 * 60 * 1000);

  const startMonth = format(rangeStart, "MMM");
  const endMonth = format(lastDay, "MMM");
  const year = format(lastDay, "yyyy");

  if (startMonth === endMonth) {
    return `${startMonth} ${format(rangeStart, "d")} – ${format(lastDay, "d")}, ${year}`;
  }
  return `${startMonth} ${format(rangeStart, "d")} – ${endMonth} ${format(lastDay, "d")}, ${year}`;
}

/** Path constant consumed by Header.tsx active-tab detection and CRM.tsx route. */
export const CALENDAR_PATH = "/sessions/calendar";

/**
 * Full-page calendar view for sessions.
 * Currently renders only the week view; month view support can be added later.
 */
export const CalendarPage = () => {
  const translate = useTranslate();
  const { rangeStart, rangeEnd, goToPrev, goToNext, goToToday } =
    useCalendarState();

  const { sessionsByDay, isPending } = useCalendarSessions(
    rangeStart,
    rangeEnd,
  );

  const days = getWeekDays(rangeStart);
  const label = weekLabel(rangeStart, rangeEnd);

  return (
    <div className="mt-4 space-y-3">
      {/* Toolbar */}
      <TopToolbar>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            aria-label={translate("resources.sessions.calendar.prev_week")}
            data-testid="calendar-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            data-testid="calendar-today"
          >
            {translate("resources.sessions.calendar.today")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            aria-label={translate("resources.sessions.calendar.next_week")}
            data-testid="calendar-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span
            className="text-sm font-medium ml-2"
            data-testid="calendar-period-label"
          >
            {label}
          </span>
        </div>

        <CreateButton
          resource="sessions"
          label="resources.sessions.action.new"
        />
      </TopToolbar>

      {/* Loading state */}
      {isPending && (
        <p className="text-sm text-muted-foreground">
          {translate("crm.common.loading")}
        </p>
      )}

      {/* Week grid */}
      <WeekView days={days} sessionsByDay={sessionsByDay} />
    </div>
  );
};
