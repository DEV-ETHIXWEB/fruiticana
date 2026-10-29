// Full-page captures + grid-alignment audit.
// node scripts/qa-pages.mjs <outDir> <width> <route...>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [, , out, w, ...routes] = process.argv;
mkdirSync(out, { recursive: true });
const base = process.env.QA_BASE || "http://localhost:4317";
const width = Number(w);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height: 900 } });
for (const r of routes) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.text().slice(0, 220)));
  page.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 220)));
  await page.goto(base + r, { waitUntil: "load" });
  await page.waitForTimeout(800);
  // Scroll through so lazy images load and in-view reveals fire, then settle.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 450) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  // hide fixed header so it doesn't repeat over content in full-page captures
  await page.addStyleTag({ content: "header.fixed{position:absolute!important}" });
  const audit = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const containers = [...document.querySelectorAll(".container-x")].filter((c) => c.offsetParent);
    const edge = containers.length ? Math.round(containers[0].getBoundingClientRect().left + parseFloat(getComputedStyle(containers[0]).paddingLeft)) : 0;
    const off = [];
    for (const el of document.querySelectorAll("main h1, main h2, main .eyebrow")) {
      const r = el.getBoundingClientRect();
      if (!r.width || el.closest("[aria-hidden=true]")) continue;
      const centered = getComputedStyle(el).textAlign === "center" || el.classList.contains("justify-center");
      const left = Math.round(r.left);
      // inside a card/grid column is fine; flag only elements that sit *left of* the grid edge or overflow right
      if (left < edge - 2 || r.right > W - edge + 2 + (centered ? 0 : 400)) off.push(`${el.tagName}@${left} "${el.textContent.trim().slice(0, 40)}"`);
    }
    return { edge, overflow: document.documentElement.scrollWidth - W, off: off.slice(0, 8) };
  });
  const name = r === "/" ? "home" : r.replace(/^\//, "").replace(/[/?=]/g, "_");
  try {
    await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
  } catch {
    // Very tall pages: capture in viewport-height chunks instead.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < h; y += 4000, i++) {
      await page.screenshot({ path: `${out}/${name}-${width}-part${i}.png`, fullPage: true, clip: { x: 0, y, width, height: Math.min(4000, h - y) } });
    }
  }
  if (errs.length) console.log("   ", [...new Set(errs)].join("\n    "));
  console.log(`${r} edge=${audit.edge} overflow=${audit.overflow} ${audit.off.length ? "OFF: " + audit.off.join(" | ") : ""}`);
  await page.close();
}
await browser.close();
