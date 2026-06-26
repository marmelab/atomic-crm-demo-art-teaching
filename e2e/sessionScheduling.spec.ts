import { test, expect } from "./fixtures";

test.describe("Sessions resource", () => {
  test("can create a session and see it in the upcoming sessions list with a capacity badge", async ({
    page,
    createUser,
  }) => {
    // Create the first user (admin)
    await createUser({ email: "teacher@school.example", password: "password" });

    await page.goto("/");
    await expect(page).toHaveTitle(/Atomic CRM/);

    // Log in
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to Sessions via the nav link
    await page.getByRole("link", { name: "Sessions" }).click();

    // The list should have a New Session button
    await expect(
      page.getByRole("button", { name: "New session" }),
    ).toBeVisible();

    // Create a new session
    await page.getByRole("button", { name: "New session" }).click();

    // Fill in starts_at: two weeks from now at 10:00
    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    twoWeeksOut.setHours(10, 0, 0, 0);
    // datetime-local format: YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateTimeLocal = `${twoWeeksOut.getFullYear()}-${pad(twoWeeksOut.getMonth() + 1)}-${pad(twoWeeksOut.getDate())}T10:00`;

    await page.locator('input[type="datetime-local"]').fill(dateTimeLocal);
    // duration_minutes, capacity, overbooking are pre-filled with defaults 120 / 15 / 2

    await page.getByRole("button", { name: "Save" }).click();

    // Confirm creation
    await expect(page.getByText("Element created")).toBeVisible();

    // Show page should be visible with capacity badge.
    // Badge shows 0/(capacity + overbooking) = 0/17 for a session with no bookings.
    await expect(page.getByTestId("capacity-badge")).toBeVisible();
    await expect(page.getByTestId("capacity-badge")).toHaveText("0/17");

    // Navigate back to the list — session appears with a capacity badge
    await page.getByRole("link", { name: "Sessions" }).click();

    // The newly created session should appear (upcoming list, ordered by starts_at ASC)
    await expect(page.getByTestId("capacity-badge").first()).toBeVisible();
  });
});
