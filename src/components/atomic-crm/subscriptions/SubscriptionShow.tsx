import { ShowBase, useShowContext, useTranslate } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { EditButton } from "@/components/admin/edit-button";

import type { SubscriptionSummary } from "../types";

const SubscriptionShowContent = () => {
  const { record, isPending } = useShowContext<SubscriptionSummary>();
  const translate = useTranslate();

  if (isPending || !record) return null;

  return (
    <div className="mt-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {translate("resources.subscriptions.name", { smart_count: 1 })}
          </CardTitle>
          <EditButton />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.contact_id")}
            </dt>
            <dd>
              <ReferenceField
                source="contact_id"
                reference="contacts"
                link="show"
              />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.purchased_at")}
            </dt>
            <dd>
              <DateField source="purchased_at" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.total_sessions")}
            </dt>
            <dd>
              <NumberField source="total_sessions" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.sessions_used")}
            </dt>
            <dd>
              <NumberField source="sessions_used" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.sessions_remaining")}
            </dt>
            <dd>
              <NumberField source="sessions_remaining" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.price")}
            </dt>
            <dd>
              <NumberField source="price" />
            </dd>

            <dt className="text-sm font-medium text-muted-foreground">
              {translate("resources.subscriptions.fields.notes")}
            </dt>
            <dd>
              <TextField source="notes" />
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Detail view for a subscription (prepaid session pack).
 */
export const SubscriptionShow = () => (
  <ShowBase>
    <SubscriptionShowContent />
  </ShowBase>
);
