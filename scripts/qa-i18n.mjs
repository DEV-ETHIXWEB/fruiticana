// Finds English left on Punjabi pages. Loads every /pa page in a real browser (menus opened,
// scrolled so lazy content renders) and reports Latin-script words in the visible text and in
// alt / title / aria-label / placeholder attributes, minus an allowlist of words that stay
// English on purpose: brand names, store names, street addresses, emails and the legal act title.
// Usage: node scripts/qa-i18n.mjs   Env: QA_BASE (default http://localhost:4318)
import { chromium } from "playwright";

const base = process.env.QA_BASE || "http://localhost:4318";

// Stays English by design (see src/i18n/GLOSSARY.md)
const allow = new Set(
  [
    // brands and products
    "Fruiticana", "Indican", "Rajan", "India", "SaY", "Global", "News", "BC", "YouTube", "Facebook", "Instagram", "Twitter", "X", "English", "PDF", "KB", "Esc",
    // the legal entity and act (official titles)
    "Produce", "Ltd", "Fighting", "Against", "Forced", "Labour", "and", "Child", "in", "Supply", "Chains", "Act",
    // the banner photographed on the first store (quoted in its image description)
    "Now", "Open", "Fresh", "Fruit", "Vegetables",
    // social handle in the Diljit Dosanjh quote
    "diljitdosanjh",
    // services named in the privacy policy and the delivery / WhatsApp links (proper names)
    "Vercel", "Web", "Analytics", "Mailchimp", "Resend", "Sanity", "OpenFreeMap", "OpenStreetMap", "WhatsApp", "Word", "MB",
    // units and abbreviations used with numbers
    "km", "m", "h", "k", "com",
  ].map((w) => w.toLowerCase()),
);

const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const enPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const paths = [...new Set(enPaths.map((p) => (p === "/pa" || p.startsWith("/pa/") ? p : p === "/" ? "/pa" : `/pa${p}`)))];

// Store names, streets, cities and postal codes stay as on signage and maps
const storeWords = await (async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`${base}/storefinder`, { waitUntil: "networkidle" });
  const text = await p.evaluate(() => [...document.querySelectorAll("a[href^='/storefinder/'], li, address")].map((e) => e.textContent).join(" "));
  await b.close();
  return new Set((text.match(/[A-Za-z][A-Za-z'.]*/g) || []).map((w) => w.toLowerCase()));
})();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let total = 0;
for (const path of paths) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  });
  for (const t of await page.locator("header nav [aria-expanded]").all()) await t.hover().catch(() => {});
  await page.waitForTimeout(300);
  const found = await page.evaluate(() => {
    const skip = (el) => el.closest(".maplibregl-ctrl-attrib, script, style, [data-qa-i18n-skip]");
    const chunks = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || skip(el) || !n.textContent.trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      chunks.push(n.textContent);
    }
    for (const el of document.querySelectorAll("[alt],[title],[aria-label],[placeholder]")) {
      if (skip(el)) continue;
      for (const a of ["alt", "title", "aria-label", "placeholder"]) if (el.getAttribute(a)) chunks.push(el.getAttribute(a));
    }
    chunks.push(document.title, document.querySelector('meta[name="description"]')?.content || "");
    return chunks;
  });
  const words = new Map();
  for (const chunk of found) {
    const clean = chunk.replace(/\S+@\S+/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b/g, " ");
    for (const m of clean.matchAll(/[A-Za-z][A-Za-z’']*/g)) {
      const w = m[0].replace(/[’']s$/, "");
      const lw = w.toLowerCase();
      if (allow.has(lw) || storeWords.has(lw)) continue;
      if (!words.has(w)) words.set(w, chunk.trim().slice(0, 90));
    }
  }
  if (words.size) {
    console.log(`\n${path}`);
    for (const [w, ctx] of words) console.log(`  ${w.padEnd(16)} … ${ctx}`);
  }
  total += words.size;
}
await browser.close();
console.log(`\n${paths.length} Punjabi pages scanned: ${total} unexpected English words`);
