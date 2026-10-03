import { test, expect } from "@playwright/test";

test("SYS-01 & SYS-02: sign up, answer the questionnaire and get a recommendation", async ({ page }) => {
  // 1. sign up a brand-new user
  await page.goto("/sign-up");
  await page.getByPlaceholder("Your name").fill("E2E Journey User");
  await page.getByPlaceholder("you@example.com").fill(`e2e-journey-${Date.now()}@example.com`);
  await page.getByPlaceholder("••••••••").fill("Yoga@12345");
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

  // 2. open the questionnaire and choose a goal
  await page.goto("/questionnaire");
  await page.getByRole("button", { name: /back pain/i }).click();

  // 3. SYS-02: trying to continue without an answer shows an error
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText("Please choose an answer to continue.")).toBeVisible();

  // 4. answer every question
  const answers = ["Lower back", "Mild, comes and goes", "I'm a complete beginner", "10–15 minutes", "Gentle and slow"];
  for (const [i, answer] of answers.entries()) {
    await page.getByRole("button", { name: answer }).click();
    const last = i === answers.length - 1;
    await page.getByRole("button", { name: last ? "Submit" : "Next →" }).click();
  }

  // 5. the result page shows the expected recommendation
  await expect(page).toHaveURL(/\/result\//);
     await expect(page.getByRole("heading", { name: /We recommend:.*Therapeutic Yoga/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Poses for your routine" })).toBeVisible();
});
