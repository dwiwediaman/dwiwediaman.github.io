# dwiwediaman.github.io

Personal portfolio site for **Rahul Dwiwedi** — Technical Lead, AI Systems.
Live at **https://dwiwediaman.github.io/**.

Vanilla HTML / CSS / JS — no build step, no framework, no bundler.
Aesthetic: monochrome with a single high-signal accent. Typography: Inter + JetBrains Mono.

## Run locally

Open `index.html` directly in a browser, or:

```bash
npx serve .
```

## Tests

End-to-end suite via Playwright (Chromium desktop + mobile viewports):

```bash
npm install
npx playwright install chromium
npm test
```

18 specs covering page load, navigation, theme toggle, accessibility, responsive
collapse, and section-visibility regressions. ~33 assertions across both
viewports.

## Screenshots

```bash
npm run screenshots
```

Outputs full-page captures at desktop / tablet / mobile to `screenshots/`.

## Deploy (GitHub Pages)

Pages auto-publishes any repo named `<username>.github.io` at the apex URL —
no workflow file, no settings change required. Push to `main` and the site
goes live in ~30 seconds.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Markup: hero, featured work, projects, deep dive, about, contact |
| `styles.css` | Theme tokens, layout, components — single file |
| `script.js` | Year stamp + theme toggle persistence |
| `tests/site.spec.js` | Playwright E2E suite |
| `playwright.config.js` | Test runner config |
| `screenshot.js` | Visual capture helper |
