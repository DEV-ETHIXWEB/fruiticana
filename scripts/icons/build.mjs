// Renders the custom 3D icon set: node scripts/icons/build.mjs [outDir] [name...]
// Models live in scripts/icons/studio.html (three.js). Output: trimmed, centred 256px WebP.
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = process.argv[2] || join(root, "public", "icons3d");
const only = process.argv.slice(3);
await mkdir(out, { recursive: true });

const types = { ".js": "text/javascript", ".html": "text/html" };
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
// Serve the studio page and three.js straight from disk (no dev server needed).
await page.route("http://icons.local/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  const file = path === "/" ? join(root, "scripts/icons/studio.html") : path.startsWith("/three/") ? join(root, "node_modules", path) : null;
  if (!file) return route.fulfill({ status: 404 });
  route.fulfill({ status: 200, contentType: types[extname(file)] ?? "application/octet-stream", body: await readFile(file) });
});
await page.goto("http://icons.local/");
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const names = only.length ? only : await page.evaluate(() => window.ICON_NAMES);
for (const name of names) {
  const dataUrl = await page.evaluate((n) => window.renderIcon(n), name);
  // Trim to the model, pad to a square so every icon has the same optical size, then downsample.
  const png = await sharp(Buffer.from(dataUrl.split(",")[1], "base64")).trim().toBuffer({ resolveWithObject: true });
  const side = Math.max(png.info.width, png.info.height) + 16;
  // (two passes: sharp always resizes before it extends within one pipeline)
  const square = await sharp(png.data)
    .extend({ top: Math.floor((side - png.info.height) / 2), bottom: Math.ceil((side - png.info.height) / 2), left: Math.floor((side - png.info.width) / 2), right: Math.ceil((side - png.info.width) / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const webp = await sharp(square)
    .resize(256, 256, { kernel: "lanczos3" })
    .webp({ quality: 90, effort: 6 })
    .toBuffer();
  await writeFile(join(out, `${name}.webp`), webp);
  console.log("rendered", name);
}
await browser.close();
