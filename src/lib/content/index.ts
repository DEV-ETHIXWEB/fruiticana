import "server-only";
import { cache } from "react";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/client";
import * as seed from "./seed";
import { getLocale } from "@/i18n/server";
import { localizeCampaigns, localizeEvents, localizeFlyers, localizePage, localizePosts, localizeSettings, localizeVideos } from "./localize";
import { pa } from "./seed/pa";
import type { CampaignBanner, Event, Flyer, FlyerRegion, Img, Page, Post, SiteSettings, Store, Video } from "./types";

/*
 * Single content API for the whole site.
 * Every getter asks Sanity first and falls back to the bundled seed, so the
 * site is never blank, not before the CMS is connected, not during an outage.
 */

const IMG = `{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip }`;
const BODY = `body[]{ ..., _type == "image" => { "_type": "image", "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }`;
/** The Punjabi tab of a document (rich text resolved like the English body) */
const PA = `"pa": pa{ ..., ${BODY} }`;

type RawImg = Partial<Img> | null | undefined;
const toImg = (raw: RawImg, fallbackAlt = ""): Img | undefined =>
  raw?.src && raw.width && raw.height ? { src: raw.src, alt: raw.alt || fallbackAlt, width: raw.width, height: raw.height, lqip: raw.lqip } : undefined;

const nonEmpty = <T,>(list: T[] | null | undefined): list is T[] => Array.isArray(list) && list.length > 0;

const loadSettings = cache(async (): Promise<SiteSettings> => {
  const data = await sanityFetch<Partial<SiteSettings>>(groq`*[_id == "siteSettings"][0]`, {}, ["settings"]);
  if (!data) return seed.settings;
  // Merge so a half-filled settings doc never removes the phone number from the footer.
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)));
  return { ...seed.settings, ...clean };
});

export const getStores = cache(async (): Promise<Store[]> => {
  const data = await sanityFetch<(Omit<Store, "lat" | "lng"> & { location: { lat: number; lng: number } })[]>(
    groq`*[_type == "store" && defined(slug.current)] | order(city asc, name asc){ name, "slug": slug.current, city, street, locality, province, postalCode, phone, location, opens, closes, flyerRegion, isHeadOffice }`,
    {},
    ["store"],
  );
  if (!nonEmpty(data)) return seed.stores;
  return data.map(({ location, ...s }) => ({ ...s, lat: location.lat, lng: location.lng }));
});

export const getRetailStores = cache(async () => (await getStores()).filter((s) => !s.isHeadOffice));

export async function getStore(slug: string) {
  return (await getStores()).find((s) => s.slug === slug) ?? null;
}

const loadFlyers = cache(async (): Promise<Flyer[]> => {
  const data = await sanityFetch<(Omit<Flyer, "image"> & { image: RawImg })[]>(
    groq`*[_type == "flyer"] | order(validFrom desc){ region, label, validFrom, validTo, "image": image${IMG}, pa }`,
    {},
    ["flyer"],
  );
  if (!nonEmpty(data)) return seed.flyers;
  // Newest flyer per region wins; keep the legacy tab order.
  const order: FlyerRegion[] = ["greater-vancouver", "calgary", "chestermere", "edmonton"];
  const byRegion = new Map<FlyerRegion, Flyer>();
  for (const f of data) {
    const image = toImg(f.image, `Fruiticana weekly specials, ${f.label}`);
    if (image && !byRegion.has(f.region)) byRegion.set(f.region, { ...f, image });
  }
  const list = order.map((r) => byRegion.get(r)).filter(Boolean) as Flyer[];
  return list.length ? list : seed.flyers;
});

const loadCampaigns = cache(async (): Promise<CampaignBanner[]> => {
  const data = await sanityFetch<{ _id: string; label: string; href?: string; image: RawImg; pa?: CampaignBanner["pa"] }[]>(
    groq`*[_type == "campaign" && active != false] | order(order asc){ _id, label, href, "image": image${IMG}, pa }`,
    {},
    ["campaign"],
  );
  if (!nonEmpty(data)) return seed.campaigns;
  return data.flatMap((c) => {
    const image = toImg(c.image, c.label);
    // seeded documents are "campaign.<id>"; the id is what the Punjabi copy is keyed on
    return image ? [{ id: c._id.replace(/^(drafts\.)?campaign\./, ""), label: c.label, href: c.href, image, pa: c.pa ?? undefined }] : [];
  });
});

