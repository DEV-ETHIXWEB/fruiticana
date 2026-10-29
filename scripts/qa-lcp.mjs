// Real first-load LCP per route (no scrolling): element, whether it was lazy, time.
import { chromium } from "playwright";
const base = process.env.QA_BASE || "http://localhost:4317";
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
  for (const r of process.argv.slice(2)) {
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__lcp = null;
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__lcp = e; }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(base + r, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const res = await page.evaluate(() => {
      const e = window.__lcp; if (!e) return "none";
      const el = e.element; const img = el?.tagName === "IMG" ? el : null;
      return `${Math.round(e.startTime)}ms ${el?.tagName} ${img ? (img.getAttribute("loading") || "eager") + " " + decodeURIComponent(img.currentSrc.split("url=")[1]?.split("&")[0] ?? img.currentSrc).slice(0, 60) : (el?.textContent || "").trim().slice(0, 50)}`;
    });
    console.log(`${width} ${r.padEnd(40)} ${res}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
