import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";

import type { SubscriptionSummary } from "../types";

interface SubscriptionListItemProps {
  subscription: SubscriptionSummary;
}

/**
 * Compact row showing a subscription pack's session counts.
 * Highlights packs with remaining sessions in green; exhausted packs in muted.
 */
export const SubscriptionListItem = ({
  subscription,
}: SubscriptionListItemProps) => {
  const translate = useTranslate();
  const hasRemaining = (subscription.sessions_remaining ?? 0) > 0;

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">
        {translate("resources.subscriptions.fields.purchased_at")}:{" "}
        {new Date(subscription.purchased_at).toLocaleDateString()}
      </span>
      <Badge
        variant="outline"
        className={
          hasRemaining
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-500 border-gray-200"
        }
        data-testid="sessions-remaining-badge"
      >
        {translate("resources.subscriptions.fields.sessions_remaining")}:{" "}
        {subscription.sessions_remaining ?? 0}
      </Badge>
    </div>
  );
};
