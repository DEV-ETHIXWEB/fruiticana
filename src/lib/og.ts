import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * A pre-rendered Punjabi share card from public/og/pa (see scripts/build-og-pa.mts).
 * next/og cannot shape Gurmukhi, so these are drawn in a real browser ahead of time.
 * Returns null when the card does not exist yet, so the caller can fall back to English.
 */
export async function punjabiCard(file: string): Promise<Response | null> {
  try {
    const png = await readFile(join(process.cwd(), "public/og/pa", file));
    return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
  } catch {
    return null;
  }
}
