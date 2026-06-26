import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { List } from "@/components/admin/list";

import { TopToolbar } from "../layout/TopToolbar";
import { CapacityBadge } from "./CapacityBadge";
import type { SessionSummary } from "../types";

const SessionListActions = () => (
  <TopToolbar>
    <CreateButton label="resources.sessions.action.new" />
  </TopToolbar>
);

/**
 * List view for sessions (scheduled classes).
 * Ordered by starts_at ascending; defaults to upcoming sessions (starts_at >= now).
 */
export const SessionList = () => {
  const now = new Date().toISOString();

  return (
    <List
      actions={<SessionListActions />}
      perPage={25}
      sort={{ field: "starts_at", order: "ASC" }}
      filterDefaultValues={{ "starts_at@gte": now }}
    >
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
        <DataTable.Col source="notes" label="resources.sessions.fields.notes" />
      </DataTable>
    </List>
  );
};
