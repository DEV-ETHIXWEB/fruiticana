/**
 * One-time import of every piece of content from the legacy site into Sanity.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_API_WRITE_TOKEN=yyy npm run seed
 *
 * Idempotent: documents use stable _ids and images are uploaded once
 * (Sanity de-duplicates assets by content hash), so it is safe to re-run.
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "next-sanity";
import { campaigns, flyers, pages, posts, settings, stores, videos } from "../src/lib/content/seed";
import type { Img } from "../src/lib/content/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (Editor token from sanity.io/manage) first.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-10-01", useCdn: false });
const assetCache = new Map<string, string>();

async function image(img?: Img) {
  if (!img) return undefined;
  let id = assetCache.get(img.src);
  if (!id) {
    const file = join(process.cwd(), "public", img.src);
    const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
    id = asset._id;
    assetCache.set(img.src, id);
    console.log("  ↑", img.src);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id }, alt: img.alt };
}

const slug = (current: string) => ({ _type: "slug", current });

async function main() {
  console.log(`Seeding ${projectId}/${dataset}…`);
  const tx = client.transaction();

  // Only the fields the siteSettings schema defines.
  const settingsDoc = (({ tagline, phone, email, jobsEmail, mission, companySummary, presidentQuote, presidentName }) => ({ tagline, phone, email, jobsEmail, mission, companySummary, presidentQuote, presidentName }))(settings);
  tx.createOrReplace({ _id: "siteSettings", _type: "siteSettings", ...settingsDoc, socials: settings.socials.map((s, i) => ({ _key: `s${i}`, ...s })) });

  for (const s of stores) {
    const { lat, lng, slug: sl, ...rest } = s;
    tx.createOrReplace({ _id: `store.${sl}`, _type: "store", ...rest, slug: slug(sl), location: { _type: "geopoint", lat, lng } });
  }

  for (const f of flyers) {
    tx.createOrReplace({ _id: `flyer.${f.region}`, _type: "flyer", region: f.region, label: f.label, image: await image(f.image) });
  }

  for (const [i, c] of campaigns.entries()) {
    tx.createOrReplace({ _id: `campaign.${c.id}`, _type: "campaign", label: c.label, href: c.href, order: i * 10, active: true, image: await image(c.image) });
  }

  for (const [i, v] of videos.entries()) {
    tx.createOrReplace({ _id: `video.${v.youtubeId.replace(/[^\w]/g, "")}`, _type: "video", title: v.title, youtubeId: v.youtubeId, caption: v.caption, order: i * 10, poster: await image(v.poster) });
  }

  for (const p of posts) {
    tx.createOrReplace({ _id: `post.${p.slug}`, _type: "post", title: p.title, slug: slug(p.slug), date: p.date, category: p.category, excerpt: p.excerpt, body: p.body, image: await image(p.image) });
  }

  for (const p of Object.values(pages)) {
    tx.createOrReplace({
      _id: `page.${p.slug}`,
      _type: "page",
      title: p.title,
      slug: slug(p.slug),
      eyebrow: p.eyebrow,
      intro: p.intro,
      body: p.body,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      heroImage: await image(p.heroImage),
    });
  }

  const res = await tx.commit();
  console.log(`✓ ${res.results.length} documents written, ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
