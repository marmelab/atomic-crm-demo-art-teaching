import { test, expect } from "./fixtures";

test.describe("Sessions calendar week view", () => {
  test("opens the calendar, shows the week grid, and navigates to a session on click", async ({
    page,
    createUser,
    createSession,
  }) => {
    // Arrange: create a teacher account and a session scheduled for today at 10:00
    const { id: salesId } = await createUser({
      email: "teacher@school.example",
      password: "password",
    });

    // Create a session today at 10:00 so it falls within the current week view
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    const session = await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      capacity: 15,
      overbooking: 2,
      sales_id: salesId,
    });

    // Act: log in and navigate to the calendar
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Click the "Calendar" navigation tab
    await page.getByRole("link", { name: "Calendar" }).click();

    // Assert: the week grid is visible
    await expect(page.getByTestId("week-view")).toBeVisible();

    // The grid should show 7 day columns (data-testid includes the yyyy-MM-dd key)
    // We verify that at least one day-column testid is present
    const todayKey = today.toISOString().slice(0, 10); // yyyy-MM-dd
    await expect(
      page.getByTestId(`day-column-${todayKey}`),
    ).toBeVisible();

    // The session block for today's session should be visible
    await expect(
      page.getByTestId("session-event-block").first(),
    ).toBeVisible();

    // Clicking the session block navigates to the session's show page
    await page.getByTestId("session-event-block").first().click();

    // The show page URL contains the session id
    await expect(page).toHaveURL(
      new RegExp(`/sessions/${session.id}/show`),
    );

    // The capacity badge should be present on the show page
    await expect(page.getByTestId("capacity-badge")).toBeVisible();
  });

  test("week navigation moves to the next and previous week", async ({
    page,
    createUser,
  }) => {
    await createUser({
      email: "teacher2@school.example",
      password: "password",
    });

    await page.goto("/");
    await page.getByLabel("Email").fill("teacher2@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.getByRole("link", { name: "Calendar" }).click();
    await expect(page.getByTestId("week-view")).toBeVisible();

    // Record the current period label
    const initialLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();

    // Navigate to next week
    await page.getByTestId("calendar-next").click();
    const nextLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();

    expect(nextLabel).not.toBe(initialLabel);

    // Navigate back to today — label should restore
    await page.getByTestId("calendar-today").click();
    const todayLabel = await page
      .getByTestId("calendar-period-label")
      .textContent();

    expect(todayLabel).toBe(initialLabel);
  });
});

/**
 * Session calendar — month view e2e spec.
 *
 * Verifies that:
 * 1. Switching to the Calendar display mode shows the month view grid.
 * 2. A seeded session appears as a chip in the correct day cell.
 * 3. Clicking the chip navigates to the session show page.
 */
test.describe("Session calendar — month view", () => {
  test("shows the month grid and a seeded session chip in the correct day cell", async ({
    page,
    createUser,
    createSession,
  }) => {
    // --- Arrange ---
    const user = await createUser({
      email: "teacher@school.example",
      password: "password",
    });

    // Seed a session for today at 09:00 so its day cell is predictable.
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const startsAt = today.toISOString();

    await createSession({
      starts_at: startsAt,
      duration_minutes: 60,
      sales_id: user.id,
    });

    // --- Act: log in and navigate to Sessions ---
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.getByRole("link", { name: "Sessions" }).click();

    // Switch to Calendar display mode
    await page.getByTestId("display-calendar-button").click();

    // The calendar defaults to week view — switch to month view
    await page.getByTestId("month-view-button").click();

    // --- Assert: month grid is visible ---
    await expect(page.getByTestId("month-view")).toBeVisible();

    // The day cell matching today should contain the session chip
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const todayCell = page.getByTestId(`day-cell-${todayKey}`);

    await expect(todayCell).toBeVisible();

    // At least one session chip should be visible in today's cell
    const chip = todayCell.getByTestId("session-chip").first();
    await expect(chip).toBeVisible();

    // Chip text includes the start time (09:00)
    await expect(chip).toContainText("09:00");

    // Clicking the chip navigates to the session show page
    await chip.click();
    await expect(page.getByTestId("capacity-badge")).toBeVisible();
  });
});
