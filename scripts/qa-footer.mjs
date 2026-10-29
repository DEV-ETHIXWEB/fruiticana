// Footer QA: screenshots at breakpoints, horizontal overflow, WCAG contrast, link health.
import { chromium } from "playwright";
const base = process.env.QA_BASE || "http://localhost:4317";
const out = process.argv[2] || ".";
const browser = await chromium.launch();
for (const width of [1440, 1280, 768, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const footer = page.locator("footer");
  await footer.screenshot({ path: `${out}/footer-${width}.png` });
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth - doc.clientWidth;
    const f = document.querySelector("footer");
    // elements wider than the viewport inside footer
    const wide = [...f.querySelectorAll("*")].filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1).map((el) => el.tagName + "." + String(el.className).slice(0, 40)).slice(0, 5);
    const lum = (r, g, b) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    // Resolve any CSS colour (oklab, color-mix, rgb…) to sRGB by painting it on a canvas.
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    const parse = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "rgba(0,0,0,0)"; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data; return { r, g, b, a: a / 255 }; };
    const bg = { r: 10, g: 40, b: 25 }; // forest-deep
    const fails = [];
    for (const el of f.querySelectorAll("a, p, h2, h3, li, address, span, button")) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || el.closest("[aria-hidden=true]")) continue;
      const c = parse(cs.color);
      // resolve background: nearest opaque-ish bg, else forest-deep
      let b = bg, node = el;
      while (node && node !== f) { const bc = parse(getComputedStyle(node).backgroundColor); if (bc.a > 0.5) { b = bc; break; } node = node.parentElement; }
      const fg = { r: c.r * c.a + b.r * (1 - c.a), g: c.g * c.a + b.g * (1 - c.a), b: c.b * c.a + b.b * (1 - c.a) };
      const L1 = lum(fg.r, fg.g, fg.b), L2 = lum(b.r, b.g, b.b);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) fails.push(`${ratio.toFixed(2)} "${el.textContent.trim().slice(0, 40)}"`);
    }
    const links = [...new Set([...f.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href").split("#")[0]))];
    return { overflowX, wide, fails: [...new Set(fails)], links };
  });
  console.log(`\n== ${width}px  overflowX=${report.overflowX}  wide=${JSON.stringify(report.wide)}`);
  console.log("contrast fails:", report.fails.length ? report.fails : "none");
  if (errs.length) console.log("errors:", errs);
  if (width === 1440) {
    const bad = [];
    for (const l of report.links) { const r = await page.request.get(base + l); if (r.status() >= 400) bad.push(`${r.status()} ${l}`); }
    console.log(`links checked: ${report.links.length}, broken:`, bad.length ? bad : "none");
  }
  await page.close();
}
await browser.close();
