import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
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
  db.subscriptions_summary = toSubscriptionsSummary(db.subscriptions);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
