import type { MetadataRoute } from "next";
import { getPosts, getStores } from "@/lib/content";
import { htmlLang, localizePath, punjabiLive } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";

const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/flyers", priority: 0.95, freq: "weekly" },
  { path: "/storefinder", priority: 0.9, freq: "monthly" },
  { path: "/our-company", priority: 0.7, freq: "yearly" },
  { path: "/commitment-to-quality", priority: 0.5, freq: "yearly" },
  { path: "/farm-to-table", priority: 0.5, freq: "yearly" },
  { path: "/employment", priority: 0.6, freq: "monthly" },
  { path: "/indican", priority: 0.7, freq: "yearly" },
  { path: "/mangoes", priority: 0.6, freq: "yearly" },
  { path: "/blog", priority: 0.6, freq: "monthly" },
  { path: "/events", priority: 0.5, freq: "weekly" },
  { path: "/forced-and-child-labour-report-2024-25", priority: 0.3, freq: "yearly" },
  { path: "/contact", priority: 0.6, freq: "yearly" },
  { path: "/site-map", priority: 0.2, freq: "yearly" },
];

type Entry = MetadataRoute.Sitemap[number];

/**
 * One entry per language. Once Punjabi is live, each page is listed in English and Punjabi,
 * and every entry names both versions (hreflang alternates), as Google recommends.
 */
function entries(path: string, rest: Omit<Entry, "url">): Entry[] {
  if (!punjabiLive) return [{ url: absoluteUrl(path), ...rest }];
  const languages = {
    [htmlLang.en]: absoluteUrl(localizePath(path, "en")),
    [htmlLang.pa]: absoluteUrl(localizePath(path, "pa")),
    "x-default": absoluteUrl(localizePath(path, "en")),
  };
  return (["en", "pa"] as const).map((lang) => ({ url: absoluteUrl(localizePath(path, lang)), ...rest, alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, posts] = await Promise.all([getStores(), getPosts()]);
  const now = new Date();
  return [
    ...staticRoutes.flatMap((r) => entries(r.path, { lastModified: now, changeFrequency: r.freq, priority: r.priority })),
    ...stores.flatMap((s) => entries(`/storefinder/${s.slug}`, { lastModified: now, changeFrequency: "monthly", priority: s.isHeadOffice ? 0.4 : 0.8 })),
    ...posts.flatMap((p) => entries(`/blog/${p.slug}`, { lastModified: new Date(p.date), changeFrequency: "yearly", priority: 0.4 })),
  ];
}
