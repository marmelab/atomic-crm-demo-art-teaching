import { ShowBase, useShowContext, useTranslate } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { TextField } from "@/components/admin/text-field";
import { EditButton } from "@/components/admin/edit-button";

import type { SessionSummary } from "../types";
import { CapacityBadge } from "./CapacityBadge";

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

      {/* Roster region — booking controls added in TASK-006 */}
      <Card>
        <CardHeader>
          <CardTitle>{translate("resources.sessions.roster.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {translate("resources.sessions.roster.placeholder")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Detail view for a session (scheduled class).
 * Renders session details, a capacity badge with color thresholds,
 * and a roster region placeholder for TASK-006's booking controls.
 */
export const SessionShow = () => (
  <ShowBase>
    <SessionShowContent />
  </ShowBase>
);
