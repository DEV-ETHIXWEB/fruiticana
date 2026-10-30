// Section-level layout QA.
//   node scripts/qa-sections.mjs <route> [outDir]
// For each viewport: every top-level <section> in <main> is checked for
//  - FIT:      taller than the visible viewport (below the fixed header)
//  - OVERLAP:  text/controls colliding with other text/controls
//  - CLIP:     text cut by an overflow-hidden ancestor, or ellipsis-truncated
//  - BIGIMG:   an image taller than 80% of the viewport
//  - OFFSCREEN: anything poking past the viewport edge
// Screenshots of each section are written to outDir for visual review.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const route = process.argv[2] || "/";
const out = process.argv[3];
if (out) mkdirSync(out, { recursive: true });
const base = process.env.QA_BASE || "http://localhost:4317";
const viewports = (process.env.QA_VIEWPORTS || "1440x900,1280x800,1024x768,768x1024,390x844")
  .split(",")
  .map((v) => v.split("x").map(Number));

const browser = await chromium.launch();
let total = 0;
for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message.slice(0, 160)));
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const report = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const VH = window.innerHeight;
    const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const usable = VH - header;
    const abs = (r) => ({ l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY, w: r.width, h: r.height });
    const visible = (el) => {
      if (el.closest("[aria-hidden=true],.sr-only,[hidden]")) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const textEls = (root) =>
      [...root.querySelectorAll("h1,h2,h3,h4,p,a,button,label,li,span,dt,dd,time,figcaption,blockquote")].filter(
        (el) => visible(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1),
      );
    const sections = [...document.querySelectorAll("main > section, main > div > section, main > article, footer")].filter(visible);
    const results = [];
    sections.forEach((sec, si) => {
      const sr = abs(sec.getBoundingClientRect());
      const label = (sec.querySelector("h1,h2,.eyebrow,[aria-label]")?.textContent || sec.getAttribute("aria-label") || sec.tagName).trim().slice(0, 40);
      const issues = [];
      // The first section sits under the transparent fixed header, so its budget is the full viewport.
      const budget = si === 0 ? VH : usable;
      if (sec.tagName !== "FOOTER" && sr.h > budget + 4) issues.push(`FIT ${Math.round(sr.h)}px > ${Math.round(budget)}px usable`);
      const els = textEls(sec);
      // OVERLAP: pairwise between leaf text boxes not in an ancestor relationship
      for (let i = 0; i < els.length; i++) {
        for (let j = i + 1; j < els.length; j++) {
          const a = els[i], b = els[j];
          if (a.contains(b) || b.contains(a)) continue;
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 3 && oy > 3) issues.push(`OVERLAP "${a.textContent.trim().slice(0, 28)}" x "${b.textContent.trim().slice(0, 28)}"`);
        }
      }
      // CLIP: text outside an overflow-clipping ancestor, or ellipsis truncation
      const inSwipe = (el) => { let p = el.parentElement; while (p && p !== sec) { if (/auto|scroll/.test(getComputedStyle(p).overflowX)) return true; p = p.parentElement; } return false; };
      for (const el of els) {
        if (inSwipe(el)) continue;
        const cs = getComputedStyle(el);
        if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) issues.push(`CLIP-ellipsis "${el.textContent.trim().slice(0, 40)}"`);
        if (cs.webkitLineClamp && cs.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 2) issues.push(`CLIP-lineclamp "${el.textContent.trim().slice(0, 40)}"`);
        const r = el.getBoundingClientRect();
        let p = el.parentElement;
        while (p && p !== document.body) {
          const pcs = getComputedStyle(p);
          if (/(hidden|clip)/.test(pcs.overflowX + pcs.overflowY) && !p.classList.contains("mask-fade-x") && !/auto|scroll/.test(pcs.overflowX)) {
            const pr = p.getBoundingClientRect();
            if (r.left < pr.left - 2 || r.right > pr.right + 2 || r.top < pr.top - 2 || r.bottom > pr.bottom + 2) {
              issues.push(`CLIP "${el.textContent.trim().slice(0, 40)}"`);
            }
            break;
          }
          p = p.parentElement;
        }
        if (r.right > W + 1 || r.left < -1) issues.push(`OFFSCREEN "${el.textContent.trim().slice(0, 40)}"`);
      }
      // Image partially covering text (full-bleed backgrounds that fully contain the text are intentional)
      const imgs = [...sec.querySelectorAll("img")].filter(visible);
      for (const el of els) {
        if (inSwipe(el)) continue;
        const r = el.getBoundingClientRect();
        for (const img of imgs) {
          if (img.contains(el) || el.contains(img)) continue;
          const frame = (img.closest("a,figure,[class*=absolute]") ?? img).getBoundingClientRect();
          const ox = Math.min(r.right, frame.right) - Math.max(r.left, frame.left);
          const oy = Math.min(r.bottom, frame.bottom) - Math.max(r.top, frame.top);
          const covers = frame.left <= r.left + 1 && frame.right >= r.right - 1 && frame.top <= r.top + 1 && frame.bottom >= r.bottom - 1;
          if (ox > 4 && oy > 4 && !covers) {
            // Ask the browser what actually paints on top in the overlap area
            const cy = Math.max(r.top, frame.top) + oy / 2;
            if (cy < 0 || cy > innerHeight) el.scrollIntoView({ block: "center" });
            const rr = el.getBoundingClientRect(), fr = (img.closest("a,figure,[class*=absolute]") ?? img).getBoundingClientRect();
            const px = Math.max(rr.left, fr.left) + ox / 2, py = Math.max(rr.top, fr.top) + oy / 2;
            const top = document.elementFromPoint(px, py);
            const imgBox = img.closest("a,figure,[class*=absolute]") ?? img;
            if (top && !el.contains(top) && !top.contains(el) && (imgBox.contains(top) || top === img)) {
              issues.push(`IMG-OVER-TEXT "${el.textContent.trim().slice(0, 30)}" by ${(img.alt || "image").slice(0, 25)}`);
            }
          }
        }
      }
      // Placeholder text wider than its input (e.g. "Your ema")
      const cv = document.createElement("canvas").getContext("2d");
      for (const inp of sec.querySelectorAll("input[placeholder], textarea[placeholder]")) {
        if (!visible(inp)) continue;
        const cs = getComputedStyle(inp);
        cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const room = inp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        if (cv.measureText(inp.placeholder).width > room + 1) issues.push(`CLIP-placeholder "${inp.placeholder}" (${Math.round(room)}px room)`);
      }
      for (const img of sec.querySelectorAll("img, video, iframe")) {
        if (!visible(img) || img.closest("[data-qa=bleed]")) continue; // intentional full-bleed backgrounds
        const r = img.getBoundingClientRect();
        // measure the visible box (img inside overflow-hidden frame)
        const frame = img.closest(".overflow-hidden") ?? img;
        const fr = frame.getBoundingClientRect();
        const h = Math.min(r.height, fr.height);
        if (h > VH * 0.8) issues.push(`BIGIMG ${Math.round(h)}px ${(img.getAttribute("alt") || img.title || img.tagName).slice(0, 40)}`);
      }
      results.push({ si, label, top: Math.round(sr.t), h: Math.round(sr.h), issues: [...new Set(issues)] });
    });
    return { usable: Math.round(usable), overflowX: document.documentElement.scrollWidth - W, results };
  });

  const bad = report.results.filter((r) => r.issues.length);
  total += bad.reduce((n, r) => n + r.issues.length, 0);
  console.log(`\n== ${width}x${height} usable=${report.usable} overflowX=${report.overflowX} sections=${report.results.length}`);
  for (const r of report.results) {
    console.log(`  [${r.si}] ${String(r.h).padStart(5)}px  ${r.label}${r.issues.length ? "\n      - " + r.issues.slice(0, 8).join("\n      - ") + (r.issues.length > 8 ? `\n      (+${r.issues.length - 8} more)` : "") : ""}`);
  }
  if (errs.length) console.log("  errors:", errs);

  if (out) {
    await page.addStyleTag({ content: "header.fixed{visibility:hidden!important}" });
    const secs = await page.$$("main > section, main > div > section, footer");
    for (let i = 0; i < secs.length; i++) {
      try {
        await secs[i].screenshot({ path: `${out}/${width}-s${String(i).padStart(2, "0")}.png` });
      } catch {}
    }
  }
  await page.close();
}
await browser.close();
console.log(`\nTOTAL ISSUES: ${total}`);
