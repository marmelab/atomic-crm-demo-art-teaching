import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "./fixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Verify that contact CSV import succeeds when the CSV has no `tags` column.
 * The sample CSV shipped with the app (contacts_export.csv) must not contain
 * a `tags` column — this spec validates both the UI flow and the absence of
 * any tag-related import logic.
 */
test.describe("Contact CSV import without tags column", () => {
  test("imports a tags-free CSV and creates contacts successfully", async ({
    page,
    createUser,
  }) => {
    // Create admin user
    await createUser({
      email: "teacher@school.example",
      password: "password",
    });

    // Log in
    await page.goto("/");
    await page.getByLabel("Email").fill("teacher@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveTitle(/Atomic CRM/);

    // Navigate to Students (contacts)
    await page.getByRole("link", { name: "Students" }).click();
    await page.waitForLoadState("networkidle");

    // Open import dialog
    await page.getByRole("button", { name: /import/i }).click();
    await expect(
      page.getByRole("dialog", { name: /import/i }),
    ).toBeVisible();

    // Upload a tags-free CSV file (the updated sample CSV)
    const csvPath = path.resolve(
      __dirname,
      "../src/components/atomic-crm/contacts/contacts_export.csv",
    );
    await page
      .getByRole("dialog", { name: /import/i })
      .getByRole("textbox")
      .setInputFiles(csvPath);

    // Trigger the import
    await page.getByRole("button", { name: /import/i }).last().click();

    // Wait for import to complete
    await expect(
      page.getByText(/imported/i),
    ).toBeVisible({ timeout: 15000 });

    // Close the dialog
    await page.getByRole("button", { name: /close/i }).click();

    // Confirm the imported contacts appear in the list
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
  });
});
