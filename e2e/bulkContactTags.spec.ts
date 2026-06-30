import { test, expect } from "./fixtures";

/**
 * Verify that all contact-facing tag affordances have been removed:
 * - No tag badges in the contact list
 * - No tags filter category in the contact list sidebar
 * - No bulk-tag button in bulk actions
 * - No tags section in the contact detail view
 */
test("contact list and detail view have no tag UI", async ({
  page,
  createUser,
  createSales,
  createContact,
  isMobile,
  menu,
}) => {
  test.skip(isMobile, "Desktop-only test: bulk actions and filter sidebar");

  const sales = await createSales({
    email: "teacher@school.example",
    first_name: "Teacher",
    last_name: "Smith",
    password: "password",
  });

  await createContact({
    first_name: "Ada",
    last_name: "Lovelace",
    sales_id: sales.id,
    title: "CTO",
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("teacher@school.example");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveTitle(/Atomic CRM/);

  await menu.goToStudents();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();

  // No tags filter category in the sidebar
  await expect(
    page.getByRole("button", { name: /tags/i }),
  ).not.toBeVisible();

  // No bulk-tag button when rows are selected
  const checkbox = page.getByRole("checkbox").first();
  await checkbox.click();
  await expect(
    page.getByRole("button", { name: /^Tag$/i }),
  ).not.toBeVisible();

  // Navigate to student detail — no tags section
  await page.getByText("Ada Lovelace").click();
  await expect(page.getByText(/tags/i)).not.toBeVisible();
});
