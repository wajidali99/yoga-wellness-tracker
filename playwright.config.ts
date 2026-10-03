import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000, // the database is far away (us-east-2), so give pages time
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1, // one test at a time (the database is far away)
  retries: 1, // retry once if the network hiccups
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // starts the app automatically (or reuses it if already running)
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
