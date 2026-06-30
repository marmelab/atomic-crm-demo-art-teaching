/**
 * Compact chip that represents a single session inside a month-view day cell.
 *
 * - Displays the session's start time (HH:mm) and a short label (duration).
 * - Color-keyed to the same capacity thresholds used by CapacityBadge.
 * - Links to the session's show page via react-router.
 */

import { format } from "date-fns";
import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

import type { SessionSummary } from "../../types";
import { getCapacityColorClass } from "../CapacityBadge";
import { useGetSalesName } from "../../sales/useGetSalesName";

interface SessionChipProps {
  session: SessionSummary;
}

/**
 * A clickable chip showing start time and duration for one session.
 * The background color reflects occupancy using the shared capacity thresholds.
 */
export const SessionChip = ({ session }: SessionChipProps) => {
  const translate = useTranslate();
  const teacherName = useGetSalesName(session.sales_id);

  const startTime = format(new Date(session.starts_at), "HH:mm");
  const label = `${startTime} · ${session.duration_minutes} min`;
  const tooltip = teacherName
    ? `${label} — ${translate("resources.sessions.calendar.teacher")}: ${teacherName}`
    : label;

  const colorClass = getCapacityColorClass(
    session.nb_booked,
    session.capacity,
    session.overbooking,
  );

  return (
    <Link
      to={`/sessions/${session.id}/show`}
      data-testid="session-chip"
      className={cn(
        "block truncate rounded px-1 py-0.5 text-xs font-medium leading-tight",
        "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        colorClass,
      )}
      title={tooltip}
    >
      {label}
      {teacherName && (
        <span
          className="block truncate opacity-80"
          data-testid="session-chip-teacher"
        >
          {teacherName}
        </span>
      )}
    </Link>
  );
};
