import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getStore, getStores } from "@/lib/content";
import { formatHours } from "@/lib/hours";

/* Per-store social card: name, address and hours, so a shared store link previews like a listing. */
export const alt = "Fruiticana store location, address and hours";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getStores()).map((s) => ({ slug: s.slug }));
}

export default async function StoreOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore(slug);
  const logo = await readFile(join(process.cwd(), "public/brand/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const name = store ? (store.isHeadOffice ? "Head Office" : store.name) : "Store Locator";
  const where = store ? `${store.street}, ${store.locality}, ${store.province} ${store.postalCode ?? ""}`.trim() : "25 stores across BC & Alberta";
  const hours = store ? `${store.isHeadOffice ? "Office hours" : "Open 7 days"} · ${formatHours(store)}` : "";

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, background: "#0f3b26", color: "#faf5ea" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", background: "#faf5ea", borderRadius: 20, padding: "14px 22px" }}>
            <img src={logoSrc} width={260} height={64} alt="" />
          </div>
          <div style={{ display: "flex", background: "#f6d21c", color: "#0f3b26", borderRadius: 999, padding: "12px 26px", fontSize: 26 }}>Store locator</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, color: "#f6d21c", letterSpacing: 4, textTransform: "uppercase" }}>Fruiticana</div>
          <div style={{ fontSize: 92, lineHeight: 1.02, letterSpacing: -2, fontFamily: "serif", marginTop: 10 }}>{name}</div>
          <div style={{ fontSize: 34, marginTop: 26, color: "rgba(250,245,234,0.85)" }}>{where}</div>
          {hours && <div style={{ fontSize: 30, marginTop: 12, color: "rgba(250,245,234,0.7)" }}>{hours}</div>}
        </div>
      </div>
    ),
    size,
  );
}
