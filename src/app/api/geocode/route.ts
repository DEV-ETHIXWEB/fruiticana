import { NextResponse, type NextRequest } from "next/server";
import { POSTAL_RE } from "@/lib/geo";

/**
 * Postal code → coordinates for "stores near V3W 4H7".
 * Proxied server-side so we can send a proper User-Agent, cache for a day,
 * and only ever forward a validated Canadian postal code (no free text).
 */
export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("postal") ?? "").trim().toUpperCase();
  if (!POSTAL_RE.test(raw)) return NextResponse.json({ error: "invalid_postal_code" }, { status: 400 });
  const postal = raw.replace(/^(\w{3})\s?(\w{3})$/, "$1 $2");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ postalcode: postal, countrycodes: "ca", format: "jsonv2", limit: "1" }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "fruiticana.com store locator (info@fruiticana.com)", "Accept-Language": "en-CA" },
      next: { revalidate: 86_400 },
    });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const [hit] = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (!hit) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(
      { lat: Number(hit.lat), lng: Number(hit.lon), label: postal },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (e) {
    console.error("[geocode]", e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
