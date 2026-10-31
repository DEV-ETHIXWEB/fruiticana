// Renders the full vector logo lockup to a high-resolution PNG for places that need a
// raster: Open Graph images and the Organization logo in structured data.
// Usage: node scripts/brand/build-logo.mjs   (after scripts/brand/trace-logo.py)
// Same 482 x 118 geometry as src/components/ui/Logo.tsx.
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const inner = (svg) => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const apple = await readFile(join(root, "public/brand/apple.svg"), "utf8");
const appleBox = apple.match(/viewBox="([^"]+)"/)[1];

// The original lockup's 482 x 118 grid: wordmark x 0-393, apple x 389-482, tagline centred at x 204.
const lockup = (word, ink) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 482 118">
  <svg x="0" y="0" width="393" height="118" viewBox="0 0 393 118">${inner(word)}</svg>
  <text x="204" y="117.3" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="10.4" letter-spacing="2.7" fill="${ink}">SINCE 1994</text>
  <svg x="389" y="0" width="93" height="118" viewBox="${appleBox}">${inner(apple)}</svg>
</svg>`;

// Colour version for light backgrounds, and a cream version for dark ones.
for (const [name, file, ink] of [["logo", "wordmark.svg", "#1c1a15"], ["logo-light", "wordmark-light.svg", "#fbf3e2"]]) {
  const svg = lockup(await readFile(join(root, "public/brand", file), "utf8"), ink);
  await writeFile(join(root, `public/brand/${name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 600 }).resize({ width: 1446 }).png({ compressionLevel: 9 }).toFile(join(root, `public/brand/${name}.png`));
  console.log(`${name}.svg + ${name}.png (1446px) written`);
}
