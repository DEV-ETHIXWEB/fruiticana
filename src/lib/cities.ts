import type { Store } from "./content/types";

/*
 * City landing pages: /indian-grocery-store/<city>, one per municipality with a Fruiticana
 * store. Built from the store list, so a store added in the CMS appears on its city's page
 * (and a new city gets a page) without code changes.
 */

export const CITY_BASE = "/indian-grocery-store";
export const citySlugOf = (locality: string) => locality.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
export const cityPath = (locality: string) => `${CITY_BASE}/${citySlugOf(locality)}`;

export type City = { slug: string; name: string; province: Store["province"]; stores: Store[] };

/** Retail stores grouped by municipality, biggest first. */
export function groupByCity(stores: Store[]): City[] {
  const map = new Map<string, City>();
  for (const s of stores) {
    if (s.isHeadOffice) continue;
    const slug = citySlugOf(s.locality);
    const city = map.get(slug) ?? { slug, name: s.locality, province: s.province, stores: [] };
    city.stores.push(s);
    map.set(slug, city);
  }
  return [...map.values()].sort((a, b) => b.stores.length - a.stores.length || a.name.localeCompare(b.name));
}

/** The opening hours most of a city's stores keep, and whether every store keeps them. */
export function commonHours(stores: Store[]) {
  const counts = new Map<string, number>();
  for (const s of stores) counts.set(`${s.opens}-${s.closes}`, (counts.get(`${s.opens}-${s.closes}`) ?? 0) + 1);
  const [key, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const [opens, closes] = key.split("-");
  return { opens, closes, all: n === stores.length };
}
