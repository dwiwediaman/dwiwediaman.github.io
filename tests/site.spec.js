// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("node:path");

const fileUrl = "file://" + path.resolve(__dirname, "../index.html");

test.describe("Portfolio site — end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: "networkidle" });
  });

  test("loads with correct title and meta", async ({ page }) => {
    await expect(page).toHaveTitle(/Rahul Dwiwedi.*Technical Lead/);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toContain("Technical Lead");
  });

  test("hero renders core copy and CTAs", async ({ page }) => {
    await expect(page.locator("h1.hero-title")).toContainText("AI systems for the");
    await expect(page.locator(".hero-cta a", { hasText: "View Featured Work" })).toBeVisible();
    await expect(page.locator(".hero-cta a", { hasText: "Get in Touch" })).toBeVisible();
    await expect(page.locator(".hero-panel")).toBeVisible();
    await expect(page.locator(".hero-panel")).toContainText("Technical Lead");
    await expect(page.locator(".hero-panel")).toContainText("Decisionpoint");
  });

  test("nav links are present and resolve to in-page sections", async ({ page }) => {
    const links = ["Work", "Projects", "Deep Dive", "About", "Contact"];
    for (const text of links) {
      const link = page.locator(".nav-links a", { hasText: text }).first();
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^#/);
      const target = await page.locator(href).count();
      expect(target).toBe(1);
    }
  });

  test("featured work shows both flagship platforms with diagrams", async ({ page }) => {
    const features = page.locator(".feature");
    await expect(features).toHaveCount(2);
    await expect(page.locator(".feature-title", { hasText: "Deep Research" })).toBeVisible();
    await expect(page.locator(".feature-title", { hasText: "BeagleGPT" })).toBeVisible();
    // Architecture diagrams render
    const archSvgs = page.locator(".arch-svg");
    await expect(archSvgs).toHaveCount(2);
    // Both diagrams have arrow markers wired to the global <defs>
    const arrowMarkers = page.locator('line[marker-end="url(#arrow)"]');
    expect(await arrowMarkers.count()).toBeGreaterThan(10);
  });

  test("personal projects bento renders all three", async ({ page }) => {
    const cards = page.locator("#projects .card");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText("NSE Trading Agent");
    await expect(cards.nth(1)).toContainText("Dream11 IPL Optimizer");
    await expect(cards.nth(2)).toContainText("Shabd");
  });

  test("technical deep dive shows YAML and notes", async ({ page }) => {
    await expect(page.locator(".code-block .code-file")).toContainText("sell_out_analytics.yaml");
    await expect(page.locator(".code-body")).toContainText("framework");
    await expect(page.locator(".dive-notes h4")).toContainText("config-as-contract");
    const items = page.locator(".dive-list li");
    await expect(items).toHaveCount(4);
  });

  test("about/stack section renders 4 stack groups", async ({ page }) => {
    const groups = page.locator(".ts-group");
    await expect(groups).toHaveCount(4);
  });

  test("contact CTA exposes email mailto link", async ({ page }) => {
    const mailto = page.locator('a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible();
    expect(await mailto.getAttribute("href")).toBe("mailto:rahul.dwiwedi@decisionpoint.in");
  });

  test("role title is consistent across the page (Technical Lead, no Lead Architect)", async ({ page }) => {
    const html = await page.content();
    expect(html).not.toContain("Lead Architect");
    const roleMentions = await page.locator("text=Technical Lead").count();
    expect(roleMentions).toBeGreaterThanOrEqual(3);
  });

  test("ALL major sections are visible (no IntersectionObserver invisibility regression)", async ({ page }) => {
    const sections = ["#work", "#projects", "#deep-dive", "#about", "#contact"];
    for (const sel of sections) {
      const el = page.locator(sel);
      await expect(el).toBeVisible();
      const opacity = await el.evaluate((node) => getComputedStyle(node).opacity);
      expect(Number.parseFloat(opacity)).toBe(1);
    }
  });

  test("theme toggle switches data-theme and persists in localStorage", async ({ page }) => {
    const root = page.locator("html");
    await expect(root).not.toHaveAttribute("data-theme", "light");

    await page.locator("#themeToggle").click();
    await expect(root).toHaveAttribute("data-theme", "light");
    const stored = await page.evaluate(() => localStorage.getItem("rd-portfolio-theme"));
    expect(stored).toBe("light");

    await page.locator("#themeToggle").click();
    await expect(root).not.toHaveAttribute("data-theme", "light");
    const stored2 = await page.evaluate(() => localStorage.getItem("rd-portfolio-theme"));
    expect(stored2).toBe("dark");
  });

  test("nav anchor scroll lands on intended section", async ({ page, isMobile }) => {
    test.skip(isMobile, "nav-links collapse on mobile by design");
    await page.locator(".nav-links a", { hasText: "Projects" }).click();
    await page.waitForTimeout(700); // smooth scroll
    const visible = await page.locator("#projects").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(visible).toBe(true);
  });

  test("status pill shows Available", async ({ page }) => {
    await expect(page.locator(".status-pill")).toContainText("Available");
  });

  test("year stamp updates dynamically", async ({ page }) => {
    const year = await page.locator("#year").innerText();
    expect(Number.parseInt(year, 10)).toBeGreaterThanOrEqual(new Date().getFullYear());
  });

  test("no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.reload({ waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });

  test("renders without horizontal overflow", async ({ page }) => {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

test.describe("Mobile viewport behavior", () => {
  test("nav-links collapse but brand and theme toggle remain", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only assertion");
    await page.goto(fileUrl, { waitUntil: "networkidle" });
    await expect(page.locator(".nav .brand-mark")).toBeVisible();
    await expect(page.locator("#themeToggle")).toBeVisible();
    const navLinksHidden = await page.locator(".nav-links").evaluate(
      (el) => getComputedStyle(el).display === "none"
    );
    expect(navLinksHidden).toBe(true);
  });

  test("featured cards stack vertically", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only assertion");
    await page.goto(fileUrl, { waitUntil: "networkidle" });
    const cols = await page.locator(".feature-grid").first().evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    expect(cols.split(" ").length).toBe(1);
  });
});
