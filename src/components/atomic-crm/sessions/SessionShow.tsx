import {
  RecordContextProvider,
  ShowBase,
  useGetList,
  useNotify,
  useRefresh,
  useShowContext,
  useTranslate,
  useUpdate,
  type Identifier,
} from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { EditButton } from "@/components/admin/edit-button";

import type { Booking, BookingStatus, SessionSummary } from "../types";
import { CapacityBadge } from "./CapacityBadge";
import { BookingCreateDialog } from "../bookings/BookingCreate";

/** Maps a booking status to a display badge variant/style. */
const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  booked: {
    label: "resources.bookings.status.booked",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  attended: {
    label: "resources.bookings.status.attended",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  no_show: {
    label: "resources.bookings.status.no_show",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  cancelled: {
    label: "resources.bookings.status.cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

interface BookingRowProps {
  booking: Booking;
}

/**
 * A single roster row for one booking.
 * Renders the student name, current status badge, and inline action buttons
 * to mark the booking as attended / no_show / cancelled via useUpdate.
 */
const BookingRow = ({ booking }: BookingRowProps) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update, { isPending }] = useUpdate();

  const isCancelled = booking.status === "cancelled";

  const updateStatus = (status: BookingStatus, extra?: Partial<Booking>) => {
    update(
      "bookings",
      {
        id: booking.id,
        data: { status, ...extra },
        previousData: booking,
      },
      {
        onSuccess: () => {
          refresh();
          notify("resources.bookings.action.status_updated", {
            messageArgs: { _: "Booking updated" },
          });
        },
        onError: () => {
          notify("ra.notification.http_error", { type: "error" });
        },
      },
    );
  };

  const handleCancel = () =>
    updateStatus("cancelled", { cancelled_at: new Date().toISOString() });
  const handleAttended = () => updateStatus("attended");
  const handleNoShow = () => updateStatus("no_show");

  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES["booked"];

  return (
    <div
      className={`flex items-center gap-3 py-2 border-b last:border-b-0 ${isCancelled ? "opacity-50" : ""}`}
      data-testid="booking-row"
    >
      {/* Student name via ReferenceField */}
      <div className="flex-1 font-medium">
        <RecordContextProvider value={booking}>
          <ReferenceField
            source="contact_id"
            reference="contacts"
            link="show"
          />
        </RecordContextProvider>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={statusStyle.className}
        data-testid="booking-status-badge"
      >
        {translate(statusStyle.label)}
      </Badge>

      {/* Action buttons — hidden for cancelled rows */}
      {!isCancelled && (
        <div className="flex gap-1">
          {booking.status !== "attended" && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleAttended}
              data-testid="mark-attended-button"
            >
              {translate("resources.bookings.action.mark_attended")}
            </Button>
          )}
          {booking.status !== "no_show" && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleNoShow}
              data-testid="mark-no-show-button"
            >
              {translate("resources.bookings.action.mark_no_show")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={handleCancel}
            data-testid="cancel-booking-button"
          >
            {translate("resources.bookings.action.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
};

interface SessionRosterProps {
  sessionId: Identifier;
  capacity: number;
  overbooking: number;
}

/**
 * Roster panel for a session.
 * Fetches all bookings for the session and renders them with inline status
 * controls. The capacity badge reflects the live (non-cancelled) count.
 */
const SessionRoster = ({
  sessionId,
  capacity,
  overbooking,
}: SessionRosterProps) => {
  const translate = useTranslate();
  const { data: bookings = [], isPending } = useGetList<Booking>("bookings", {
    filter: { "session_id@eq": sessionId },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "ASC" },
  });

  const liveBookings = bookings.filter((b) => b.status !== "cancelled");
  const nbBooked = liveBookings.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>{translate("resources.sessions.roster.title")}</CardTitle>
          <CapacityBadge
            nbBooked={nbBooked}
            capacity={capacity}
            overbooking={overbooking}
          />
        </div>
        <BookingCreateDialog sessionId={sessionId} />
      </CardHeader>
      <CardContent>
        {isPending && (
          <p className="text-sm text-muted-foreground">
            {translate("crm.common.loading")}
          </p>
        )}
        {!isPending && bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {translate("resources.sessions.roster.placeholder")}
          </p>
        )}
        {!isPending && bookings.length > 0 && (
          <div>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SessionShowContent = () => {
  const { record, isPending } = useShowContext<SessionSummary>();
  const translate = useTranslate();

  if (isPending || !record) return null;

  return (
    <div className="mt-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {translate("resources.sessions.name", { smart_count: 1 })}
          </CardTitle>
          <EditButton />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.starts_at")}
            </dt>
            <dd>
              <DateField source="starts_at" showTime />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.duration_minutes")}
            </dt>
            <dd>
              <NumberField source="duration_minutes" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.capacity")}
            </dt>
            <dd>
              <NumberField source="capacity" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.overbooking")}
            </dt>
            <dd>
              <NumberField source="overbooking" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.bookings")}
            </dt>
            <dd>
              <CapacityBadge
                nbBooked={record.nb_booked}
                capacity={record.capacity}
                overbooking={record.overbooking}
              />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.sessions.fields.notes")}
            </dt>
            <dd>
              <TextField source="notes" />
            </dd>
          </dl>
        </CardContent>
      </Card>

      <SessionRoster
        sessionId={record.id}
        capacity={record.capacity}
        overbooking={record.overbooking}
      />
    </div>
  );
};

/**
 * Detail view for a session (scheduled class).
 * Renders session details, a capacity badge with color thresholds,
 * and a live roster with inline booking controls.
 */
export const SessionShow = () => (
  <ShowBase>
    <SessionShowContent />
  </ShowBase>
);
