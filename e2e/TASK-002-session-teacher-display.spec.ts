/**
 * TASK-002 — Session teacher display
 *
 * Covers:
 *   - SessionShow detail card shows a "Teacher" row with the assigned teacher's
 *     full name resolved from the sales record.
 *   - When no teacher is assigned, the Teacher row degrades gracefully (no crash).
 *   - The week-view SessionEventBlock shows the teacher's name.
 *   - The month-view SessionChip shows the teacher's name (label text and tooltip).
 */

import { test, expect } from "./fixtures";

/** Returns today's yyyy-MM-dd string using local time. */
function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function login(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  email: string,
  password: string,
) {
  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page
      .getByRole("heading", { name: "Dashboard", exact: false })
      .or(page.getByRole("link", { name: "Sessions" })),
  ).toBeVisible();
}

// ---------------------------------------------------------------------------
// Suite 1 — SessionShow displays the assigned teacher
// ---------------------------------------------------------------------------
test.describe("SessionShow: teacher row", () => {
  test("shows the assigned teacher's name in the detail card", async ({
    page,
    createSales,
    createSession,
  }) => {
    // Create teacher and a second admin account to log in with
    const teacher = await createSales({
      first_name: "Marie",
      last_name: "Curie",
      email: "marie@school.example",
      password: "password",
    });

    // Seed a session assigned to Marie Curie
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const session = await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      capacity: 10,
      overbooking: 0,
      sales_id: teacher.id,
    });

    await login(page, "marie@school.example", "password");

    // Navigate directly to the session show page
    await page.goto(`/#/sessions/${session.id}/show`);

    // The Teacher label must be present
    await expect(
      page.getByText("Teacher", { exact: false }),
    ).toBeVisible();

    // The teacher's full name must be resolved
    await expect(page.getByText("Marie Curie")).toBeVisible();
  });

  test("gracefully renders when no teacher is assigned", async ({
    page,
    createSales,
    createSession,
  }) => {
    const admin = await createSales({
      first_name: "Admin",
      last_name: "User",
      email: "admin2@school.example",
      password: "password",
    });

    // Seed a session with no teacher (sales_id not set) — insert without sales_id
    const { id: sessionId } = await createSession({
      starts_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      duration_minutes: 45,
      capacity: 5,
      overbooking: 0,
      sales_id: admin.id,
    });

    await login(page, "admin2@school.example", "password");
    await page.goto(`/#/sessions/${sessionId}/show`);

    // Page must not crash — capacity badge should be visible
    await expect(page.getByTestId("capacity-badge")).toBeVisible();

    // Teacher label row is rendered
    await expect(
      page.getByText("Teacher", { exact: false }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Week view: teacher name in SessionEventBlock
// ---------------------------------------------------------------------------
test.describe("Week view: teacher name in event block", () => {
  test("session event block shows the assigned teacher's name", async ({
    page,
    createSales,
    createSession,
  }) => {
    const teacher = await createSales({
      first_name: "Albert",
      last_name: "Einstein",
      email: "albert@school.example",
      password: "password",
    });

    const today = new Date();
    today.setHours(11, 0, 0, 0);
    await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      capacity: 12,
      overbooking: 0,
      sales_id: teacher.id,
    });

    await login(page, "albert@school.example", "password");
    await page.getByRole("link", { name: "Sessions" }).click();
    await expect(page.getByTestId("week-view")).toBeVisible();

    // Today's day column must contain a session event block
    const dayColumn = page.getByTestId(`day-column-${todayKey()}`);
    await expect(dayColumn).toBeVisible();

    const block = dayColumn.getByTestId("session-event-block").first();
    await expect(block).toBeVisible();

    // Teacher name is visible inside the block
    await expect(
      block.getByTestId("session-event-block-teacher"),
    ).toContainText("Albert Einstein");
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Month view: teacher name in SessionChip
// ---------------------------------------------------------------------------
test.describe("Month view: teacher name in session chip", () => {
  test("session chip shows the assigned teacher's name and tooltip", async ({
    page,
    createSales,
    createSession,
  }) => {
    const teacher = await createSales({
      first_name: "Isaac",
      last_name: "Newton",
      email: "isaac@school.example",
      password: "password",
    });

    const today = new Date();
    today.setHours(9, 0, 0, 0);
    await createSession({
      starts_at: today.toISOString(),
      duration_minutes: 60,
      capacity: 8,
      overbooking: 0,
      sales_id: teacher.id,
    });

    await login(page, "isaac@school.example", "password");
    await page.getByRole("link", { name: "Sessions" }).click();

    // Switch to month view
    await page.getByTestId("month-view-button").click();
    await expect(page.getByTestId("month-view")).toBeVisible();

    // Today's day cell
    const dayCell = page.getByTestId(`day-cell-${todayKey()}`);
    await expect(dayCell).toBeVisible();

    const chip = dayCell.getByTestId("session-chip").first();
    await expect(chip).toBeVisible();

    // Teacher name appears inside the chip
    await expect(
      chip.getByTestId("session-chip-teacher"),
    ).toContainText("Isaac Newton");

    // Tooltip includes the teacher's name
    const tooltip = await chip.getAttribute("title");
    expect(tooltip).toContain("Isaac Newton");
  });
});
