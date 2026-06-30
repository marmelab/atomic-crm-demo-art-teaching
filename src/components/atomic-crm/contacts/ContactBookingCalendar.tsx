/**
 * Monthly calendar showing a student's booking history.
 *
 * - Fetches the contact's bookings, then resolves each booking's session date.
 * - Groups bookings by the session's starts_at day (yyyy-MM-dd).
 * - Renders a Google-Calendar-style month grid using the shared calendarDates
 *   helpers and the same status colour conventions as BookingHistoryList.
 * - Month navigation (prev / next / today) is local state — no URL params.
 */

import { useMemo, useState } from "react";
import { useGetList, useTranslate } from "ra-core";
import { format, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Booking, BookingStatus, Session } from "../types";
import type { CalendarDayKey } from "../sessions/calendar/calendarDates";
import {
  getMonthGrid,
  getMonthRange,
  toCalendarDayKey,
  prevPeriodAnchor,
  nextPeriodAnchor,
} from "../sessions/calendar/calendarDates";
import { STATUS_CLASS } from "./BookingHistoryList";

/** Maximum booking chips shown per day cell before collapsing into "+N more". */
const MAX_VISIBLE_CHIPS = 3;

/**
 * Computes the combined loading state for the two-stage bookings → sessions
 * fetch chain.
 *
 * The sessions query is conditionally enabled: it only fires when bookings are
 * loaded AND the contact has at least one booking (`sessionsEnabled = true`).
 * A disabled react-query query stays in `status: "pending"` indefinitely, so
 * we must NOT include `sessionsPending` in the result when the query is not
 * enabled — otherwise a contact with zero bookings would be stuck in the
 * loading state forever.
 *
 * @param bookingsPending - True while the bookings list is still fetching.
 * @param sessionsEnabled - Whether the sessions query was enabled (i.e. bookings
 *   loaded and at least one session_id exists).
 * @param sessionsPending - True while the sessions query is fetching.
 * @returns True if either active query has not yet resolved.
 */
export function computeIsPending(
  bookingsPending: boolean,
  sessionsEnabled: boolean,
  sessionsPending: boolean,
): boolean {
  return bookingsPending || (sessionsEnabled && sessionsPending);
}

/** Abbreviated weekday header labels (Mon–Sun). */
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ContactBookingCalendarProps {
  /** The contact whose bookings are displayed. */
  contactId: string | number;
}

/** A booking annotated with its resolved session start date. */
interface BookingWithDate {
  booking: Booking;
  dayKey: CalendarDayKey;
}

/**
 * Builds an O(1) map from yyyy-MM-dd key to the bookings that fall on that day.
 * Bookings whose session_id is not found in the sessions map are silently skipped.
 *
 * @param bookings - Flat list of bookings for the contact.
 * @param sessionsById - Sessions indexed by their id, used to resolve the date.
 * @returns Map from day key to annotated booking entries.
 */
export function groupBookingsByDay(
  bookings: Booking[],
  sessionsById: Map<string | number, Session>,
): Map<CalendarDayKey, BookingWithDate[]> {
  const map = new Map<CalendarDayKey, BookingWithDate[]>();

  for (const booking of bookings) {
    const session = sessionsById.get(booking.session_id);
    if (!session) continue;

    const dayKey = toCalendarDayKey(new Date(session.starts_at));
    const existing = map.get(dayKey);
    const entry: BookingWithDate = { booking, dayKey };

    if (existing) {
      existing.push(entry);
    } else {
      map.set(dayKey, [entry]);
    }
  }

  return map;
}

/**
 * Monthly booking calendar for a student's contact detail page.
 *
 * Accepts a `contactId` and renders the student's booking history as a
 * month grid. Uses local state for month navigation — no URL dependency.
 *
 * @param contactId - The contact whose bookings are displayed.
 */
