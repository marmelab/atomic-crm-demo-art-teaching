import { test, expect } from "./fixtures";

test.describe("Session teacher selector", () => {
  test("create session: teacher selector is visible and persists the chosen teacher", async ({
    page,
    createUser,
    createSales,
  }) => {
    // Set up admin and a second teacher
    await createUser({ email: "admin@school.example", password: "password" });
    await createSales({
      first_name: "Alice",
      last_name: "Dupont",
      email: "alice@school.example",
      password: "password",
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/Atomic CRM/);

    // Log in as admin
    await page.getByLabel("Email").fill("admin@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to Sessions and open the create form
    await page.getByRole("link", { name: "Sessions" }).click();
    await page.getByRole("button", { name: "New session" }).click();

    // The teacher selector must be visible with the "Teacher" label
    await expect(page.getByLabel("Teacher")).toBeVisible();

    // Fill in the start date (two weeks out at 10:00)
    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateTimeLocal = `${twoWeeksOut.getFullYear()}-${pad(twoWeeksOut.getMonth() + 1)}-${pad(twoWeeksOut.getDate())}T10:00`;
    await page.locator('input[type="datetime-local"]').fill(dateTimeLocal);

    // Select Alice as the teacher
    await page.getByLabel("Teacher").click();
    await page.getByRole("option", { name: "Alice Dupont" }).click();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Element created")).toBeVisible();

    // Re-open the edit form to verify Alice Dupont was persisted as the teacher
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page.getByLabel("Teacher")).toBeVisible();
    await expect(page.getByLabel("Teacher")).toContainText("Alice Dupont");
  });

  test("edit session: changing the teacher persists the new selection", async ({
    page,
    createUser,
    createSales,
  }) => {
    // Set up admin and two teachers
    await createUser({ email: "admin@school.example", password: "password" });
    await createSales({
      first_name: "Bob",
      last_name: "Martin",
      email: "bob@school.example",
      password: "password",
    });

    await page.goto("/");
    await page.getByLabel("Email").fill("admin@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Create a session through the UI (assigned to admin by default)
    await page.getByRole("link", { name: "Sessions" }).click();
    await page.getByRole("button", { name: "New session" }).click();

    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateTimeLocal = `${twoWeeksOut.getFullYear()}-${pad(twoWeeksOut.getMonth() + 1)}-${pad(twoWeeksOut.getDate())}T10:00`;
    await page.locator('input[type="datetime-local"]').fill(dateTimeLocal);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Element created")).toBeVisible();

    // Edit the session and change the teacher to Bob
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page.getByLabel("Teacher")).toBeVisible();

    await page.getByLabel("Teacher").click();
    await page.getByRole("option", { name: "Bob Martin" }).click();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Element updated")).toBeVisible();

    // Re-open the edit form to confirm Bob Martin is saved
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page.getByLabel("Teacher")).toBeVisible();
    await expect(page.getByLabel("Teacher")).toContainText("Bob Martin");
  });
});
