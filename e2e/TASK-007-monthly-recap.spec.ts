import { createClient } from "@supabase/supabase-js";
import { test, expect } from "./fixtures";

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54341",
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

test.describe("Monthly Recap dashboard widget", () => {
  test("recap reflects an attended session for a student in the selected month", async ({
    page,
    createUser,
    createContact,
  }) => {
    // Arrange: create a teacher user and a student contact
    const teacher = await createUser({
      email: "teacher-recap@school.example",
      password: "password",
    });

    const student = await createContact({
      first_name: "Recap",
      last_name: "Student",
      sales_id: teacher.id,
    });

    // Create a session in the current month
    const now = new Date();
    const sessionStartsAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      15,
      10,
      0,
      0,
    );

    const { data: session, error: sessionError } = await adminSupabase
      .from("sessions")
      .insert({
        starts_at: sessionStartsAt.toISOString(),
        duration_minutes: 60,
        capacity: 15,
        overbooking: 2,
        sales_id: teacher.id,
      })
      .select("id")
      .single();

    if (sessionError) {
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    // Create an attended booking for the student
    const { error: bookingError } = await adminSupabase
      .from("bookings")
      .insert({
        session_id: session.id,
        contact_id: student.id,
        type: "single",
        status: "attended",
        sales_id: teacher.id,
      });

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Log in as teacher
    await page.goto("http://localhost:5175/");
    await page.getByLabel("Email").fill("teacher-recap@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForLoadState("networkidle");

    // Navigate to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForLoadState("networkidle");

    // The Monthly Recap widget must be visible
    await expect(
      page.getByRole("heading", { name: /Monthly Recap/i }),
    ).toBeVisible();

    // The month picker should default to the current month
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthPicker = page.getByLabel(/Month/i);
    await expect(monthPicker).toHaveValue(currentYearMonth);

    // The student's row must appear with sessions_attended = 1
    await expect(page.getByText(/Recap Student/i)).toBeVisible();
    await expect(page.getByTestId("monthly-recap-row").first()).toBeVisible();
    await expect(
      page.getByTestId("sessions-attended").first(),
    ).toHaveText("1");

    // Clean up sessions (not covered by resetDb which only resets the TABLES list)
    await adminSupabase
      .from("sessions")
      .delete()
      .eq("id", session.id);
  });

  test("recap shows empty state when no attended sessions in selected month", async ({
    page,
    createUser,
  }) => {
    // Arrange: create a user with no attended sessions
    await createUser({
      email: "teacher-empty@school.example",
      password: "password",
    });

    await page.goto("http://localhost:5175/");
    await page.getByLabel("Email").fill("teacher-empty@school.example");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForLoadState("networkidle");

    // Navigate to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForLoadState("networkidle");

    // Widget renders
    await expect(
      page.getByRole("heading", { name: /Monthly Recap/i }),
    ).toBeVisible();

    // Pick a month far in the past to guarantee no attendance data
    const monthPicker = page.getByLabel(/Month/i);
    await monthPicker.fill("2000-01");

    // Empty state message should appear
    await expect(page.getByTestId("monthly-recap-empty")).toBeVisible();
  });
});
