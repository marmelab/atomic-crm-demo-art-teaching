import type {
  Booking,
  Contact,
  ContactNote,
  Sale,
  Session,
  SessionSummary,
  Subscription,
  SubscriptionSummary,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  contacts: Contact[];
  contact_notes: ContactNote[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  subscriptions: Subscription[];
  subscriptions_summary: SubscriptionSummary[];
  sessions: Session[];
  sessions_summary: SessionSummary[];
  bookings: Booking[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
