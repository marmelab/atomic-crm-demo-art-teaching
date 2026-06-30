import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type { CONTACT_CREATED, CONTACT_NOTE_CREATED } from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;
} & Pick<RaRecord, "id">;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  /** @deprecated B2B field — not used in student-oriented forms, kept nullable for existing data */
  title?: string;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  gender: string;
  sales_id?: Identifier;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  /** Total prepaid sessions remaining across all packs for this student. */
  total_sessions_remaining?: number;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  contact_id: Identifier;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

/**
 * A prepaid pack of sessions bought by a student.
 *
 * Domain vocabulary mapping (single concept, three surface terms):
 * - "subscription" — the canonical CODE term: table, type, resource, route,
 *   and components (Subscription*) all use it. Always use this in code.
 * - "pack" — a USER-FACING term ("Buy pack" action). Friendlier shorthand.
 * - "prepaid" — a USER-FACING term for the remaining balance ("Prepaid
 *   remaining" column / `prepaid-remaining` testid).
 * When adding code, prefer "subscription"; when adding UI copy, reuse one of
 * the existing user-facing terms rather than introducing a fourth.
 */
export type Subscription = {
  contact_id: Identifier;
  created_at: string;
  total_sessions: number;
  purchased_at: string;
  price?: number | null;
  notes?: string | null;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type SubscriptionSummary = Subscription & {
  /** Count of attended bookings on this pack. */
  sessions_used: number;
  /** total_sessions - sessions_used. */
  sessions_remaining: number;
};

export type Session = {
  created_at: string;
  starts_at: string;
  duration_minutes: number;
  capacity: number;
  overbooking: number;
  notes?: string | null;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type SessionSummary = Session & {
  /** Count of live (non-cancelled) bookings for this session. */
  nb_booked: number;
  /** Count of bookings with status = 'attended' for this session. */
  nb_attended: number;
};

/** The booking type determines how the student obtained their spot. */
export type BookingType = "subscription" | "single" | "discovery";

/** The lifecycle status of a booking. */
export type BookingStatus = "booked" | "attended" | "cancelled" | "no_show";

export type Booking = {
  created_at: string;
  session_id: Identifier;
  contact_id: Identifier;
  subscription_id?: Identifier | null;
  type: BookingType;
  status: BookingStatus;
  cancelled_at?: string | null;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

/**
 * One row per (student, calendar month) from the monthly_attendance view.
 * id = contact_id + '-' + 'YYYY-MM' (synthetic, string).
 */
export type MonthlyAttendance = {
  /** Synthetic id: "<contact_id>-<YYYY-MM>" */
  id: string;
  contact_id: Identifier;
  first_name: string;
  last_name: string;
  /** ISO date string for the first day of the month (date_trunc result). */
  month: string;
  /** Count of bookings with status='attended' for this student this month. */
  sessions_attended: number;
};

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type Activity = RaRecord &
  (ActivityContactCreated | ActivityContactNoteCreated);

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
