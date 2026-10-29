// Visit every route at desktop + mobile; report console errors, failed requests, overflow, missing h1/meta.
import { chromium } from "playwright";
const base = process.env.QA_BASE || "http://localhost:4317";
const routes = process.argv.slice(2);
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  for (const r of routes) {
    const page = await ctx.newPage();
    const issues = [];
    page.on("pageerror", (e) => issues.push("pageerror: " + e.message.slice(0, 160)));
    page.on("console", (m) => m.type() === "error" && issues.push("console: " + m.text().slice(0, 160)));
    page.on("response", (res) => res.status() >= 400 && !res.url().includes("favicon") && issues.push(`${res.status()} ${res.url().slice(0, 120)}`));
    const resp = await page.goto(base + r, { waitUntil: r.startsWith("/storefinder") ? "load" : "networkidle", timeout: 60000 }).catch((e) => (issues.push("goto: " + e.message), null));
    await page.waitForTimeout(r.startsWith("/storefinder") ? 3000 : 400);
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content?.length ?? 0,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      dashes: (document.body.innerText.match(/[\u2014\u2013]/g) || []).length,
      imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    }));
    const flags = [];
    if (info.h1 !== 1) flags.push(`h1=${info.h1}`);
    if (info.desc < 50 || info.desc > 170) flags.push(`desc=${info.desc}`);
    if (info.overflow > 0) flags.push(`overflowX=${info.overflow}`);
    if (info.dashes) flags.push(`dashes=${info.dashes}`);
    if (info.imgsNoAlt) flags.push(`imgNoAlt=${info.imgsNoAlt}`);
    if (width === 1440) console.log(`${resp?.status() ?? "ERR"} ${r} | ${info.title.length}c "${info.title.slice(0, 70)}" ${flags.join(" ")}`);
    else if (flags.length || issues.length) console.log(`  [390] ${r} ${flags.join(" ")}`);
    if (issues.length) console.log("   ", [...new Set(issues)].join("\n    "));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
