import { useState } from "react";
import {
  InfiniteListBase,
  RecordRepresentation,
  ShowBase,
  useGetList,
  useShowContext,
  useTranslate,
} from "ra-core";
import type { ShowBaseProps } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { Link } from "react-router";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { NoteCreate, NotesIterator, NotesIteratorMobile } from "../notes";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { TagsListEdit } from "./TagsListEdit";
import { ContactEditSheet } from "./ContactEditSheet";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { ContactTasksList } from "./ContactTasksList";
import type { Booking, Contact, SubscriptionSummary } from "../types";
import { Avatar } from "./Avatar";
import { ContactAside } from "./ContactAside";
import { MobileBackButton } from "../misc/MobileBackButton";
import { BuyPackDialog } from "../bookings/BookingCreate";
import { SubscriptionListItem } from "./SubscriptionListItem";
import { BookingHistoryList } from "./BookingHistoryList";

export const ContactShow = (props: ShowBaseProps = {}) => {
  const isMobile = useIsMobile();

  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              {
                /** Disable error notification as the content handles offline */
              }
            }
          : undefined,
      }}
      {...props}
    >
      {isMobile ? <ContactShowContentMobile /> : <ContactShowContent />}
    </ShowBase>
  );
};

const ContactShowContentMobile = () => {
  const translate = useTranslate();
  const { defaultTitle, record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  const taskCount = record.nb_tasks ?? 0;

  return (
    <>
      {/* We need to repeat the note creation sheet here to support the note 
      create button that is rendered when there are no notes. */}
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      <ContactEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contactId={record.id}
      />
      <MobileHeader>
        <MobileBackButton />
        <div className="flex flex-1 min-w-0">
          <Link to="/contacts" className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-semibold">{defaultTitle}</h1>
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={translate("ra.action.edit")}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
        </Button>
      </MobileHeader>
      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">
                <RecordRepresentation />
              </h2>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-10">
            <TabsTrigger value="notes">
              {translate("resources.notes.name", { smart_count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {translate("crm.common.task_count", {
                smart_count: taskCount ?? 0,
              })}
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              {translate("resources.subscriptions.name", { smart_count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="details">
              {translate("crm.common.details")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-2">
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {translate("resources.notes.empty")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setNoteCreateOpen(true)}
                  >
                    {translate("resources.notes.action.add")}
                  </Button>
                </div>
              }
              loading={false}
              error={false}
              queryOptions={{
                onError: () => {
                  /** override to hide notification as error case is handled by NotesIteratorMobile */
                },
              }}
            >
              <NotesIteratorMobile contactId={record.id} showStatus />
            </InfiniteListBase>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ContactTasksList />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            <ContactSubscriptionsMobilePanel contactId={record.id} />
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.personal_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactPersonalInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.background_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactBackgroundInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.tags.name", { smart_count: 2 })}
                </h3>
                <Separator />
                <div className="mt-3">
                  <TagsListEdit />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </MobileContent>
    </>
  );
};

/** Mobile subscriptions + booking history panel. */
const ContactSubscriptionsMobilePanel = ({
  contactId,
}: {
  contactId: string | number;
}) => {
  const translate = useTranslate();
  const { data: subscriptions = [], isPending: subsLoading } =
    useGetList<SubscriptionSummary>("subscriptions", {
      filter: { "contact_id@eq": contactId },
      pagination: { page: 1, perPage: 50 },
      sort: { field: "purchased_at", order: "DESC" },
    });
  const { data: bookings = [], isPending: bookingsLoading } =
    useGetList<Booking>("bookings", {
      filter: { "contact_id@eq": contactId },
      pagination: { page: 1, perPage: 50 },
      sort: { field: "created_at", order: "DESC" },
    });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {translate("resources.subscriptions.name", { smart_count: 2 })}
        </h3>
        <Separator className="my-2" />
        {subsLoading && (
          <p className="text-sm text-muted-foreground">
            {translate("crm.common.loading")}
          </p>
        )}
        {!subsLoading && subscriptions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {translate("resources.subscriptions.empty.description")}
          </p>
        )}
        {!subsLoading &&
          subscriptions.map((sub) => (
            <SubscriptionListItem key={sub.id} subscription={sub} />
          ))}
        <div className="mt-2">
          <BuyPackDialog contactId={contactId} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          {translate("resources.bookings.panel.history")}
        </h3>
        <Separator className="my-2" />
        {bookingsLoading && (
          <p className="text-sm text-muted-foreground">
            {translate("crm.common.loading")}
          </p>
        )}
        {!bookingsLoading && bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {translate("resources.bookings.panel.empty")}
          </p>
        )}
        {!bookingsLoading && bookings.length > 0 && (
          <BookingHistoryList bookings={bookings} />
        )}
      </div>
    </div>
  );
};

const ContactShowContent = () => {
  const { record, isPending } = useShowContext<Contact>();
  if (isPending || !record) return null;

  return (
    <div className="mt-2 mb-2 flex gap-8">
      <div className="flex-1">
        <Card>
          <CardContent>
            <div className="flex">
              <Avatar />
              <div className="ml-2 flex-1">
                <h5 className="text-xl font-semibold">
                  <RecordRepresentation />
                </h5>
              </div>
            </div>
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <NoteCreate reference="contacts" showStatus className="mt-4" />
              }
            >
              <NotesIterator reference="contacts" showStatus />
            </InfiniteListBase>
          </CardContent>
        </Card>
      </div>
      <ContactAside />
    </div>
  );
};
