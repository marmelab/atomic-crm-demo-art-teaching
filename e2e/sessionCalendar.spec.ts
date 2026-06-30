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
