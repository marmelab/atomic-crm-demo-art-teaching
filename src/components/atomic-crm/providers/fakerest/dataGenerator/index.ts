import { generateBookings } from "./bookings";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
import { generateSessions, toSessionsSummary } from "./sessions";
import { generateSubscriptions, toSubscriptionsSummary } from "./subscriptions";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.tasks = generateTasks(db);
  db.subscriptions = generateSubscriptions(db);
  db.sessions = generateSessions(db);
  db.bookings = generateBookings(db);
  db.subscriptions_summary = toSubscriptionsSummary(
    db.subscriptions,
    db.bookings,
  );
  db.sessions_summary = toSessionsSummary(db.sessions, db.bookings);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
