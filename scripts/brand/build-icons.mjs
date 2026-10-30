// Builds every favicon / app icon from the vector mark: node scripts/brand/build-icons.mjs
// src/app/icon.svg (modern browsers), favicon.ico (16/32/48), icon.png, apple-icon.png, PWA icons.
import sharp from "sharp";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const svg = await readFile(join(root, "scripts/brand/mark.svg"));
const CREAM = "#fbf3e2";

const png = (size) => sharp(svg, { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
/** The mark centred on a solid tile (iOS and Android maskable icons cannot be transparent). */
const tile = async (size, scale) => {
  const inner = Math.round(size * scale);
  return sharp({ create: { width: size, height: size, channels: 4, background: CREAM } })
    .composite([{ input: await png(inner), gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};

/** Minimal ICO container holding PNG-encoded images (supported by every current browser). */
const ico = (images) => {
  const head = Buffer.alloc(6 + images.length * 16);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    head.writeUInt8(size >= 256 ? 0 : size, e); head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((im) => im.data)]);
};

await copyFile(join(root, "scripts/brand/mark.svg"), join(root, "src/app/icon.svg"));
await writeFile(join(root, "src/app/favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))));
await writeFile(join(root, "src/app/icon.png"), await png(96));
await writeFile(join(root, "src/app/apple-icon.png"), await tile(180, 0.78));
await writeFile(join(root, "public/icons/icon-192.png"), await png(192));
await writeFile(join(root, "public/icons/icon-512.png"), await png(512));
await writeFile(join(root, "public/icons/icon-maskable-512.png"), await tile(512, 0.62));
console.log("icons written");
