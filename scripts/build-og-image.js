// Generate og-image.png (1200x630) — a self-contained branded social card.
// Independent from index.html so we control composition exactly.
const { chromium } = require("playwright");
const path = require("node:path");

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: Inter, system-ui, sans-serif;
    color: #f4f5f7;
    background: #08090b;
    background-image:
      linear-gradient(to right, #1d1f27 1px, transparent 1px),
      linear-gradient(to bottom, #1d1f27 1px, transparent 1px);
    background-size: 80px 80px;
    position: relative;
    padding: 70px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .glow {
    position: absolute;
    top: -200px; left: 50%;
    width: 900px; height: 900px;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(255,91,26,0.18), transparent 60%);
    pointer-events: none;
  }
  .top { display: flex; align-items: center; gap: 16px; position: relative; }
  .mark {
    width: 56px; height: 56px;
    background: #f4f5f7; color: #08090b;
    display: grid; place-items: center;
    border-radius: 12px;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700; font-size: 20px;
    letter-spacing: -0.02em;
  }
  .meta {
    display: flex; flex-direction: column; gap: 2px;
  }
  .name { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
  .role {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px; color: #6b6f7c; letter-spacing: 0.04em;
  }
  .pill {
    margin-left: auto;
    border: 1px solid #2a2d38;
    background: #11121a;
    border-radius: 999px;
    padding: 8px 14px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: #a1a4af;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: #3ddc97; }
  .center { position: relative; max-width: 1040px; }
  .eyebrow {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    color: #6b6f7c;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 24px;
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .eyebrow::before {
    content: "";
    display: inline-block;
    width: 36px; height: 1px;
    background: #ff5b1a;
  }
  h1 {
    font-size: 84px;
    line-height: 1.0;
    font-weight: 800;
    letter-spacing: -0.035em;
  }
  h1 em {
    font-style: normal;
    position: relative;
    white-space: nowrap;
  }
  h1 em::after {
    content: "";
    position: absolute;
    left: 0; right: 0;
    bottom: 6px;
    height: 16px;
    background: #ff5b1a;
    z-index: -1;
    opacity: 0.85;
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    position: relative;
  }
  .url {
    font-family: "JetBrains Mono", monospace;
    font-size: 16px;
    color: #a1a4af;
  }
  .tags {
    display: flex; gap: 8px;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .tag {
    border: 1px solid #2a2d38;
    background: #11121a;
    color: #a1a4af;
    padding: 6px 11px;
    border-radius: 6px;
  }
</style></head>
<body>
  <div class="glow"></div>

  <div class="top">
    <div class="mark">RD</div>
    <div class="meta">
      <div class="name">Rahul Dwiwedi</div>
      <div class="role">Technical Lead · Decision Point (a LatentView company)</div>
    </div>
    <div class="pill"><span class="dot"></span>Open to inquiries</div>
  </div>

  <div class="center">
    <div class="eyebrow">Portfolio</div>
    <h1>Architecting <em>BeagleGPT</em><br/>for the Fortune 500 CPG enterprise.</h1>
  </div>

  <div class="bottom">
    <div class="url">dwiwediaman.github.io</div>
    <div class="tags">
      <span class="tag">GenAI Knowledge Assistant</span>
      <span class="tag">Azure Databricks</span>
      <span class="tag">RAG · Eval</span>
    </div>
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const out = path.resolve(__dirname, "..", "og-image.png");
  await page.screenshot({ path: out, type: "png", fullPage: false, omitBackground: false });
  console.log("og-image saved:", out);
  await browser.close();
})();
