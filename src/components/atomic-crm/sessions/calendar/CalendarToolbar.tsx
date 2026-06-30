/**
 * CalendarToolbar — navigation and view-toggle bar for the sessions calendar.
 *
 * Renders:
 *   - Previous / Today / Next period buttons
 *   - Human-readable period label (e.g. "June 2026" or "Jun 23 – 29, 2026")
 *   - Week / Month view toggle (reuses ui/toggle-group)
 *   - "New session" CreateButton
 *
 * Pure presentational component: all state lives in the parent (SessionCalendar)
 * via the useCalendarState hook; this component only fires callbacks.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslate } from "ra-core";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreateButton } from "@/components/admin/create-button";
import { TopToolbar } from "../../layout/TopToolbar";

import type { CalendarViewMode } from "./useCalendarState";

export interface CalendarToolbarProps {
  /** Currently active view mode. */
  viewMode: CalendarViewMode;
  /** Human-readable label for the visible period. */
  periodLabel: string;
  /** Navigate to the previous period. */
  onPrev: () => void;
  /** Navigate to the next period. */
  onNext: () => void;
  /** Jump to today's date. */
  onToday: () => void;
  /** Switch between "week" and "month" modes. */
  onViewModeChange: (mode: CalendarViewMode) => void;
}

/**
 * Navigation and view-toggle toolbar for the sessions calendar.
 *
 * @param viewMode - Active view ("week" | "month").
 * @param periodLabel - Pre-formatted period string to display.
 * @param onPrev - Callback for the Previous button.
 * @param onNext - Callback for the Next button.
 * @param onToday - Callback for the Today button.
 * @param onViewModeChange - Callback fired when the user selects a new view.
 */
export const CalendarToolbar = ({
  viewMode,
  periodLabel,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarToolbarProps) => {
  const translate = useTranslate();

  const handleValueChange = (value: string) => {
    if (value === "week" || value === "month") {
      onViewModeChange(value);
    }
  };

  return (
    <TopToolbar className="justify-between">
      {/* Left side: navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          aria-label={translate("resources.sessions.calendar.prev")}
          data-testid="calendar-prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          data-testid="calendar-today"
        >
          {translate("resources.sessions.calendar.today")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          aria-label={translate("resources.sessions.calendar.next")}
          data-testid="calendar-next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span
          className="ml-2 text-sm font-semibold"
          data-testid="calendar-period-label"
        >
          {periodLabel}
        </span>
      </div>

      {/* Right side: view toggle + create action */}
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={handleValueChange}
          variant="outline"
          aria-label={translate(
            "resources.sessions.calendar.view_toggle_label",
          )}
        >
          <ToggleGroupItem
            value="week"
            aria-label={translate("resources.sessions.calendar.view_week")}
            data-testid="week-view-button"
          >
            {translate("resources.sessions.calendar.view_week")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            aria-label={translate("resources.sessions.calendar.view_month")}
            data-testid="month-view-button"
          >
            {translate("resources.sessions.calendar.view_month")}
          </ToggleGroupItem>
        </ToggleGroup>

        <CreateButton
          resource="sessions"
          label="resources.sessions.action.new"
        />
      </div>
    </TopToolbar>
  );
};
