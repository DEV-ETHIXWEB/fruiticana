// Finds text that is visibly cut: any line of text whose glyph box extends past an ancestor that clips
// (overflow hidden/clip/auto/scroll, or clip-path), plus text truncated with an ellipsis or line-clamp.
// Also finds outer box-shadows (button rings, 3D bevels and glows) sliced off by a clipping ancestor.
// Usage: node scripts/qa-glyphs.mjs [route...]   (default: every URL in /sitemap.xml)
// Env: QA_BASE (default http://localhost:4318), QA_VIEWPORTS (default 1440x900,1024x768,768x1024,390x844)
import { chromium } from "playwright";

const base = process.env.QA_BASE || "http://localhost:4318";
const viewports = (process.env.QA_VIEWPORTS || "1440x900,1024x768,768x1024,390x844").split(",").map((v) => v.split("x").map(Number));
let routes = process.argv.slice(2);
if (!routes.length) {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

const browser = await chromium.launch();
let total = 0;
for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    // scroll through so every in-view reveal plays, then let the animations settle
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(1800);
    const issues = await page.evaluate(() => {
      const out = [];
      const clips = (el) => {
        const cs = getComputedStyle(el);
        return cs.overflowX !== "visible" || cs.overflowY !== "visible" || cs.clipPath !== "none";
      };
      const visible = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
          if (e.classList?.contains("sr-only") || e.getAttribute?.("aria-hidden") === "true") return false;
        }
        return true;
      };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent.trim();
        const el = n.parentElement;
        if (!text || !el || seen.has(el) || el.closest("script,style,noscript,svg,.maplibregl-map,[data-qa-skip]")) continue;
        if (!visible(el)) continue;
        const cs = getComputedStyle(el);
        // intentional truncation
        if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) out.push({ kind: "ELLIPSIS", text: text.slice(0, 60) });
        if (cs.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 2) out.push({ kind: "LINECLAMP", text: text.slice(0, 60) });
        const range = document.createRange();
        range.selectNodeContents(n);
        const fs = parseFloat(cs.fontSize);
        const italic = cs.fontStyle === "italic";
        for (const r of range.getClientRects()) {
          if (r.width < 1 || r.height < 1) continue;
          // the glyph box: the font's content area, plus a little side bearing for italics
          const pad = italic ? fs * 0.08 : 0;
          const ink = { l: r.left - pad, r: r.right + pad, t: r.top, b: r.bottom };
          for (let a = el; a && a !== document.body; a = a.parentElement) {
            if (!clips(a)) continue;
            const acs = getComputedStyle(a);
            // scroll containers clip by design (cards and list rows scroll into view)
            if ((acs.overflowX === "auto" || acs.overflowX === "scroll") && a.scrollWidth > a.clientWidth + 1) break;
            if ((acs.overflowY === "auto" || acs.overflowY === "scroll") && a.scrollHeight > a.clientHeight + 1) break;
            const b = a.getBoundingClientRect();
            const box = { l: b.left + a.clientLeft, t: b.top + a.clientTop, r: b.left + a.clientLeft + a.clientWidth, b: b.top + a.clientTop + a.clientHeight };
            const cut = Math.max(box.l - ink.l, ink.r - box.r, box.t - ink.t, ink.b - box.b);
            // fully outside = deliberately hidden (marquee copy, off-slide), not "cut"
            const outside = ink.r <= box.l || ink.l >= box.r || ink.b <= box.t || ink.t >= box.b;
            if (cut > 1 && !outside) {
              const where = ["l", "r", "t", "b"].filter((k) => (k === "l" ? box.l - ink.l : k === "r" ? ink.r - box.r : k === "t" ? box.t - ink.t : ink.b - box.b) > 1).join("");
              out.push({ kind: "CUT", text: text.slice(0, 60), px: Math.round(cut), side: where, by: `${a.tagName.toLowerCase()}.${String(a.className).split(" ").slice(0, 4).join(".")}` });
              break;
            }
            if (outside) break;
          }
        }
        seen.add(el);
      }
      // Outer box-shadows (rings, glows) cut by a clipping ancestor
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if (cs.boxShadow === "none" || el.closest(".maplibregl-map,[data-qa-skip]") || !visible(el)) continue;
        const ext = { l: 0, r: 0, t: 0, b: 0 };
        for (const sh of cs.boxShadow.split(/,(?![^(]*\))/)) {
          if (sh.includes("inset")) continue;
          const [x = 0, y = 0, blur = 0, spread = 0] = (sh.replace(/rgba?\([^)]*\)/, "").match(/-?[\d.]+px/g) || []).map(parseFloat);
          if (/rgba?\([^)]*,\s*0\)/.test(sh)) continue; // fully transparent
          const reach = spread + blur * 0.5;
          ext.l = Math.max(ext.l, reach - x); ext.r = Math.max(ext.r, reach + x);
          ext.t = Math.max(ext.t, reach - y); ext.b = Math.max(ext.b, reach + y);
        }
        if (Math.max(ext.l, ext.r, ext.t, ext.b) < 1) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          if (!clips(a)) continue;
          const b = a.getBoundingClientRect();
          // the element itself runs past this edge (scrolled out, or bleeds by design): not a shadow problem
          const inside = { l: r.left >= b.left - 0.5, r: r.right <= b.right + 0.5, t: r.top >= b.top - 0.5, b: r.bottom <= b.bottom + 0.5 };
          if (!inside.l && !inside.r) break;
          if (!inside.t && !inside.b) break;
          const cut = {
            l: inside.l ? Math.min(ext.l, b.left - (r.left - ext.l)) : 0,
            r: inside.r ? Math.min(ext.r, r.right + ext.r - b.right) : 0,
            t: inside.t ? Math.min(ext.t, b.top - (r.top - ext.t)) : 0,
            b: inside.b ? Math.min(ext.b, r.bottom + ext.b - b.bottom) : 0,
          };
          // report when at least half of a side's ring/glow is sliced off
          const sides = ["l", "r", "t", "b"].filter((k) => ext[k] >= 1 && cut[k] >= Math.max(1, ext[k] * 0.5));
          if (sides.length) {
            out.push({ kind: "SHADOW", text: (el.textContent.trim() || el.getAttribute("aria-label") || el.tagName).slice(0, 50), px: Math.round(Math.max(...sides.map((k) => cut[k]))), side: sides.join(""), by: `${a.tagName.toLowerCase()}.${String(a.className).split(" ").slice(0, 4).join(".")}` });
          }
          break;
        }
      }
      return out;
    });
    const uniq = [...new Map(issues.map((i) => [i.kind + i.text + i.by, i])).values()];
    if (uniq.length) {
      console.log(`\n${width}x${height} ${route}`);
      for (const i of uniq) console.log(`  ${i.kind}${i.px ? ` ${i.px}px ${i.side}` : ""}  "${i.text}"${i.by ? `  <- ${i.by}` : ""}`);
    }
    total += uniq.length;
  }
  await page.close();
}
await browser.close();
console.log(`\nTOTAL: ${total}`);
