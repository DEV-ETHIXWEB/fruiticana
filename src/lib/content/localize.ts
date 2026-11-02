import type { PortableTextBlock } from "@portabletext/types";
import type { Locale } from "@/i18n/config";
import * as seed from "./seed";
import { pa } from "./seed/pa";
import type { CampaignBanner, Event, Flyer, Img, Page, Post, SiteSettings, Video } from "./types";

/*
 * Content in the page's language. English passes through untouched. For Punjabi, each field
 * comes from, in order:
 *   1. the document's Punjabi tab in the CMS (`pa`), when filled in;
 *   2. the bundled translation (seed/pa.ts), but only while the English still matches the
 *      English that translation was made from, so an edited English text never sits next
 *      to an outdated Punjabi one;
 *   3. the English text.
 * Bundled copy is matched by stable keys (page/post slug, flyer region, campaign id,
 * YouTube id, image src), so it also applies to the same content once it lives in Sanity.
 */

type Text = string | PortableTextBlock[] | undefined | null;

/** Text content only: CMS copies of seeded rich text gain _keys and image assets, not new words. */
const plain = (v: Text): string =>
  (Array.isArray(v)
    ? v.map((b) => (Array.isArray(b.children) ? (b.children as { text?: string }[]).map((c) => c.text ?? "").join("") : "")).join("\n")
    : (v ?? "")
  )
    .replace(/\s+/g, " ")
    .trim();

const filled = (v: Text) => (Array.isArray(v) ? v.length > 0 : !!v?.trim());

/**
 * Picks the Punjabi value for one field.
 * `english` is the live English value; `source` the English the bundled translation was made from.
 */
function pick<T extends Text>(cms: T | undefined, bundled: T | undefined, english: T, source: Text): T {
  if (filled(cms)) return cms as T;
  if (filled(bundled) && (source === undefined || plain(english) === plain(source))) return bundled as T;
  return english;
}

const altBySrc = new Map(Object.entries(seed.photos).map(([k, img]) => [img.src, pa.photos[k as keyof typeof seed.photos]]));
const sourceAltBySrc = new Map(Object.values(seed.photos).map((img) => [img.src, img.alt]));

/** Image description: CMS Punjabi alt, else the bundled one (by alt for the same English), else English. */
function localImg<T extends Img | undefined>(img: T, cmsAlt?: string, bundledAlt?: string, sourceAlt?: string): T {
  if (!img) return img;
  const bundled = bundledAlt ?? altBySrc.get(img.src);
  const source = bundledAlt ? sourceAlt : sourceAltBySrc.get(img.src);
  return { ...img, alt: pick(cmsAlt, bundled, img.alt, source) };
}

export function localizeSettings(s: SiteSettings, lang: Locale): SiteSettings {
  if (lang !== "pa") return s;
  const b = pa.settings;
  const src = seed.settings;
  const text = (k: "tagline" | "mission" | "companySummary" | "presidentQuote" | "presidentName") => pick(s.pa?.[k], b[k], s[k], src[k]);
  return {
    ...s,
    ...b,
    tagline: text("tagline"),
    mission: text("mission"),
    companySummary: text("companySummary"),
    presidentQuote: text("presidentQuote"),
    presidentName: text("presidentName"),
    announcement: s.announcement && { ...s.announcement, text: s.pa?.announcementText?.trim() || s.announcement.text },
  };
}

export function localizeFlyers(list: Flyer[], lang: Locale): Flyer[] {
  if (lang !== "pa") return list;
  return list.map((f) => {
    const b = pa.flyers[f.region];
    const src = seed.flyers.find((x) => x.region === f.region);
    return { ...f, label: pick(f.pa?.label, b?.label, f.label, src?.label), image: localImg(f.image, f.pa?.imageAlt, b?.alt, src?.image.alt) };
  });
}

export function localizeCampaigns(list: CampaignBanner[], lang: Locale): CampaignBanner[] {
  if (lang !== "pa") return list;
  return list.map((c) => {
    const b = pa.campaigns[c.id as keyof typeof pa.campaigns];
    const src = seed.campaigns.find((x) => x.id === c.id);
    return { ...c, label: pick(c.pa?.label, b?.label, c.label, src?.label), image: localImg(c.image, c.pa?.imageAlt, b?.alt, src?.image.alt) };
  });
}

export function localizeVideos(list: Video[], lang: Locale): Video[] {
  if (lang !== "pa") return list;
  return list.map((v) => {
    const b = pa.videos[v.youtubeId as keyof typeof pa.videos] as { title: string; caption?: string; posterAlt?: string } | undefined;
    const src = seed.videos.find((x) => x.youtubeId === v.youtubeId);
    return {
      ...v,
      title: pick(v.pa?.title, b?.title, v.title, src?.title),
      caption: pick(v.pa?.caption, b?.caption, v.caption, src?.caption),
      poster: localImg(v.poster, v.pa?.posterAlt, b?.posterAlt, src?.poster.alt),
    };
  });
}

export function localizePosts(list: Post[], lang: Locale): Post[] {
  if (lang !== "pa") return list;
  return list.map((p) => {
    const b = pa.posts[p.slug as keyof typeof pa.posts] as Partial<Post> | undefined;
    const src = seed.posts.find((x) => x.slug === p.slug);
    return {
      ...p,
      title: pick(p.pa?.title, b?.title, p.title, src?.title),
      category: pick(p.pa?.category, b?.category, p.category, src?.category),
      excerpt: pick(p.pa?.excerpt, b?.excerpt, p.excerpt, src?.excerpt),
      body: pick(p.pa?.body, b?.body, p.body, src?.body),
      seoTitle: pick(p.pa?.seoTitle, b?.seoTitle, p.seoTitle, src?.seoTitle),
      seoDescription: pick(p.pa?.seoDescription, b?.seoDescription, p.seoDescription, src?.seoDescription),
      image: localImg(p.image, p.pa?.imageAlt),
    };
  });
}

export function localizeEvents(list: Event[], lang: Locale): Event[] {
  if (lang !== "pa") return list;
  return list.map((e) => ({
    ...e,
    title: e.pa?.title?.trim() || e.title,
    location: e.pa?.location?.trim() || e.location,
    description: e.pa?.description?.trim() || e.description,
  }));
}

export function localizePage(page: Page, lang: Locale): Page {
  if (lang !== "pa") return page;
  const b = pa.pages[page.slug as keyof typeof pa.pages] as (Partial<Page> & { heroAlt?: string }) | undefined;
  const src = seed.pages[page.slug];
  return {
    ...page,
    title: pick(page.pa?.title, b?.title, page.title, src?.title),
    eyebrow: pick(page.pa?.eyebrow, b?.eyebrow, page.eyebrow, src?.eyebrow),
    intro: pick(page.pa?.intro, b?.intro, page.intro, src?.intro),
    body: pick(page.pa?.body, b?.body, page.body, src?.body),
    seoTitle: pick(page.pa?.seoTitle, b?.seoTitle, page.seoTitle, src?.seoTitle),
    seoDescription: pick(page.pa?.seoDescription, b?.seoDescription, page.seoDescription, src?.seoDescription),
    heroImage: localImg(page.heroImage, page.pa?.heroAlt, b?.heroAlt, src?.heroImage?.alt),
  };
}
