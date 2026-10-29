import type { MetadataRoute } from "next";
import { getPosts, getStores } from "@/lib/content";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, posts] = await Promise.all([getStores(), getPosts()]);
  const now = new Date();
  return [
    ...staticRoutes.map((r) => ({ url: absoluteUrl(r.path), lastModified: now, changeFrequency: r.freq, priority: r.priority })),
    ...stores.map((s) => ({ url: absoluteUrl(`/storefinder/${s.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: s.isHeadOffice ? 0.4 : 0.8 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
