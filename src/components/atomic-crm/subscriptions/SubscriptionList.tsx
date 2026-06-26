import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";

import { TopToolbar } from "../layout/TopToolbar";

const SubscriptionListActions = () => (
  <TopToolbar>
    <CreateButton label="resources.subscriptions.action.new" />
  </TopToolbar>
);

/**
 * List view for subscriptions (prepaid session packs).
 * Displays contact, total sessions, sessions remaining, purchase date, and price.
 */
export const SubscriptionList = () => (
  <List
    actions={<SubscriptionListActions />}
    perPage={25}
    sort={{ field: "purchased_at", order: "DESC" }}
  >
    <DataTable rowClick="show">
      <DataTable.Col
        source="contact_id"
        label="resources.subscriptions.fields.contact_id"
      >
        <ReferenceField source="contact_id" reference="contacts" link="show" />
      </DataTable.Col>
      <DataTable.Col
        source="purchased_at"
        label="resources.subscriptions.fields.purchased_at"
      >
        <DateField source="purchased_at" />
      </DataTable.Col>
      <DataTable.Col
        source="total_sessions"
        label="resources.subscriptions.fields.total_sessions"
      />
      <DataTable.Col
        source="sessions_remaining"
        label="resources.subscriptions.fields.sessions_remaining"
      />
      <DataTable.Col
        source="price"
        label="resources.subscriptions.fields.price"
      />
    </DataTable>
  </List>
);
