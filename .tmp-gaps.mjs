import { chromium } from "playwright";
const [w, h, ...routes] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
for (const r of routes) {
  await p.goto("http://localhost:4318" + r, { waitUntil: "networkidle" });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await p.waitForTimeout(1200);
  const rows = await p.evaluate(() => {
    const out = [];
    for (const s of document.querySelectorAll("main > *, main > div > section, footer")) {
      const sr = s.getBoundingClientRect(); if (sr.height < 40) continue;
      // content extent: union of visible leaf-ish elements with text or media
      let top = Infinity, bot = -Infinity;
      for (const e of s.querySelectorAll("h1,h2,h3,p,a,button,img,video,iframe,li,figure,blockquote,svg,input,span")) {
        const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (!r.height || cs.visibility === "hidden" || +cs.opacity === 0 || cs.position === "absolute" && e.tagName === "SPAN") continue;
        if (r.bottom < sr.top || r.top > sr.bottom) continue;
        top = Math.min(top, r.top); bot = Math.max(bot, r.bottom);
      }
      const cs = getComputedStyle(s);
      out.push(`${(s.id || s.className.toString().split(" ").slice(0, 3).join(".")).slice(0, 45).padEnd(45)} h=${Math.round(sr.height)} pad=${cs.paddingTop}/${cs.paddingBottom} emptyTop=${Math.round(top - sr.top)} emptyBot=${Math.round(sr.bottom - bot)}`);
    }
    return out;
  });
  console.log("\n" + r + "\n" + rows.join("\n"));
}
await b.close();
