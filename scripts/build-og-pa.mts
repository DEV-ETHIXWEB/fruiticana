/**
 * Punjabi share cards (Open Graph images), pre-rendered in a real browser.
 *
 *   npm run build && npm run og:pa
 *
 * next/og (satori) has no complex-script shaping, so Gurmukhi vowel signs and conjuncts
 * would come out in the wrong place. Chromium shapes them correctly, so the Punjabi cards are
 * drawn here with the site's own fonts (the Noto Gurmukhi files next/font put in .next) and
 * saved to public/og/pa/. The opengraph-image routes serve these for /pa pages and fall back
 * to the English card when a file is missing (for example a store added later in Sanity).
 * Re-run after changing the Punjabi hero line, store hours or the store list.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { pa } from "../src/i18n/dictionaries/pa";
import { stores } from "../src/lib/content/seed/stores";
import { formatHours } from "../src/lib/hours";

const root = process.cwd();
const out = join(root, "public/og/pa");
const b64 = async (p: string) => (await readFile(p)).toString("base64");

/* The site's own @font-face rules, as next/font emitted them (family names and unicode ranges
   intact), with each font file inlined so the page needs no server. */
const chunks = join(root, ".next/static/chunks");
const faces: string[] = [];
for (const f of (await readdir(chunks)).filter((f) => f.endsWith(".css"))) {
  for (const rule of (await readFile(join(chunks, f), "utf8")).match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const file = rule.match(/url\(\.\.\/media\/([^)]+\.woff2)\)/)?.[1];
    if (!file || faces.some((r) => r.includes(file.slice(0, 16)))) continue;
    faces.push(rule.replace(/url\([^)]+\)/, `url(data:font/woff2;base64,${await b64(join(root, ".next/static/media", file))})`));
  }
}
if (!faces.some((r) => r.includes("Noto Serif Gurmukhi"))) throw new Error("Gurmukhi fonts not found in .next: run npm run build first.");
const stacks = { serif: ["Fraunces", '"Noto Serif Gurmukhi"'], sans: ['"Instrument Sans"', '"Noto Sans Gurmukhi"'] };

const logo = `data:image/png;base64,${await b64(join(root, "public/brand/logo.png"))}`;
const photo = `data:image/jpeg;base64,${await b64(join(root, "public/images/photos/store-produce-floor.jpg"))}`;
const css = `${faces.join("")}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:${stacks.sans.join(",")},sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:${stacks.serif.join(",")},serif}
.pill{color:#fff;padding:12px 24px;border-radius:999px;font-size:22px;line-height:1.5}`;

const page = (body: string) => `<!doctype html><html lang="pa"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

/* Home / default card: the same layout as the English one, with the Punjabi hero line */
const [line1, line2] = pa.home.heroTitle.replace(/\*/g, "").split(/,\s*/);
const storesLine = pa.home.heroEyebrow(25).replace(/^Fruiticana · /, "");
const home = page(`
<div style="display:flex;width:1200px;height:630px;background:#faf5ea">
  <div style="display:flex;flex-direction:column;justify-content:space-between;width:640px;padding:64px">
    <img src="${logo}" width="334" height="78" alt="">
    <div>
      <div class="serif" style="font-size:70px;line-height:1.3;color:#0f3b26">${line1},</div>
      <div class="serif" style="font-size:70px;line-height:1.3;color:#e2231a">${line2}</div>
      <div style="margin-top:24px;font-size:28px;line-height:1.5;color:#4a463c">${storesLine}</div>
    </div>
    <div style="display:flex;gap:12px">
      <div class="pill" style="background:#e2231a">${pa.home.heroCtaSpecialsShort}</div>
      <div class="pill" style="background:#0b7a3b">${pa.home.heroCtaStoreShort}</div>
    </div>
  </div>
  <img src="${photo}" style="width:560px;height:630px;object-fit:cover" alt="">
</div>`);

/* Store cards: store names and addresses stay English (as on signage and maps), the rest is Punjabi */
const storeCard = (s: (typeof stores)[number]) => {
  const name = s.isHeadOffice ? pa.common.headOffice : s.name;
  const where = `${s.street}, ${s.locality}, ${s.province} ${s.postalCode ?? ""}`.trim();
  const hours = `${s.isHeadOffice ? pa.stores.officeHours : pa.stores.openSevenDays} · ${formatHours(s, "pa")}`;
  return page(`
<div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;padding:72px;background:#0f3b26;color:#faf5ea">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;background:#faf5ea;border-radius:20px;padding:14px 22px"><img src="${logo}" width="274" height="64" alt=""></div>
    <div style="background:#f6d21c;color:#0f3b26;border-radius:999px;padding:10px 28px;font-size:28px;line-height:1.5">${pa.common.storeLocator}</div>
  </div>
  <div>
    <div lang="en" style="font-size:34px;color:#f6d21c;letter-spacing:4px;text-transform:uppercase">Fruiticana</div>
    <div class="serif" style="font-size:${name.length > 18 ? 80 : 92}px;line-height:1.15;letter-spacing:${s.isHeadOffice ? 0 : -2}px;margin-top:10px">${name}</div>
    <div lang="en" style="font-size:34px;margin-top:22px;color:rgba(250,245,234,.85)">${where}</div>
    <div style="font-size:30px;line-height:1.5;margin-top:10px;color:rgba(250,245,234,.75)">${hours}</div>
  </div>
</div>`);
};

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const render = async (html: string, file: string) => {
  await tab.setContent(html, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await writeFile(join(out, file), await tab.screenshot({ type: "png" }));
};
await render(home, "home.png");
for (const s of stores) await render(storeCard(s), `store-${s.slug}.png`);
await browser.close();
console.log(`Punjabi share cards: home + ${stores.length} stores in public/og/pa`);
