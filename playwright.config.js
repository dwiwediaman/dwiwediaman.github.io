// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const path = require("node:path");

const fileUrl = "file://" + path.resolve(__dirname, "index.html");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: fileUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "chromium-mobile",
      // iPhone 13 viewport but keep Chromium engine so we don't need WebKit installed.
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile/15E148 Safari/537.36",
      },
    },
  ],
});
