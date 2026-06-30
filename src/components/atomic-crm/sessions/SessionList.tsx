import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { List } from "@/components/admin/list";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router";

import { TopToolbar } from "../layout/TopToolbar";
import { CapacityBadge } from "./CapacityBadge";
import { SessionCalendar } from "./calendar/SessionCalendar";
import type { SessionSummary } from "../types";

/** URL param that selects the display mode ("calendar" or "list"). */
const DISPLAY_PARAM = "display";

/**
 * Top toolbar for the session list view.
 *
 * Shows a "Calendar / List" toggle and the "New session" create button.
 * The Calendar mode is the default; List is the fallback for table-based access.
 */
const SessionListActions = ({
  displayMode,
  onSetDisplay,
}: {
  displayMode: string;
  onSetDisplay: (mode: string) => void;
}) => (
  <TopToolbar>
    {/* Display-mode toggle */}
    <div className="flex items-center rounded-md border">
      <Button
        variant={displayMode === "calendar" ? "default" : "ghost"}
        size="sm"
        className="rounded-r-none border-r"
        onClick={() => onSetDisplay("calendar")}
        aria-pressed={displayMode === "calendar"}
        data-testid="display-calendar-button"
      >
        Calendar
      </Button>
      <Button
        variant={displayMode === "list" ? "default" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onSetDisplay("list")}
        aria-pressed={displayMode === "list"}
        data-testid="display-list-button"
      >
        List
      </Button>
    </div>
    <CreateButton label="resources.sessions.action.new" />
  </TopToolbar>
);

/**
 * Sessions list page.
 *
 * Defaults to the calendar view (?display=calendar). Toggling to "list" falls
 * back to the DataTable-based view. The resource registration in CRM.tsx is
 * unchanged — only this component's body changes.
 *
 * The calendar view's week/month toggle and prev/next navigation live inside
 * SessionCalendar (via CalendarToolbar); this component only handles the
 * calendar-vs-list display switch.
 */
export const SessionList = () => {
  const now = new Date().toISOString();
  const [searchParams, setSearchParams] = useSearchParams();

  // Default to "calendar" — the calendar is the primary sessions view.
  const displayMode = searchParams.get(DISPLAY_PARAM) ?? "calendar";

  const setDisplay = (mode: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DISPLAY_PARAM, mode);
        return next;
      },
      { replace: false },
    );
  };

  return (
    <List
      actions={
        <SessionListActions
          displayMode={displayMode}
          onSetDisplay={setDisplay}
        />
      }
      perPage={25}
      sort={{ field: "starts_at", order: "ASC" }}
      filterDefaultValues={{ "starts_at@gte": now }}
    >
      {displayMode === "list" ? (
        <DataTable<SessionSummary> rowClick="show">
          <DataTable.Col
            source="starts_at"
            label="resources.sessions.fields.starts_at"
          >
            <DateField source="starts_at" showTime />
          </DataTable.Col>
          <DataTable.Col
            source="duration_minutes"
            label="resources.sessions.fields.duration_minutes"
          />
          <DataTable.Col
            source="capacity"
            label="resources.sessions.fields.capacity"
            render={(record: SessionSummary) => (
              <CapacityBadge
                nbBooked={record.nb_booked}
                capacity={record.capacity}
                overbooking={record.overbooking}
              />
            )}
          />
          <DataTable.Col
            source="notes"
            label="resources.sessions.fields.notes"
          />
        </DataTable>
      ) : (
        <SessionCalendar />
      )}
    </List>
  );
};
