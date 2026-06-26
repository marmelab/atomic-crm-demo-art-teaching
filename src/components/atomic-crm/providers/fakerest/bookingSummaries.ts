import type { DataProvider, Identifier } from "ra-core";

import type { Booking, Session } from "../../types";

const ALL = {
  pagination: { page: 1, perPage: 10_000 },
  sort: { field: "id", order: "ASC" as const },
};

/** Format a date as the "YYYY-MM" month key used by monthly_attendance ids. */
const toYearMonth = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Create the row if it does not exist yet, otherwise update it in place. */
const upsert = async (
  dp: DataProvider,
  resource: string,
  id: Identifier,
  data: Record<string, unknown>,
): Promise<void> => {
  const { data: existing } = await dp.getList(resource, {
    ...ALL,
    filter: { id },
  });
  if (existing.length > 0) {
    await dp.update(resource, { id, data, previousData: existing[0] });
  } else {
    await dp.create(resource, { data: { ...data, id } });
  }
};

/** Mirror sessions_summary (nb_booked, nb_attended) for one session. */
const recomputeSession = async (
  dp: DataProvider,
  sessionId: Identifier,
): Promise<void> => {
  const [{ data: session }, { data: bookings }] = await Promise.all([
    dp.getOne<Session>("sessions", { id: sessionId }),
    dp.getList<Booking>("bookings", {
      ...ALL,
      filter: { session_id: sessionId },
    }),
  ]);
  await upsert(dp, "sessions_summary", sessionId, {
    ...session,
    nb_booked: bookings.filter((b) => b.status !== "cancelled").length,
    nb_attended: bookings.filter((b) => b.status === "attended").length,
  });
};

/** Re-derive contacts.total_sessions_remaining (mirrors contacts_summary). */
const recomputeContactRemaining = async (
  dp: DataProvider,
  contactId: Identifier,
): Promise<void> => {
  const { data: summaries } = await dp.getList("subscriptions_summary", {
    ...ALL,
    filter: { contact_id: contactId },
  });
  const total = summaries.reduce(
    (acc, s) => acc + ((s.sessions_remaining as number) ?? 0),
    0,
  );
  const { data: contact } = await dp.getOne("contacts", { id: contactId });
  await dp.update("contacts", {
    id: contactId,
    data: { ...contact, total_sessions_remaining: total },
    previousData: contact,
  });
};

/** Mirror subscriptions_summary (sessions_used/remaining) and the contact total. */
const recomputeSubscription = async (
  dp: DataProvider,
  subscriptionId: Identifier,
): Promise<void> => {
  const [{ data: subscription }, { data: bookings }] = await Promise.all([
    dp.getOne("subscriptions", { id: subscriptionId }),
    dp.getList<Booking>("bookings", {
      ...ALL,
      filter: { subscription_id: subscriptionId },
    }),
  ]);
  const sessionsUsed = bookings.filter((b) => b.status === "attended").length;
  await upsert(dp, "subscriptions_summary", subscriptionId, {
    ...subscription,
    sessions_used: sessionsUsed,
    sessions_remaining: (subscription.total_sessions as number) - sessionsUsed,
  });
  await recomputeContactRemaining(dp, subscription.contact_id as Identifier);
};

/** Mirror the single monthly_attendance row for (contact, month-of-session). */
const recomputeMonthlyAttendance = async (
  dp: DataProvider,
  contactId: Identifier,
  session: Session,
): Promise<void> => {
  const monthStart = new Date(session.starts_at);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const yearMonth = toYearMonth(monthStart);
  const id = `${contactId}-${yearMonth}`;

  const [{ data: bookings }, { data: sessions }, { data: contact }] =
    await Promise.all([
      dp.getList<Booking>("bookings", {
        ...ALL,
        filter: { contact_id: contactId },
      }),
      dp.getList<Session>("sessions", ALL),
      dp.getOne("contacts", { id: contactId }),
    ]);
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  const attendedThisMonth = bookings.filter((b) => {
    if (b.status !== "attended") return false;
    const bookingSession = sessionById.get(b.session_id);
    if (!bookingSession) return false;
    return toYearMonth(new Date(bookingSession.starts_at)) === yearMonth;
  }).length;

  const { data: existing } = await dp.getList("monthly_attendance", {
    ...ALL,
    filter: { id },
  });

  if (attendedThisMonth === 0) {
    if (existing.length > 0) {
      await dp.delete("monthly_attendance", { id, previousData: existing[0] });
    }
    return;
  }

  await upsert(dp, "monthly_attendance", id, {
    contact_id: contactId,
    first_name: contact.first_name,
    last_name: contact.last_name,
    month: `${yearMonth}-01`,
    sessions_attended: attendedThisMonth,
  });
};

/**
 * Recomputes every summary affected by a single booking mutation so the
 * FakeRest demo stays consistent (the Supabase backend does this via views).
 * Covers sessions_summary, subscriptions_summary, contacts.total_sessions_remaining
 * and monthly_attendance.
 */
export const recomputeBookingSummaries = async (
  dp: DataProvider,
  booking: Pick<Booking, "session_id" | "contact_id" | "subscription_id">,
): Promise<void> => {
  const { data: session } = await dp.getOne<Session>("sessions", {
    id: booking.session_id,
  });
  await Promise.all([
    recomputeSession(dp, booking.session_id),
    recomputeMonthlyAttendance(dp, booking.contact_id, session),
    booking.subscription_id != null
      ? recomputeSubscription(dp, booking.subscription_id)
      : Promise.resolve(),
  ]);
};
