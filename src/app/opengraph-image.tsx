import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Fruiticana: the taste of home, since 1994. 25 grocery stores across BC & Alberta.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const [logo, photo] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/logo.png")),
    readFile(join(process.cwd(), "public/images/photos/store-produce-floor.jpg")),
  ]);
  const src = (b: Buffer, t: string) => `data:${t};base64,${b.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#faf5ea" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: 64 }}>
          <img src={src(logo, "image/png")} width={334} height={78} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, lineHeight: 1, color: "#0f3b26", letterSpacing: -2, fontFamily: "serif" }}>The taste of home,</div>
            <div style={{ fontSize: 76, lineHeight: 1.05, color: "#e2231a", fontStyle: "italic", letterSpacing: -2, fontFamily: "serif" }}>since 1994.</div>
            <div style={{ marginTop: 28, fontSize: 26, color: "#4a463c" }}>25 grocery stores across BC & Alberta</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ background: "#e2231a", color: "white", padding: "12px 22px", borderRadius: 999, fontSize: 20 }}>Weekly Specials</div>
            <div style={{ background: "#0b7a3b", color: "white", padding: "12px 22px", borderRadius: 999, fontSize: 20 }}>Find a store</div>
          </div>
        </div>
        <img src={src(photo, "image/jpeg")} width={560} height={630} style={{ objectFit: "cover" }} alt="" />
      </div>
    ),
    size,
  );
}