const loadVideos = cache(async (): Promise<Video[]> => {
  const data = await sanityFetch<{ title: string; youtubeId: string; caption?: string; poster: RawImg; pa?: Video["pa"] }[]>(
    groq`*[_type == "video"] | order(order asc){ title, youtubeId, caption, "poster": poster${IMG}, pa }`,
    {},
    ["video"],
  );
  if (!nonEmpty(data)) return seed.videos;
  return data.map((v) => ({
    ...v,
    poster: toImg(v.poster, v.title) ?? { src: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`, alt: v.title, width: 480, height: 360 },
  }));
});

const loadPosts = cache(async (): Promise<Post[]> => {
  const data = await sanityFetch<(Omit<Post, "image"> & { image: RawImg })[]>(
    groq`*[_type == "post" && defined(slug.current)] | order(date desc){ title, "slug": slug.current, date, category, excerpt, "image": image${IMG}, ${BODY}, seoTitle, seoDescription, ${PA} }`,
    {},
    ["post"],
  );
  if (!nonEmpty(data)) return seed.posts;
  return data.map((p) => ({ ...p, image: toImg(p.image, p.title) }));
});

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

const loadEvents = cache(async (): Promise<Event[]> => {
  const data = await sanityFetch<Event[]>(
    groq`*[_type == "event" && coalesce(end, start) >= now()] | order(start asc){ "id": _id, title, start, end, location, description, pa }`,
    {},
    ["event"],
  );
  return data ?? seed.events;
});

const loadPage = cache(async (slug: string): Promise<Page> => {
  const fallback = seed.pages[slug];
  const data = await sanityFetch<(Omit<Page, "heroImage"> & { heroImage: RawImg }) | null>(
    groq`*[_type == "page" && slug.current == $slug][0]{ title, "slug": slug.current, eyebrow, intro, "heroImage": heroImage${IMG}, ${BODY}, seoTitle, seoDescription, ${PA} }`,
    { slug },
    ["page", `page:${slug}`],
  );
  if (!data) {
    if (!fallback) throw new Error(`No content for page "${slug}"`);
    return fallback;
  }
  return {
    ...fallback,
    ...Object.fromEntries(Object.entries(data).filter(([, v]) => v != null)),
    heroImage: toImg(data.heroImage, data.title) ?? fallback?.heroImage,
    body: nonEmpty(data.body) ? data.body : (fallback?.body ?? []),
  } as Page;
});

/* ---------------- Public getters: content in the page's language ---------------- */

export const getSettings = cache(async () => localizeSettings(await loadSettings(), await getLocale()));
export const getFlyers = cache(async () => localizeFlyers(await loadFlyers(), await getLocale()));
export const getCampaigns = cache(async () => localizeCampaigns(await loadCampaigns(), await getLocale()));
export const getVideos = cache(async () => localizeVideos(await loadVideos(), await getLocale()));
export const getPosts = cache(async () => localizePosts(await loadPosts(), await getLocale()));
export const getPage = cache(async (slug: string) => localizePage(await loadPage(slug), await getLocale()));
export const getEvents = cache(async () => localizeEvents(await loadEvents(), await getLocale()));

/** Photos with descriptions (alt text) in the page's language. */
export const getPhotos = cache(async () => {
  const lang = await getLocale();
  if (lang !== "pa") return seed.photos;
  return Object.fromEntries(Object.entries(seed.photos).map(([k, img]) => [k, { ...img, alt: pa.photos[k as keyof typeof seed.photos] }])) as typeof seed.photos;
});

/** Timeline milestones (images stay with their English entries; text is swapped). */
export const getMilestones = cache(async () => {
  const lang = await getLocale();
  if (lang !== "pa") return seed.milestones;
  const photos = await getPhotos();
  return seed.milestones.map((m, i) => ({
    ...m,
    ...pa.milestones[i],
    image: m.image ? Object.values(photos).find((p) => p.src === m.image!.src) : undefined,
  }));
});

export const getMangoBenefits = cache(async () => ((await getLocale()) === "pa" ? pa.mangoBenefits : seed.mangoBenefits));
export const getMangoOutro = cache(async () => ((await getLocale()) === "pa" ? pa.mangoOutro : seed.mangoOutro));
export const getNewsClip = cache(async () => ((await getLocale()) === "pa" ? { ...seed.newsClip, ...pa.newsClip } : seed.newsClip));

export { nonEmbeddableVideos } from "./seed";