export const ContactBookingCalendar = ({
  contactId,
}: ContactBookingCalendarProps) => {
  const translate = useTranslate();
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const weeks = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);
  const [rangeStart, rangeEnd] = useMemo(
    () => getMonthRange(anchorDate),
    [anchorDate],
  );

  // Fetch all bookings for this contact (bounded to a reasonable page size)
  const {
    data: bookings = [],
    isPending: bookingsPending,
    error: bookingsError,
  } = useGetList<Booking>("bookings", {
    filter: { "contact_id@eq": contactId },
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "DESC" },
  });

  // Collect unique session IDs referenced by the bookings
  const sessionIds = useMemo(
    () => [...new Set(bookings.map((b) => b.session_id))],
    [bookings],
  );

  // Only fire the sessions query when bookings are loaded AND there is at least
  // one session to resolve. When a contact has zero bookings (sessionIds is
  // empty) the query stays disabled, but we must NOT let its permanently-pending
  // status propagate up — otherwise the loading spinner never clears.
  const sessionsEnabled = !bookingsPending && sessionIds.length > 0;

  // Fetch only the sessions within the visible grid range — filtering server-side
  const {
    data: sessions = [],
    isPending: sessionsPending,
    error: sessionsError,
  } = useGetList<Session>(
    "sessions",
    {
      filter: {
        "starts_at@gte": rangeStart.toISOString(),
        "starts_at@lt": rangeEnd.toISOString(),
      },
      pagination: { page: 1, perPage: 500 },
      sort: { field: "starts_at", order: "ASC" },
    },
    { enabled: sessionsEnabled },
  );

  // When sessionsEnabled is false the query is never started and its status
  // stays "pending" indefinitely — guard against that by ignoring sessionsPending
  // when the query is not enabled (see computeIsPending for full rationale).
  const isPending = computeIsPending(
    bookingsPending,
    sessionsEnabled,
    sessionsPending,
  );
  const error = bookingsError ?? sessionsError;

  // Index sessions by id for O(1) lookup
  const sessionsById = useMemo<Map<string | number, Session>>(() => {
    const map = new Map<string | number, Session>();
    for (const s of sessions) {
      map.set(s.id, s);
    }
    return map;
  }, [sessions]);

  // Group bookings that fall in the visible month by day key
  const bookingsByDay = useMemo(
    () => groupBookingsByDay(bookings, sessionsById),
    [bookings, sessionsById],
  );

  const monthLabel = format(anchorDate, "MMMM yyyy");

  const handlePrev = () => setAnchorDate((d) => prevPeriodAnchor(d, "month"));
  const handleNext = () => setAnchorDate((d) => nextPeriodAnchor(d, "month"));
  const handleToday = () => setAnchorDate(new Date());

  return (
    <div
      className="flex flex-col gap-2"
      data-testid="contact-booking-calendar"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          aria-label={translate("resources.bookings.calendar.today")}
        >
          {translate("resources.bookings.calendar.today")}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          aria-label={translate("resources.bookings.calendar.prev")}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          aria-label={translate("resources.bookings.calendar.next")}
        >
          <ChevronRight className="size-4" />
        </Button>
        <span className="text-sm font-semibold">{monthLabel}</span>
      </div>

      {/* State panels */}
      {isPending && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {translate("crm.common.loading")}
        </p>
      )}

      {!isPending && error && (
        <p
          className="text-sm text-destructive py-4 text-center"
          data-testid="booking-calendar-error"
        >
          {translate("resources.bookings.calendar.error")}
        </p>
      )}

      {!isPending && !error && (
        <>
          {/* Grid */}
          <div
            className="rounded-md border bg-background overflow-hidden"
            data-testid="booking-calendar-grid"
          >
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b">
              {WEEKDAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week rows */}
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b last:border-b-0"
              >
                {week.map((day, dayIndex) => (
                  <BookingDayCell
                    key={dayIndex}
                    day={day}
                    anchorDate={anchorDate}
                    bookingsByDay={bookingsByDay}
                    translate={translate}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Empty state — shown below the grid so the grid structure is always visible */}
          {bookingsByDay.size === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-2"
              data-testid="booking-calendar-empty"
            >
              {translate("resources.bookings.calendar.empty")}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Day cell
// ---------------------------------------------------------------------------

interface BookingDayCellProps {
  day: Date;
  anchorDate: Date;
  bookingsByDay: Map<CalendarDayKey, BookingWithDate[]>;
  /** Injected translate fn to avoid extra hook call per cell. */
  translate: (key: string) => string;
}

/**
 * A single day cell inside the booking calendar month grid.
 *
 * Shows up to MAX_VISIBLE_CHIPS status chips; extras collapse into "+N more".
 */
const BookingDayCell = ({
  day,
  anchorDate,
  bookingsByDay,
  translate,
}: BookingDayCellProps) => {
  const key = toCalendarDayKey(day);
  const entries = bookingsByDay.get(key) ?? [];
  const isCurrentMonth = isSameMonth(day, anchorDate);
  const isTodayCell = isToday(day);
  const overflow = entries.length - MAX_VISIBLE_CHIPS;
  const visibleEntries = entries.slice(0, MAX_VISIBLE_CHIPS);

  return (
    <div
      className={cn(
        "overflow-hidden border-r p-1 last:border-r-0 flex flex-col min-h-[72px]",
        !isCurrentMonth && "bg-muted/40",
        isTodayCell && "bg-primary/5",
      )}
      data-testid={`booking-day-cell-${key}`}
    >
      {/* Day number */}
      <div className="mb-1 flex justify-end">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
            !isCurrentMonth && "text-muted-foreground",
            isTodayCell && "bg-primary text-primary-foreground",
          )}
          aria-label={format(day, "MMMM d, yyyy")}
        >
          {format(day, "d")}
        </span>
      </div>

      {/* Booking chips */}
      <div className="flex flex-col gap-0.5">
        {visibleEntries.map(({ booking }) => (
          <BookingChip
            key={booking.id}
            status={booking.status}
            translate={translate}
          />
        ))}

        {/* "+N more" overflow affordance */}
        {overflow > 0 && (
          <span
            className="block px-1 text-xs text-muted-foreground"
            data-testid={`booking-overflow-${key}`}
          >
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Booking chip
// ---------------------------------------------------------------------------

interface BookingChipProps {
  status: BookingStatus;
  translate: (key: string) => string;
}

/**
 * Compact status chip for a single booking, colour-keyed via STATUS_CLASS.
 */
const BookingChip = ({ status, translate }: BookingChipProps) => (
  <Badge
    variant="outline"
    className={cn(
      "block truncate text-xs px-1 py-0 leading-5",
      STATUS_CLASS[status] ?? STATUS_CLASS.booked,
    )}
    data-testid="booking-calendar-chip"
  >
    {translate(`resources.bookings.status.${status}`)}
  </Badge>
);
