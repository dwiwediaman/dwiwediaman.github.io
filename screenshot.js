const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const url = "file://" + path.resolve(__dirname, "index.html");
const outDir = path.resolve(__dirname, "screenshots");
const tag = process.argv[2] || "current";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      colorScheme: "dark",
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    // Scroll through the full page so any IntersectionObserver / lazy
    // content has triggered before the fullPage capture.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = 400;
        const id = setInterval(() => {
          window.scrollTo(0, y);
          y += step;
          if (y >= document.body.scrollHeight) {
            clearInterval(id);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 60);
      });
    });
    await page.waitForTimeout(600);
    const file = path.join(outDir, `${tag}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("saved:", file);
    await ctx.close();
  }
  await browser.close();
})();
