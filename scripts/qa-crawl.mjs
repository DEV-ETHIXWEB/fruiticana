// Crawls every sitemap page (plus the 404 page) at desktop and phone size and reports console errors,
// failed requests (4xx/5xx), images that did not load, and internal links that do not resolve.
// Usage: node scripts/qa-crawl.mjs   Env: QA_BASE (default http://localhost:4318)
import { chromium } from "playwright";

const base = process.env.QA_BASE || "http://localhost:4318";
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
routes.push("/this-page-does-not-exist");

const browser = await chromium.launch();
const links = new Set();
const problems = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  let route = "";
  page.on("console", (m) => m.type() === "error" && problems.push(`${w} ${route} CONSOLE ${m.text().slice(0, 160)}`));
  page.on("pageerror", (e) => problems.push(`${w} ${route} PAGEERROR ${e.message.slice(0, 160)}`));
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(base) && !(route === "/this-page-does-not-exist" && r.status() === 404 && u.endsWith(route)))
      problems.push(`${w} ${route} HTTP ${r.status()} ${u.replace(base, "")}`);
  });
  page.on("requestfailed", (r) => {
    const f = r.failure()?.errorText || "";
    if (!/ERR_ABORTED|NS_BINDING_ABORTED/.test(f)) problems.push(`${w} ${route} FAILED ${f} ${r.url().slice(0, 120)}`);
  });
  for (route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
    });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => ({
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.currentSrc || i.src),
      hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      h1: document.querySelectorAll("h1").length,
      noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    }));
    r.broken.forEach((b) => problems.push(`${w} ${route} BROKEN-IMG ${b}`));
    if (r.h1 !== 1) problems.push(`${w} ${route} H1-COUNT ${r.h1}`);
    if (r.noAlt) problems.push(`${w} ${route} IMG-NO-ALT ${r.noAlt}`);
    r.hrefs.filter((x) => x && x.startsWith("/") && !x.startsWith("//")).forEach((x) => links.add(x.split("#")[0]));
  }
  await page.close();
}
await browser.close();
for (const l of links) {
  const res = await fetch(base + l, { redirect: "manual" });
  if (res.status >= 400) problems.push(`LINK ${res.status} ${l}`);
}
console.log([...new Set(problems)].join("\n") || "no problems");
console.log(`\n${routes.length} pages x 2 viewports, ${links.size} internal links checked, ${new Set(problems).size} problems`);
