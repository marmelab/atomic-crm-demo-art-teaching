import { createClient } from "@supabase/supabase-js";
import { test, expect } from "./fixtures";

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54341",
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Pad a number to two digits. */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Build an ISO datetime string for a session that is:
 * - `daysFromNow` days in the future (positive) so it appears in the upcoming list
 * - Anchored to midnight UTC to keep the date stable within CI runs
 */
const futureDateISO = (daysFromNow: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(10, 0, 0, 0);
  return d.toISOString();
};

/**
 * Returns "YYYY-MM" for the month that `daysFromNow` days from today falls in.
 * Used to assert the monthly recap defaults to the correct month.
 */
const yearMonthFor = (daysFromNow: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

test.describe("Booking lifecycle", () => {
  test("full teacher lifecycle: book → attend → monthly recap + prepaid decrement → cancel → re-book", async ({
    page,
    createUser,
    createContact,
    createSession,
    createSubscription,
  }) => {
    // Arrange: teacher, two students, a session 1 day out (still in the upcoming list),
    // and a subscription for the main student so prepaid_remaining is observable.
    const teacher = await createUser({
      email: "lifecycle-teacher@school.example",
      password: "password",
    });

    const student = await createContact({
      first_name: "Lifecycle",
      last_name: "Student",
      sales_id: teacher.id,
    });

    const student2 = await createContact({
      first_name: "Cancel",
      last_name: "Student",
      sales_id: teacher.id,
    });

    // Session 1 day from now — appears in the upcoming-sessions list
    const sessionStartsAt = futureDateISO(1);
    const sessionRecord = await createSession({
      starts_at: sessionStartsAt,
      sales_id: teacher.id,
    });

    // Subscription: 10 total sessions → after 1 attended booking, 9 remain
    const today = new Date().toISOString().split("T")[0];
    const subscription = await createSubscription({
      contact_id: student.id,
      total_sessions: 10,
      purchased_at: today,
      sales_id: teacher.id,
    });

    // Log in
    await page.goto("http://localhost:5175/");
    await page.getByLabel("Email").fill("lifecycle-teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForLoadState("networkidle");

    // === Step 1: Navigate to the session show page via the Sessions list ===
    await page.getByRole("link", { name: "Sessions" }).click();
    await page.waitForLoadState("networkidle");

    // Click the capacity badge of the first (and only) session row to open ShowPage
    await page.getByTestId("capacity-badge").first().click();
    await page.waitForLoadState("networkidle");

    // === Step 2: Book student2 first (we will cancel it later) ===
    await page.getByTestId("add-student-button").click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    let contactInput = dialog.getByRole("combobox").first();
    await contactInput.click();
    await contactInput.fill("Cancel");
    await page.getByRole("option", { name: /Cancel Student/i }).click();

    let typeSelect = dialog.getByRole("combobox", { name: /booking type/i });
    await typeSelect.click();
    await page.getByRole("option", { name: "Single" }).click();

    await dialog.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Cancel Student/i)).toBeVisible();

    // === Step 3: Book the main student using a subscription ===
    await page.getByTestId("add-student-button").click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    contactInput = dialog.getByRole("combobox").first();
    await contactInput.click();
    await contactInput.fill("Lifecycle");
    await page.getByRole("option", { name: /Lifecycle Student/i }).click();

    typeSelect = dialog.getByRole("combobox", { name: /booking type/i });
    await typeSelect.click();
    await page.getByRole("option", { name: "Subscription" }).click();

    // Select the subscription that appeared
    const subscriptionSelect = dialog.getByRole("combobox", {
      name: /subscription/i,
    });
    await subscriptionSelect.click();
    await page.getByRole("option").first().click();

    await dialog.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    // Assert: Lifecycle Student appears in the roster
    await expect(page.getByText(/Lifecycle Student/i)).toBeVisible();

    // === Step 4: Mark the main student's booking as attended ===
    const bookingRow = page
      .getByTestId("booking-row")
      .filter({ hasText: /Lifecycle Student/i });
    await bookingRow.getByTestId("mark-attended-button").click();
    await page.waitForLoadState("networkidle");

    // Assert: status badge shows "Attended"
    await expect(bookingRow.getByTestId("booking-status-badge")).toContainText(
      "Attended",
    );

    // === Step 5: Check the monthly recap on the Dashboard ===
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /Monthly Recap/i }),
    ).toBeVisible();

    // Navigate the month picker to the session's month (handles end-of-month edge case)
    const sessionMonth = yearMonthFor(1);
    const monthPicker = page.getByLabel(/Month/i);
    await monthPicker.fill(sessionMonth);
    await page.waitForLoadState("networkidle");

    // Lifecycle Student row must show sessions_attended = 1
    const recapRow = page
      .getByTestId("monthly-recap-row")
      .filter({ hasText: /Lifecycle Student/i });
    await expect(recapRow).toBeVisible();
    await expect(recapRow.getByTestId("sessions-attended")).toHaveText("1");

    // Prepaid remaining decremented: 10 total − 1 used = 9
    await expect(recapRow.getByTestId("prepaid-remaining")).toHaveText("9");

    // === Step 6: Cancel student2's booking and verify the slot is freed ===
    await page.getByRole("link", { name: "Sessions" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId("capacity-badge").first().click();
    await page.waitForLoadState("networkidle");

    const cancelRow = page
      .getByTestId("booking-row")
      .filter({ hasText: /Cancel Student/i });
    await cancelRow.getByTestId("cancel-booking-button").click();
    await page.waitForLoadState("networkidle");

    // Booking is now shown as Cancelled
    await expect(cancelRow.getByTestId("booking-status-badge")).toContainText(
      "Cancelled",
    );

    // === Step 7: Verify the freed slot is re-bookable (re-add Cancel Student) ===
    await page.getByTestId("add-student-button").click();
    const dialog3 = page.getByRole("dialog");
    await expect(dialog3).toBeVisible();

    const contactInput3 = dialog3.getByRole("combobox").first();
    await contactInput3.click();
    await contactInput3.fill("Cancel");
    await page.getByRole("option", { name: /Cancel Student/i }).click();

    const typeSelect3 = dialog3.getByRole("combobox", {
      name: /booking type/i,
    });
    await typeSelect3.click();
    await page.getByRole("option", { name: "Single" }).click();

    await dialog3.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    // A new Booked row for Cancel Student appears (most-recent = last in list)
    const rebookedRows = page
      .getByTestId("booking-row")
      .filter({ hasText: /Cancel Student/i });
    // There are 2 rows: one Cancelled, one newly Booked
    await expect(rebookedRows).toHaveCount(2);
    // The last row (re-booked) must have status "Booked"
    await expect(
      rebookedRows.last().getByTestId("booking-status-badge"),
    ).toContainText("Booked");

    // Cleanup sessions and subscriptions (bookings cascade-delete with session)
    await adminSupabase
      .from("bookings")
      .delete()
      .eq("session_id", sessionRecord.id);
    await adminSupabase.from("sessions").delete().eq("id", sessionRecord.id);
    await adminSupabase
      .from("subscriptions")
      .delete()
      .eq("id", subscription.id);
  });

  test("capacity rule: an 18th booking on a 15+2 session is rejected", async ({
    page,
    createUser,
    createContact,
    createSession,
    createBooking,
  }) => {
    // Arrange: teacher + 18 students; fill 17 slots via admin, attempt 18th via UI
    const teacher = await createUser({
      email: "capacity-teacher@school.example",
      password: "password",
    });

    // Session 3 days out so it appears in the upcoming list
    const sessionRecord = await createSession({
      starts_at: futureDateISO(3),
      capacity: 15,
      overbooking: 2,
      sales_id: teacher.id,
    });

    // Create 18 students
    const students: Array<{ id: number | string }> = [];
    for (let i = 1; i <= 18; i++) {
      const s = await createContact({
        first_name: `Cap${i}`,
        last_name: "Student",
        sales_id: teacher.id,
      });
      students.push(s);
    }

    // Directly insert 17 live bookings to fill the session
    for (let i = 0; i < 17; i++) {
      await createBooking({
        session_id: sessionRecord.id,
        contact_id: students[i].id,
        type: "single",
        status: "booked",
        sales_id: teacher.id,
      });
    }

    // Log in
    await page.goto("http://localhost:5175/");
    await page.getByLabel("Email").fill("capacity-teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Sessions" }).click();
    await page.waitForLoadState("networkidle");

    // The session row shows 17/17 (fully booked)
    await expect(page.getByTestId("capacity-badge").first()).toHaveText("17/17");

    // Navigate to the session show page
    await page.getByTestId("capacity-badge").first().click();
    await page.waitForLoadState("networkidle");

    // Attempt to add the 18th student
    await page.getByTestId("add-student-button").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const contactInput = dialog.getByRole("combobox").first();
    await contactInput.click();
    await contactInput.fill("Cap18");
    await page.getByRole("option", { name: /Cap18 Student/i }).click();

    const typeSelect = dialog.getByRole("combobox", { name: /booking type/i });
    await typeSelect.click();
    await page.getByRole("option", { name: "Single" }).click();

    // Set up network listener BEFORE clicking Save to avoid race conditions
    const saveResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/bookings") && resp.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Save" }).click();
    const saveResponse = await saveResponsePromise;

    // The capacity trigger must reject the request
    expect(saveResponse.status()).toBeGreaterThanOrEqual(400);

    // Wait for the UI to settle after the rejection
    await page.waitForLoadState("networkidle");

    // Cap18 Student must NOT appear in the roster (no live booking created)
    const cap18Rows = page
      .getByTestId("booking-row")
      .filter({ hasText: /Cap18 Student/i });
    await expect(cap18Rows).toHaveCount(0);

    // Cleanup
    await adminSupabase
      .from("bookings")
      .delete()
      .eq("session_id", sessionRecord.id);
    await adminSupabase.from("sessions").delete().eq("id", sessionRecord.id);
  });
});
