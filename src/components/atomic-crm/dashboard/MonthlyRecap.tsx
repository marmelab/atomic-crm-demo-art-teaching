import { CalendarDays } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Contact, MonthlyAttendance } from "../types";

/** Returns the ISO "YYYY-MM" string for today's month. */
const currentYearMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** Converts a "YYYY-MM" string to the first/last ISO date of that month. */
const monthBounds = (yearMonth: string): { start: string; end: string } => {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of the month
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(end) };
};

/**
 * Dashboard widget — monthly attendance recap.
 *
 * Shows a table: student name | sessions attended this month | prepaid remaining.
 * A month picker controls the month@gte / month@lte filter sent to the
 * monthly_attendance view. Prepaid remaining is sourced from contacts_summary
 * (total_sessions_remaining column) via a secondary getList call keyed on the
 * contact_ids present in the attendance rows.
 */
export const MonthlyRecap = () => {
  const translate = useTranslate();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);

  const { start, end } = monthBounds(selectedMonth);

  const {
    data: attendanceRows = [],
    total,
    isPending,
  } = useGetList<MonthlyAttendance>("monthly_attendance", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_name", order: "ASC" },
    filter: {
      "month@gte": start,
      "month@lte": end,
    },
  });

  // Build a set of contact ids present in the attendance rows so we can look
  // up their prepaid balance.
  const contactIds = attendanceRows.map((r) => r.contact_id);

  const { data: contacts = [] } = useGetList<Contact>(
    "contacts",
    {
      pagination: { page: 1, perPage: 500 },
      sort: { field: "id", order: "ASC" },
      filter:
        contactIds.length > 0
          ? { "id@in": `(${contactIds.join(",")})` }
          : { id: -1 }, // yields empty result when no attendance rows
    },
    { enabled: contactIds.length > 0 },
  );

  const remainingByContactId = new Map<Contact["id"], number>(
    contacts.map((c) => [c.id, c.total_sessions_remaining ?? 0]),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex">
          <CalendarDays className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground flex-1">
          {translate("crm.dashboard.monthly_recap.title", {
            _: "Monthly Recap",
          })}
        </h2>
        <div className="flex items-center gap-2">
          <label
            htmlFor="monthly-recap-picker"
            className="text-sm text-muted-foreground sr-only"
          >
            {translate("crm.dashboard.monthly_recap.month_picker_label", {
              _: "Month",
            })}
          </label>
          <input
            id="monthly-recap-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label={translate(
              "crm.dashboard.monthly_recap.month_picker_label",
              { _: "Month" },
            )}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <Card className="p-0 overflow-hidden">
        {isPending ? (
          <p className="p-4 text-sm text-muted-foreground">
            {translate("crm.common.loading", { _: "Loading..." })}
          </p>
        ) : !total ? (
          <p
            className="p-4 text-sm text-muted-foreground"
            data-testid="monthly-recap-empty"
          >
            {translate("crm.dashboard.monthly_recap.empty", {
              _: "No attendance data for this month.",
            })}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {translate("crm.dashboard.monthly_recap.column_student", {
                    _: "Student",
                  })}
                </TableHead>
                <TableHead className="text-right">
                  {translate(
                    "crm.dashboard.monthly_recap.column_sessions_attended",
                    { _: "Sessions attended" },
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {translate(
                    "crm.dashboard.monthly_recap.column_prepaid_remaining",
                    { _: "Prepaid remaining" },
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRows.map((row) => (
                <TableRow key={row.id} data-testid="monthly-recap-row">
                  <TableCell className="font-medium">
                    {row.first_name} {row.last_name}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    data-testid="sessions-attended"
                  >
                    {row.sessions_attended}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    data-testid="prepaid-remaining"
                  >
                    {remainingByContactId.get(row.contact_id) ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
