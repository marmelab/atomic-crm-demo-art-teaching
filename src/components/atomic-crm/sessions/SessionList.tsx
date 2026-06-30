import { useSearchParams } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { List } from "@/components/admin/list";
import { Button } from "@/components/ui/button";

import { TopToolbar } from "../layout/TopToolbar";
import { CapacityBadge } from "./CapacityBadge";
import { SessionCalendar } from "./calendar/SessionCalendar";
import type { SessionSummary } from "../types";

/** URL param that selects the display mode ("list" or "calendar"). Separate from ?view= (week/month). */
const DISPLAY_PARAM = "display";

/**
 * Top toolbar for the session list.
 *
 * Shows a "List / Calendar" toggle and the "New session" create button.
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
        variant={displayMode === "list" ? "default" : "ghost"}
        size="sm"
        className="rounded-r-none border-r"
        onClick={() => onSetDisplay("list")}
        aria-pressed={displayMode === "list"}
      >
        List
      </Button>
      <Button
        variant={displayMode === "calendar" ? "default" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onSetDisplay("calendar")}
        aria-pressed={displayMode === "calendar"}
        data-testid="display-calendar-button"
      >
        Calendar
      </Button>
    </div>
    <CreateButton label="resources.sessions.action.new" />
  </TopToolbar>
);

/**
 * List view for sessions (scheduled classes).
 *
 * Supports two display modes via ?display= URL param:
 * - "list"     (default): tabular list ordered by starts_at ASC.
 * - "calendar": month/week calendar driven by SessionCalendar.
 */
export const SessionList = () => {
  const now = new Date().toISOString();
  const [searchParams, setSearchParams] = useSearchParams();
  const displayMode = searchParams.get(DISPLAY_PARAM) ?? "list";

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
      {displayMode === "calendar" ? (
        <SessionCalendar />
      ) : (
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
      )}
    </List>
  );
};
