import type { SubscriptionSummary } from "../types";
import { SubscriptionCreate } from "./SubscriptionCreate";
import { SubscriptionEdit } from "./SubscriptionEdit";
import { SubscriptionList } from "./SubscriptionList";
import { SubscriptionShow } from "./SubscriptionShow";

export default {
  list: SubscriptionList,
  show: SubscriptionShow,
  edit: SubscriptionEdit,
  create: SubscriptionCreate,
  recordRepresentation: (record: SubscriptionSummary) =>
    `Subscription #${record.id}`,
};
