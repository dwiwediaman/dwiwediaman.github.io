const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const liveUrl = "https://dwiwediaman.github.io/";
const outDir = path.resolve(__dirname, "screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet",  width: 834,  height: 1112 },
  { name: "mobile",  width: 390,  height: 844 },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

    const start = Date.now();
    await page.goto(liveUrl, { waitUntil: "networkidle", timeout: 30000 });
    const loadMs = Date.now() - start;

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const id = setInterval(() => {
          window.scrollTo(0, y);
          y += 400;
          if (y >= document.body.scrollHeight) {
            clearInterval(id);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 60);
      });
    });
    await page.waitForTimeout(600);

    // fold
    await page.screenshot({
      path: path.join(outDir, `live-${vp.name}-fold.png`),
      fullPage: false,
    });
    // full
    await page.screenshot({
      path: path.join(outDir, `live-${vp.name}-full.png`),
      fullPage: true,
    });

    if (vp.name === "desktop") {
      // dump page content & metrics for review
      const dump = await page.evaluate(() => ({
        title: document.title,
        meta: {
          description: document.querySelector('meta[name="description"]')?.content,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content,
          ogDescription: document.querySelector('meta[property="og:description"]')?.content,
        },
        sections: Array.from(document.querySelectorAll("section")).map((s) => ({
          id: s.id || "(none)",
          headingText: s.querySelector("h2, h1")?.innerText.trim().slice(0, 120) || null,
          paragraphCount: s.querySelectorAll("p").length,
          height: Math.round(s.getBoundingClientRect().height),
        })),
        textContent: document.body.innerText,
        navLinks: Array.from(document.querySelectorAll(".nav-links a")).map((a) => ({
          text: a.innerText.trim(),
          href: a.getAttribute("href"),
        })),
        externalLinks: Array.from(document.querySelectorAll('a[href^="http"], a[href^="mailto"]')).map((a) => ({
          text: a.innerText.trim().slice(0, 60),
          href: a.href,
        })),
      }));
      fs.writeFileSync(
        path.join(outDir, "live-dump.json"),
        JSON.stringify(dump, null, 2)
      );
    }

    console.log(JSON.stringify({
      viewport: vp.name,
      loadMs,
      errors,
    }));
    await ctx.close();
  }
  await browser.close();
})();
