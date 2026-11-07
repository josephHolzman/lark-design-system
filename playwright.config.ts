import { defineConfig, devices } from "@playwright/test";

/*
  Lark 0.7 browser checks: the width matrix and axe (with colour contrast) on the example pages.
  Runs against `next dev` on port 3107. Chrome: set PW_CHROME to a Chrome/Chromium binary, or run
  `npx playwright install chromium` once.
*/
export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3107",
    ...devices["Desktop Chrome"],
    launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : undefined,
  },
  webServer: {
    command: "npx next dev -p 3107",
    url: "http://localhost:3107/examples/foundations",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
