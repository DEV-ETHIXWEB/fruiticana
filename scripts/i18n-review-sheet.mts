/**
 * Bilingual review sheet: every English string on the site next to its Punjabi version,
 * for a native speaker to sign off.
 *
 *   npm run i18n:review      → docs/punjabi-review.csv (opens in Excel / Google Sheets)
 *
 * Covers the interface dictionaries and all bundled content (pages, posts, photo descriptions,
 * banners, videos, milestones). Text entered later in Sanity's Punjabi tabs is reviewed there.
 * Wording conventions: src/i18n/GLOSSARY.md.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { en } from "../src/i18n/dictionaries/en";
import { pa } from "../src/i18n/dictionaries/pa";
import * as seed from "../src/lib/content/seed";
import { pa as paSeed } from "../src/lib/content/seed/pa";

type Row = [section: string, key: string, english: string, punjabi: string];
const rows: Row[] = [];

const isBlock = (v: unknown): v is { _type: string; style?: string; listItem?: string; children?: { text?: string }[] } =>
  !!v && typeof v === "object" && (v as { _type?: string })._type === "block";
const blockText = (b: { style?: string; listItem?: string; children?: { text?: string }[] }) =>
  `${b.listItem ? "• " : b.style && b.style !== "normal" ? `[${b.style}] ` : ""}${(b.children ?? []).map((c) => c.text ?? "").join("")}`;
const isImg = (v: unknown): v is { src: string; alt: string } => !!v && typeof v === "object" && "src" in v && "alt" in v;

/* Sample arguments for strings with placeholders, so the reviewer sees the whole sentence. */
const sample = (fn: (...a: never[]) => unknown) => Array.from({ length: fn.length }, (_, i) => `{${i + 1}}`) as never[];

function walk(section: string, key: string, a: unknown, b: unknown) {
  if (b === undefined || b === null) return;
  if (typeof b === "function") {
    const args = sample(b as (...x: never[]) => unknown);
    return walk(section, `${key}()`, typeof a === "function" ? (a as (...x: never[]) => unknown)(...args) : a, (b as (...x: never[]) => unknown)(...args));
  }
  if (typeof b === "string" || typeof b === "number") {
    const english = isImg(a) ? a.alt : a == null || a === "" ? "(Punjabi only)" : String(a);
    if (String(b) !== english || /[਀-੿]/.test(String(b))) rows.push([section, key, english, String(b)]);
    return;
  }
  if (Array.isArray(b)) {
    const list = Array.isArray(a) ? a : [];
    b.forEach((item, i) => {
      if (isBlock(item)) rows.push([section, `${key}[${i}]`, isBlock(list[i]) ? blockText(list[i]) : "", blockText(item)]);
      else walk(section, `${key}[${i}]`, list[i], item);
    });
    return;
  }
  if (typeof b === "object") {
    for (const [k, v] of Object.entries(b)) walk(section, key ? `${key}.${k}` : k, a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined, v);
  }
}

/* Interface text */
for (const ns of Object.keys(pa) as (keyof typeof pa)[]) walk(`Interface: ${ns}`, ns, en[ns], pa[ns]);

/* Content, each English source shaped like its Punjabi copy */
const byKey = <T,>(list: T[], key: (x: T) => string) => Object.fromEntries(list.map((x) => [key(x), x]));
walk("Photo descriptions", "photos", seed.photos, paSeed.photos);
walk("Company text", "settings", seed.settings, paSeed.settings);
// regions without a flyer in the bundle still get Punjabi labels (used when one is added in Sanity)
const regionNames = { "greater-vancouver": "Greater Vancouver", calgary: "Calgary", chestermere: "Chestermere", edmonton: "Edmonton" };
walk(
  "Flyers",
  "flyers",
  Object.fromEntries(
    Object.entries(regionNames).map(([r, name]) => {
      const f = seed.flyers.find((x) => x.region === r);
      return [r, { label: f?.label ?? name, alt: f?.image.alt ?? `Fruiticana weekly specials flyer for ${name}` }];
    }),
  ),
  paSeed.flyers,
);
walk("Banners", "campaigns", Object.fromEntries(seed.campaigns.map((c) => [c.id, { label: c.label, alt: c.image.alt }])), paSeed.campaigns);
walk("Videos", "videos", Object.fromEntries(seed.videos.map((v) => [v.youtubeId, { title: v.title, caption: v.caption, posterAlt: v.poster.alt }])), paSeed.videos);
walk("News clip", "newsClip", seed.newsClip, paSeed.newsClip);
walk("Community posts", "posts", byKey(seed.posts, (p) => p.slug), paSeed.posts);
walk("Pages", "pages", Object.fromEntries(Object.entries(seed.pages).map(([k, p]) => [k, { ...p, heroAlt: p.heroImage?.alt }])), paSeed.pages);
walk("Mangoes page", "mangoBenefits", seed.mangoBenefits, paSeed.mangoBenefits);
walk("Mangoes page", "mangoOutro", seed.mangoOutro, paSeed.mangoOutro);
walk("Our story timeline", "milestones", seed.milestones, paSeed.milestones);

const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
const csv = [["Section", "Key", "English", "Punjabi", "OK? (Y/N)", "Suggested Punjabi", "Notes"], ...rows.map((r) => [...r, "", "", ""])]
  .map((r) => r.map(cell).join(","))
  .join("\r\n");
await mkdir(join(process.cwd(), "docs"), { recursive: true });
// BOM so Excel opens it as UTF-8 and shows Gurmukhi correctly
await writeFile(join(process.cwd(), "docs/punjabi-review.csv"), `﻿${csv}\r\n`);
console.log(`docs/punjabi-review.csv: ${rows.length} lines to review`);
