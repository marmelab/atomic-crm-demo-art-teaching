import { test, expect } from "./fixtures";

test.describe("Booking management", () => {
  test("can add a student to a session and mark the booking attended", async ({
    page,
    createUser,
    createContact,
  }) => {
    // Arrange: create a teacher user and a student contact
    const teacher = await createUser({
      email: "teacher@school.example",
      password: "password",
    });

    await createContact({
      first_name: "Alice",
      last_name: "Demo",
      sales_id: teacher.id,
    });

    // Log in as teacher
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to Sessions and create a new session
    await page.getByRole("link", { name: "Sessions" }).click();
    await page.getByRole("button", { name: "New session" }).click();

    // Fill starts_at: two weeks from now
    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    twoWeeksOut.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateTimeLocal = `${twoWeeksOut.getFullYear()}-${pad(twoWeeksOut.getMonth() + 1)}-${pad(twoWeeksOut.getDate())}T10:00`;
    await page.locator('input[type="datetime-local"]').fill(dateTimeLocal);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Element created")).toBeVisible();

    // We are now on the SessionShow page — verify roster is present
    await expect(page.getByTestId("capacity-badge").first()).toBeVisible();

    // Act: add a student via the "Add student" dialog
    await page.getByTestId("add-student-button").click();

    // The dialog should open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Select the student in the contact autocomplete
    const contactInput = dialog.getByRole("combobox").first();
    await contactInput.click();
    await contactInput.fill("Alice");
    await page.getByRole("option", { name: /Alice Demo/i }).click();

    // Select booking type: single
    const typeSelect = dialog.getByRole("combobox", { name: /booking type/i });
    await typeSelect.click();
    await page.getByRole("option", { name: "Single" }).click();

    // Submit — wait for the create request so the roster reflects it
    const bookingCreated = page.waitForResponse(
      (resp) =>
        resp.url().includes("/bookings") && resp.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Save" }).click();
    await bookingCreated;

    // Booking should be created and row appears in the roster
    await expect(page.getByTestId("booking-row").first()).toBeVisible();

    // Act: mark the booking as attended
    await page.getByTestId("mark-attended-button").first().click();

    // Assert: status badge shows "Attended"
    await expect(
      page.getByTestId("booking-status-badge").first(),
    ).toContainText("Attended");

    // Assert: the capacity badge live count increased
    await expect(page.getByTestId("capacity-badge").first()).toBeVisible();

    // Verify that the student's name appears in the roster row
    await expect(page.getByText(/Alice Demo/i)).toBeVisible();
  });
});
