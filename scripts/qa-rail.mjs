// Checks that the sticky language tab (right edge) never sits on top of a link, button or
// form field: on every sitemap page (both languages), at four viewports, scrolled top to bottom.
// Usage: node scripts/qa-rail.mjs   Env: QA_BASE (default http://localhost:4318)
import { chromium } from "playwright";

const base = process.env.QA_BASE || "http://localhost:4318";
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const viewports = [[1440, 900], [1280, 800], [768, 1024], [390, 844]];
const browser = await chromium.launch();
let total = 0;
for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    const hits = await page.evaluate(async () => {
      const rail = [...document.querySelectorAll("nav[data-qa-i18n-skip]")].find((n) => getComputedStyle(n).position === "fixed");
      if (!rail) return ["NO RAIL"];
      const found = new Set();
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.5) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
        const r = [...rail.querySelectorAll("a,span")].map((e) => e.getBoundingClientRect()).filter((b) => b.width && b.height).reduce((a, b) => ({ left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) }));
        for (const el of document.querySelectorAll("a[href],button,input,select,textarea,[role=button],iframe")) {
          if (rail.contains(el)) continue;
          const b = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!b.width || !b.height || cs.visibility === "hidden" || cs.display === "none") continue;
          // ignore anything clipped away by a scroll row (swipe carousels show the next card under the edge on purpose)
          const clip = el.closest("[class*='overflow-x'],[class*='snap-x']");
          if (clip) continue;
          const ox = Math.min(b.right, r.right) - Math.max(b.left, r.left);
          const oy = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
          // up to 4px may touch a full-width card's edge padding on phones (24px tab, 20px gutter)
          if (ox > 4 && oy > 2) found.add(`${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim().slice(0, 40)}" overlap ${Math.round(ox)}px`);
        }
      }
      return [...found];
    });
    if (hits.length) console.log(`${width} ${route}\n  ${hits.join("\n  ")}`);
    total += hits.length;
  }
  await page.close();
}
await browser.close();
console.log(`\n${routes.length} pages x ${viewports.length} viewports: ${total} overlaps`);
