import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

export const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

/**
 * Tagged, revalidating fetch. Content updates in the Studio hit
 * /api/revalidate (Sanity webhook) which expires the matching tag.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}, tags: string[] = []): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params, { next: { revalidate: 3600, tags: ["sanity", ...tags] } });
  } catch (err) {
    console.error("[sanity] fetch failed, serving seed content", err);
    return null;
  }
}
