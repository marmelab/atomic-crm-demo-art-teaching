/**
 * Sessions calendar e2e spec.
 *
 * Covers:
 *   - Sessions route defaults to calendar view (no ?display= param needed).
 *   - Week view renders the 7-column time grid; month view renders the month grid.
 *   - CalendarToolbar: prev/next navigation updates the period label.
 *   - CalendarToolbar: "Today" button resets the period label to the current period.
 *   - CalendarToolbar: week/month toggle switches the visible grid.
 *   - "New session" create button is accessible from the calendar toolbar.
 *   - A seeded session appears in the week view and navigates to its show page on click.
 *   - A seeded session appears as a chip in the correct day cell of the month view.
 */

import { test, expect } from "./fixtures";

// ---------------------------------------------------------------------------
// Shared login helper — keeps tests DRY without a full storageState setup
// ---------------------------------------------------------------------------
async function login(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  email: string,
  password: string,
) {
  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait until we land on the dashboard
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: false }).or(
      page.getByRole("link", { name: "Sessions" }),
    ),
  ).toBeVisible();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns today's yyyy-MM-dd string using local time, matching calendarDates.ts. */
function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------------------------------------------------------------------------
// Suite 1 — Calendar is the default sessions view
// ---------------------------------------------------------------------------
test.describe("Sessions route defaults to calendar", () => {
  test("shows the week grid without any ?display= param", async ({
    page,
    createUser,
  }) => {
    await createUser({ email: "teacher@school.example", password: "password" });
    await login(page, "teacher@school.example", "password");

    // Navigate to Sessions via the sidebar
    await page.getByRole("link", { name: "Sessions" }).click();

    // The calendar (week view) must be visible without any manual toggle
    await expect(page.getByTestId("week-view")).toBeVisible();

    // The toolbar period label is present
    await expect(page.getByTestId("calendar-period-label")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — CalendarToolbar navigation
// ---------------------------------------------------------------------------
test.describe("CalendarToolbar navigation", () => {
  test("prev/next buttons change the period label; Today restores it", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher2@school.example",
      password: "password",
    });
    await login(page, "teacher2@school.example", "password");

    await page.getByRole("link", { name: "Sessions" }).click();
    await expect(page.getByTestId("week-view")).toBeVisible();

    const initialLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();

    // Navigate forward
    await page.getByTestId("calendar-next").click();
    const nextLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(nextLabel).not.toBe(initialLabel);

    // Navigate backward past original
    await page.getByTestId("calendar-prev").click();
    await page.getByTestId("calendar-prev").click();
    const prevLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(prevLabel).not.toBe(initialLabel);

    // Today button restores the current week label
    await page.getByTestId("calendar-today").click();
    const restoredLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(restoredLabel).toBe(initialLabel);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Week/month view toggle
// ---------------------------------------------------------------------------
test.describe("Week/month view toggle", () => {
  test("switching to month view shows the month grid; switching back shows week grid", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher3@school.example",
      password: "password",
    });
    await login(page, "teacher3@school.example", "password");

    await page.getByRole("link", { name: "Sessions" }).click();
    await expect(page.getByTestId("week-view")).toBeVisible();

    // Verify the period label is a week label (contains "–")
    const weekLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(weekLabel).toMatch(/–/);

    // Toggle to month view
    await page.getByTestId("month-view-button").click();
    await expect(page.getByTestId("month-view")).toBeVisible();
    await expect(page.getByTestId("week-view")).not.toBeVisible();

    // Period label changes to "Month YYYY" format (no "–")
    const monthLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(monthLabel).not.toMatch(/–/);

    // Toggle back to week view
    await page.getByTestId("week-view-button").click();
    await expect(page.getByTestId("week-view")).toBeVisible();
    await expect(page.getByTestId("month-view")).not.toBeVisible();
  });

  test("month navigation changes the period label", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher4@school.example",
      password: "password",
    });
    await login(page, "teacher4@school.example", "password");

    await page.getByRole("link", { name: "Sessions" }).click();
    await page.getByTestId("month-view-button").click();
    await expect(page.getByTestId("month-view")).toBeVisible();

    const initialLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();

    await page.getByTestId("calendar-next").click();
    const nextLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(nextLabel).not.toBe(initialLabel);

    await page.getByTestId("calendar-today").click();
    const restoredLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();
    expect(restoredLabel).toBe(initialLabel);
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Session appears in week view; navigates to show page
// ---------------------------------------------------------------------------
test.describe("Session in week view", () => {
  test("seeded session block is visible and navigates to show page on click", async ({
    page,
    createUser,
    createSession,
  }) => {
    const { id: salesId } = await createUser({
      email: "teacher5@school.example",
      password: "password",
    });

    // Seed a session today at 10:00 local time
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    const session = await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      capacity: 15,
      overbooking: 2,
      sales_id: salesId,
    });

    await login(page, "teacher5@school.example", "password");
    await page.getByRole("link", { name: "Sessions" }).click();

    // The week view must be visible (default)
    await expect(page.getByTestId("week-view")).toBeVisible();

    // Today's day column is present
    await expect(
      page.getByTestId(`day-column-${todayKey()}`),
    ).toBeVisible();

    // Session event block is rendered
    await expect(
      page.getByTestId("session-event-block").first(),
    ).toBeVisible();

    // Click navigates to the session show page
    await page.getByTestId("session-event-block").first().click();
    await expect(page).toHaveURL(new RegExp(`/sessions/${session.id}/show`));
    await expect(page.getByTestId("capacity-badge")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Session chip in month view
// ---------------------------------------------------------------------------
test.describe("Session chip in month view", () => {
  test("seeded session chip appears in the correct day cell", async ({
    page,
    createUser,
    createSession,
  }) => {
    const user = await createUser({
      email: "teacher6@school.example",
      password: "password",
    });

    const today = new Date();
    today.setHours(9, 0, 0, 0);

    await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      sales_id: user.id,
    });

    await login(page, "teacher6@school.example", "password");
    await page.getByRole("link", { name: "Sessions" }).click();

    // Switch to month view
    await page.getByTestId("month-view-button").click();
    await expect(page.getByTestId("month-view")).toBeVisible();

    // Today's cell is present
    const dayCell = page.getByTestId(`day-cell-${todayKey()}`);
    await expect(dayCell).toBeVisible();

    // Session chip is visible inside today's cell
    const chip = dayCell.getByTestId("session-chip").first();
    await expect(chip).toBeVisible();
    await expect(chip).toContainText("09:00");

    // Clicking the chip navigates to the session show page
    await chip.click();
    await expect(page.getByTestId("capacity-badge")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — New session button is accessible from the calendar toolbar
// ---------------------------------------------------------------------------
test.describe("New session action", () => {
  test("Create session link is visible in the calendar toolbar", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher7@school.example",
      password: "password",
    });
    await login(page, "teacher7@school.example", "password");

    await page.getByRole("link", { name: "Sessions" }).click();
    await expect(page.getByTestId("week-view")).toBeVisible();

    // The "New session" (or "Create session") link/button must be visible in the toolbar
    const createLink = page
      .getByRole("link", { name: /new session|create session/i })
      .first();
    await expect(createLink).toBeVisible();

    // Clicking navigates to the create form
    await createLink.click();
    await expect(page).toHaveURL(/\/sessions\/create/);
  });
});

// ---------------------------------------------------------------------------
// Suite 7 — List fallback via ?display=list
// ---------------------------------------------------------------------------
test.describe("List view fallback", () => {
  test("toggling to list display shows the data table", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher8@school.example",
      password: "password",
    });
    await login(page, "teacher8@school.example", "password");

    await page.getByRole("link", { name: "Sessions" }).click();
    // Default is calendar
    await expect(page.getByTestId("week-view")).toBeVisible();

    // Switch to list mode
    await page.getByTestId("display-list-button").click();

    // Week view should be gone; DataTable appears
    await expect(page.getByTestId("week-view")).not.toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});
