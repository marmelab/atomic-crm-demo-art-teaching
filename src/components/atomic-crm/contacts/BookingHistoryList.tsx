import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";

import type { Booking, BookingStatus } from "../types";

interface BookingHistoryListProps {
  bookings: Booking[];
}

/** Maps booking status to a compact badge colour class. */
export const STATUS_CLASS: Record<BookingStatus, string> = {
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  attended: "bg-green-50 text-green-700 border-green-200",
  no_show: "bg-yellow-50 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

/**
 * Compact booking history list for a student's ContactShow page.
 * Shows session date (via session_id label) and status badge for each booking.
 */
export const BookingHistoryList = ({ bookings }: BookingHistoryListProps) => {
  const translate = useTranslate();

  return (
    <div className="space-y-1" data-testid="booking-history-list">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between py-1"
        >
          <span className="text-xs text-muted-foreground truncate flex-1">
            {translate("resources.bookings.fields.session_id")}:{" "}
            {String(booking.session_id)}
          </span>
          <Badge
            variant="outline"
            className={STATUS_CLASS[booking.status] ?? STATUS_CLASS.booked}
            data-testid="booking-history-status"
          >
            {translate(`resources.bookings.status.${booking.status}`)}
          </Badge>
        </div>
      ))}
    </div>
  );
};
