import { test, expect } from "@playwright/test";

test.describe("Authentication & access control", () => {
  test("SYS-04: logged-out users are sent to sign-in when opening the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  });

  test("UT-05: wrong password shows an error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByPlaceholder("you@example.com").fill("nobody@example.com");
    await page.getByPlaceholder("••••••••").fill("WrongPass@123");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("UT-02: sign-up is blocked with a weak password", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByPlaceholder("Your name").fill("Weak Password User");
    await page.getByPlaceholder("you@example.com").fill(`weak-${Date.now()}@example.com`);
    await page.getByPlaceholder("••••••••").fill("12345678");
    await page.getByRole("button", { name: "Create an account" }).click();
    await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("Security: a normal user cannot open the admin panel", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByPlaceholder("Your name").fill("E2E Normal User");
    await page.getByPlaceholder("you@example.com").fill(`e2e-user-${Date.now()}@example.com`);
    await page.getByPlaceholder("••••••••").fill("Yoga@12345");
    await page.getByRole("button", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
  });
});
