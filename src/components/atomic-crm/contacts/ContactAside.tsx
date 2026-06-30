import { useGetList, useRecordContext, useTranslate } from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { ShowButton } from "@/components/admin/show-button";

import { AddTask } from "../tasks/AddTask";
import { TasksIterator } from "../tasks/TasksIterator";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { AsideSection } from "../misc/AsideSection";
import type { Contact, SubscriptionSummary } from "../types";
import { ContactMergeButton } from "./ContactMergeButton";
import { ExportVCardButton } from "./ExportVCardButton";
import { BuyPackDialog } from "../bookings/BookingCreate";
import { SubscriptionListItem } from "./SubscriptionListItem";

export const ContactAside = ({ link = "edit" }: { link?: "edit" | "show" }) => {
  const record = useRecordContext<Contact>();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <div className="hidden sm:block w-92 min-w-92 text-sm">
      <div className="mb-4 -ml-1">
        {link === "edit" ? (
          <EditButton label="resources.contacts.action.edit" />
        ) : (
          <ShowButton label="resources.contacts.action.show" />
        )}
      </div>

      <AsideSection
        title={translate("resources.contacts.field_categories.personal_info")}
      >
        <ContactPersonalInfo />
      </AsideSection>

      <AsideSection
        title={translate("resources.contacts.field_categories.background_info")}
      >
        <ContactBackgroundInfo />
      </AsideSection>

      <AsideSection
        title={translate("resources.tasks.name", { smart_count: 2 })}
      >
        <ReferenceManyField
          target="contact_id"
          reference="tasks"
          sort={{ field: "due_date", order: "ASC" }}
          perPage={1000}
        >
          <TasksIterator />
        </ReferenceManyField>
        <AddTask />
      </AsideSection>

      <AsideSection
        title={translate("resources.subscriptions.name", { smart_count: 2 })}
      >
        <ContactSubscriptionsPanel contactId={record.id} />
      </AsideSection>

      {link !== "edit" && (
        <>
          <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
            <ExportVCardButton />
            <ContactMergeButton />
          </div>
          <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
            <DeleteButton
              className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
              size="sm"
            />
          </div>
        </>
      )}
    </div>
  );
};

/** Subscriptions panel: lists packs with sessions_remaining + Buy pack dialog. */
const ContactSubscriptionsPanel = ({
  contactId,
}: {
  contactId: string | number;
}) => {
  const translate = useTranslate();
  const { data: subscriptions = [], isPending } =
    useGetList<SubscriptionSummary>("subscriptions", {
      filter: { "contact_id@eq": contactId },
      pagination: { page: 1, perPage: 50 },
      sort: { field: "purchased_at", order: "DESC" },
    });

  return (
    <div className="space-y-2">
      {isPending && (
        <p className="text-muted-foreground text-xs">
          {translate("crm.common.loading")}
        </p>
      )}
      {!isPending && subscriptions.length === 0 && (
        <p className="text-muted-foreground text-xs">
          {translate("resources.subscriptions.empty.description")}
        </p>
      )}
      {!isPending &&
        subscriptions.map((sub) => (
          <SubscriptionListItem key={sub.id} subscription={sub} />
        ))}
      <BuyPackDialog contactId={contactId} />
    </div>
  );
};
