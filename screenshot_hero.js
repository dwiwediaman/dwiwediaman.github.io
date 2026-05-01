const { chromium } = require("playwright");
const path = require("path");
const url = "file://" + path.resolve(__dirname, "index.html");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.resolve(__dirname, "screenshots/v2-hero-fold.png"),
    fullPage: false,
  });
  console.log("hero fold saved");
  await browser.close();
})();
