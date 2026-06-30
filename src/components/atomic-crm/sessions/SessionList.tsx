import { List } from "@/components/admin/list";

import { SessionCalendar } from "./calendar/SessionCalendar";

/**
 * Sessions list page.
 *
 * Always renders the calendar view. Navigation, view-mode toggle (week/month),
 * and the "New session" create button all live inside SessionCalendar via
 * CalendarToolbar — no duplicate actions are rendered here.
 */
export const SessionList = () => {
  const now = new Date().toISOString();

  return (
    <List
      actions={false}
      perPage={25}
      sort={{ field: "starts_at", order: "ASC" }}
      filterDefaultValues={{ "starts_at@gte": now }}
    >
      <SessionCalendar />
    </List>
  );
};
