// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("node:path");

const fileUrl = "file://" + path.resolve(__dirname, "../index.html");

test.describe("Portfolio site — end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    // Pin colorScheme + storage so the FOUC-prevention <head> script is
    // deterministic across runs — otherwise prefers-color-scheme: light on
    // some CI runners would land us in light mode unexpectedly.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => {
      try { localStorage.removeItem("rd-portfolio-theme"); } catch { /* */ }
    });
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
    await expect(page.locator(".hero-panel")).toContainText("Decision Point");
    await expect(page.locator(".hero-panel")).toContainText("LatentView");
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

  test("featured work shows BeagleGPT flagship with two named capabilities", async ({ page }) => {
    // BeagleGPT is the platform (named in section header), with two capability cards
    const features = page.locator(".feature");
    await expect(features).toHaveCount(2);
    await expect(page.locator(".feature-title", { hasText: "Deep Research" })).toBeVisible();
    await expect(page.locator(".feature-title", { hasText: "Conversational Copilot" })).toBeVisible();
    // Section header names BeagleGPT explicitly
    await expect(page.locator("#work .section-title")).toContainText("BeagleGPT");
    // Architecture diagrams render with arrow markers from global defs
    const archSvgs = page.locator(".arch-svg");
    await expect(archSvgs).toHaveCount(2);
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

  test("technical deep dive shows generic YAML example with illustrative marker", async ({ page }) => {
    const file = page.locator(".code-block .code-file");
    await expect(file).toContainText(/\.yaml$/);
    await expect(file).toContainText(/example|illustrative|retail/i);
    await expect(page.locator(".code-block .code-lang")).toContainText(/ILLUSTRATIVE|YAML/i);
    await expect(page.locator(".code-body")).toContainText("framework");
    await expect(page.locator(".dive-notes h4")).toContainText("config-as-contract");
    const items = page.locator(".dive-list li");
    await expect(items).toHaveCount(4);
  });

  test("YAML example contains no employer-specific identifiers", async ({ page }) => {
    const code = await page.locator(".code-body").innerText();
    // Internal references must not leak into the public sample
    expect(code).not.toMatch(/decisionpoint|@decisionpoint|sell_out_analytics|\.v\d+\.j2/i);
  });

  test("about/stack section renders 4 stack groups", async ({ page }) => {
    const groups = page.locator(".ts-group");
    await expect(groups).toHaveCount(4);
  });

  test("contact CTA exposes personal email mailto link (not work email)", async ({ page }) => {
    const mailto = page.locator('a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible();
    expect(await mailto.getAttribute("href")).toBe("mailto:dwiwediaman@gmail.com");
    // Work email must NOT appear anywhere on the live page
    const html = await page.content();
    expect(html).not.toContain("rahul.dwiwedi@decisionpoint.in");
  });

  test("external profile links resolve to specific profiles, not vendor homepages", async ({ page }) => {
    const linkedIn = await page.locator('a[href*="linkedin.com"]').first().getAttribute("href");
    const gitHub = await page.locator('a[href*="github.com"]').first().getAttribute("href");
    expect(linkedIn).toMatch(/linkedin\.com\/in\//);
    expect(linkedIn).not.toBe("https://www.linkedin.com/");
    expect(gitHub).toMatch(/github\.com\/[\w-]+/);
    expect(gitHub).not.toBe("https://github.com/");
  });

  test("OpenGraph + Twitter card meta is wired correctly", async ({ page }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    const twCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(ogImage).toMatch(/og-image\.png$/);
    expect(ogUrl).toBe("https://dwiwediaman.github.io/");
    expect(twCard).toBe("summary_large_image");
  });

  test("favicon and structured data are present", async ({ page }) => {
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const parsed = JSON.parse(ld);
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Rahul Dwiwedi");
    expect(parsed.sameAs).toContain("https://github.com/dwiwediaman");
  });

  test("skip-to-content link exists and targets main", async ({ page }) => {
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveCount(1);
    expect(await skip.getAttribute("href")).toBe("#top");
  });

  test("theme toggle exposes aria-pressed state", async ({ page }) => {
    const btn = page.locator("#themeToggle");
    await expect(btn).toHaveAttribute("aria-pressed", /true|false/);
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

  test("status pill signals availability", async ({ page }) => {
    await expect(page.locator(".status-pill")).toContainText(/Open|Available/i);
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
