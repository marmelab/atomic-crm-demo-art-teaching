import { test, expect } from "./fixtures";

test.describe("Students resource", () => {
  test("can create a student and see them in the Students list", async ({
    page,
    createUser,
  }) => {
    // Create the first user (admin)
    await createUser({ email: "teacher@school.example", password: "password" });

    await page.goto("http://localhost:5175/");
    await expect(page).toHaveTitle(/Atomic CRM/);

    // Log in
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Navigate to Students via the nav link
    await page.getByRole("link", { name: "Students" }).click();
    await page.waitForLoadState("networkidle");

    // The list should say Students (resource relabel)
    await expect(
      page.getByRole("button", { name: "New Student" }),
    ).toBeVisible();

    // Create a new student
    await page.getByRole("button", { name: "New Student" }).click();
    await page.waitForLoadState("networkidle");

    // Fill in the trimmed form — no Title/Position section
    await page.getByLabel("She/Her").click();
    await page.getByLabel("First name").fill("Alice");
    await page.getByLabel("Last name").fill("Dupont");

    // Verify the Title/Position field is NOT present
    await expect(page.getByLabel("Title")).not.toBeVisible();

    // Fill email
    await page
      .getByRole("group", { name: "Email addresses" })
      .getByRole("textbox", { name: "Email" })
      .fill("alice@school.example");

    // Fill phone
    await page
      .getByRole("group", { name: "Phone numbers" })
      .getByRole("textbox", { name: "Phone number" })
      .fill("+33612345678");

    await page.getByRole("button", { name: "Save" }).click();

    // Confirm creation
    await expect(page.getByText("Element created")).toBeVisible();

    // Show page should display the student name
    await expect(page.locator("h5, h2").filter({ hasText: "Alice Dupont" })).toBeVisible();

    // Navigate back to list and confirm student appears
    await page.getByRole("link", { name: "Students" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Alice Dupont")).toBeVisible();
  });
});
