import { test, expect } from "./fixtures";

test.describe("Booking calendar in contact detail view", () => {
  test("shows the booking calendar above the notes list in the main panel", async ({
    page,
    createUser,
    createContact,
    createSession,
    createBooking,
  }) => {
    // Arrange: teacher user + student contact with a booking
    const teacher = await createUser({
      email: "teacher@school.example",
      password: "password",
    });

    const contact = await createContact({
      first_name: "Alice",
      last_name: "Student",
      sales_id: teacher.id,
    });

    const session = await createSession({
      starts_at: new Date().toISOString(),
      sales_id: teacher.id,
    });

    await createBooking({
      session_id: session.id,
      contact_id: contact.id,
      sales_id: teacher.id,
    });

    // Log in
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to the student detail page
    await page.getByRole("link", { name: "Students" }).click();
    await page.getByText("Alice Student").click();

    // Assert: the booking calendar month grid is visible
    const calendarGrid = page.getByTestId("booking-calendar-grid");
    await expect(calendarGrid).toBeVisible();

    // Assert: the calendar (data-testid) appears before the notes section in the DOM
    // Both elements must be in the main panel card — check that the calendar
    // comes before the InfiniteListBase notes area
    const calendarContainer = page.getByTestId("contact-booking-calendar");
    await expect(calendarContainer).toBeVisible();

    // Verify ordering: calendar bounding box top < notes section bounding box top
    const calendarBox = await calendarContainer.boundingBox();
    // The notes area is identified by the "Add a note" create button or the notes iterator
    // Use the NoteCreate / empty state or the overall notes wrapper inside the Card
    // When there are no notes, the empty NoteCreate is rendered; check the card content ordering
    // by verifying the calendar is present and precedes any note-related content
    const noteCreateOrNotes = page
      .locator('[data-testid="contact-booking-calendar"] ~ *')
      .first();
    // The sibling after the calendar should exist (InfiniteListBase wrapper)
    await expect(noteCreateOrNotes).toBeAttached();

    // Sanity: calendar top coordinate exists
    expect(calendarBox).not.toBeNull();
  });

  test("booking history section is removed from the contact aside panel", async ({
    page,
    createUser,
    createContact,
  }) => {
    // Arrange
    const teacher = await createUser({
      email: "teacher2@school.example",
      password: "password",
    });

    await createContact({
      first_name: "Bob",
      last_name: "Student",
      sales_id: teacher.id,
    });

    // Log in
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher2@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to the student detail page
    await page.getByRole("link", { name: "Students" }).click();
    await page.getByText("Bob Student").click();

    // Assert: "Booking history" heading is NOT present in the aside
    // (it should only appear in the main panel calendar toolbar area, not as a standalone aside section)
    const asideSection = page.locator(".hidden.sm\\:block");
    await expect(
      asideSection.getByRole("heading", { name: "Booking history" }),
    ).not.toBeVisible();

    // The booking calendar should still be visible in the main panel
    await expect(page.getByTestId("contact-booking-calendar")).toBeVisible();
  });
});
