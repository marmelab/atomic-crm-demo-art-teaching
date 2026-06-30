/**
 * SessionEventBlock — a single session rendered as a positioned block
 * inside the WeekView time grid.
 *
 * Vertical position and height are computed from the session's starts_at
 * time-of-day and duration_minutes relative to the visible hour window.
 * The block is purely presentational: it receives pre-computed top/height
 * percentages and fires navigation on click.
 */

import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useTranslate } from "ra-core";

import { CapacityBadge } from "../CapacityBadge";
import type { SessionSummary } from "../../types";
import { useGetSalesName } from "../../sales/useGetSalesName";
import { cn } from "@/lib/utils";

export interface SessionBlockGeometry {
  /** CSS top offset as a percentage of the day column height. */
  topPercent: number;
  /** CSS height as a percentage of the day column height. */
  heightPercent: number;
  /** Width fraction (0–1) for overlap layout; 1 means full column width. */
  widthFraction: number;
  /** Left offset fraction (0–1) for overlap layout; 0 means aligned to left. */
  leftFraction: number;
}

export interface SessionEventBlockProps {
  session: SessionSummary;
  geometry: SessionBlockGeometry;
}

/**
 * Renders a single session as an absolutely-positioned block inside a day
 * column. Clicking navigates to the session's show page.
 */
export const SessionEventBlock = ({
  session,
  geometry,
}: SessionEventBlockProps) => {
  const navigate = useNavigate();
  const translate = useTranslate();
  const teacherName = useGetSalesName(session.sales_id);

  const startLabel = format(new Date(session.starts_at), "HH:mm");

  const handleClick = () => {
    navigate(`/sessions/${session.id}/show`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/sessions/${session.id}/show`);
    }
  };

  const widthPct = geometry.widthFraction * 100;
  const leftPct = geometry.leftFraction * 100;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Session at ${startLabel}${teacherName ? ` — ${translate("resources.sessions.calendar.teacher")}: ${teacherName}` : ""}`}
      data-testid="session-event-block"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute overflow-hidden rounded border border-primary/20",
        "bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer",
        "flex flex-col gap-0.5 px-1 py-0.5 text-xs",
        "focus:outline-none focus:ring-2 focus:ring-primary",
      )}
      style={{
        top: `${geometry.topPercent}%`,
        height: `${geometry.heightPercent}%`,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        minHeight: "1.5rem",
      }}
    >
      <span className="font-semibold leading-none truncate">{startLabel}</span>
      {teacherName && (
        <span
          className="leading-none truncate text-muted-foreground"
          data-testid="session-event-block-teacher"
        >
          {teacherName}
        </span>
      )}
      {session.notes && (
        <span className="leading-none truncate text-muted-foreground">
          {session.notes}
        </span>
      )}
      <CapacityBadge
        nbBooked={session.nb_booked}
        capacity={session.capacity}
        overbooking={session.overbooking}
        className="self-start text-[0.6rem] px-1 py-0 h-auto"
      />
    </div>
  );
};
