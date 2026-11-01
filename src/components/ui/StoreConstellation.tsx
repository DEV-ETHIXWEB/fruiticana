import Link from "@/i18n/Link";
import type { Store } from "@/lib/content/types";

type Box = { minLng: number; maxLng: number; minLat: number; maxLat: number };

export const LOWER_MAINLAND: Box = { minLng: -123.16, maxLng: -122.27, minLat: 49.01, maxLat: 49.29 };
const LABEL_PLACEMENT: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  Surrey: { dx: 34, dy: 30, anchor: "start" },
  "New Westminster": { dx: 9, dy: 3, anchor: "start" },
  Vancouver: { dx: 0, dy: -12, anchor: "middle" },
  Richmond: { dx: 0, dy: 16, anchor: "middle" },
  "Port Coquitlam": { dx: 0, dy: -12, anchor: "middle" },
  Abbotsford: { dx: 0, dy: -12, anchor: "middle" },
};

export const ALBERTA: Box = { minLng: -114.35, maxLng: -113.1, minLat: 50.95, maxLat: 53.55 };

/**
 * A quiet, typographic map: each store is a dot placed by its real
 * coordinates (equirectangular, latitude-corrected). No tiles, no API key,
 * zero JS, it renders on the server.
 */
export function StoreConstellation({
  stores,
  box = LOWER_MAINLAND,
  width = 360,
  className = "",
  tone = "dark",
  labels = true,
  linkDots = false,
}: {
  stores: Store[];
  box?: Box;
  width?: number;
  className?: string;
  tone?: "dark" | "light";
  labels?: boolean;
  linkDots?: boolean;
}) {
  const midLat = ((box.minLat + box.maxLat) / 2) * (Math.PI / 180);
  const spanX = (box.maxLng - box.minLng) * Math.cos(midLat);
  const spanY = box.maxLat - box.minLat;
  const height = Math.round((width * spanY) / spanX);
  const pad = 14;
  const project = (s: Store) => ({
    x: pad + ((s.lng - box.minLng) * Math.cos(midLat) * (width - pad * 2)) / spanX,
    y: pad + ((box.maxLat - s.lat) * (height - pad * 2)) / spanY,
  });

  const inside = stores.filter((s) => s.lng >= box.minLng && s.lng <= box.maxLng && s.lat >= box.minLat && s.lat <= box.maxLat && !s.isHeadOffice);
  const office = stores.find((s) => s.isHeadOffice && s.lng >= box.minLng && s.lng <= box.maxLng && s.lat >= box.minLat && s.lat <= box.maxLat);

  // One label per city, positioned at the city's centroid.
  const cities = new Map<string, { x: number; y: number; n: number }>();
  for (const s of inside) {
    const p = project(s);
    const c = cities.get(s.locality) ?? { x: 0, y: 0, n: 0 };
    cities.set(s.locality, { x: c.x + p.x, y: c.y + p.y, n: c.n + 1 });
  }

  const dot = tone === "dark" ? "var(--color-turmeric)" : "var(--color-chili)";
  const ink = tone === "dark" ? "rgb(250 245 234 / 0.72)" : "rgb(28 26 21 / 0.6)";
  const grid = tone === "dark" ? "rgb(250 245 234 / 0.07)" : "rgb(28 26 21 / 0.07)";
  const halo = tone === "dark" ? "#0d2a1b" : "#f6d21c";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label={`Map of ${inside.length} Fruiticana stores`}>
      <defs>
        <pattern id={`g-${tone}-${width}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill={grid} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#g-${tone}-${width})`} />
      {labels &&
        [...cities.entries()].map(([name, c]) => {
          // Hand-placed so labels never sit on a dot (Surrey is a dense cluster, New West hugs Vancouver).
          const place = LABEL_PLACEMENT[name] ?? { dx: 0, dy: -12, anchor: "middle" as const };
          const fs = Math.max(8.5, width / 52);
          return (
            <text
              key={name}
              x={c.x / c.n + place.dx * (width / 360)}
              y={c.y / c.n + place.dy * (width / 360)}
              textAnchor={place.anchor}
              fontSize={fs}
              letterSpacing="1.4"
              fill={ink}
              stroke={halo}
              strokeWidth={fs * 0.45}
              strokeLinejoin="round"
              paintOrder="stroke"
              style={{ textTransform: "uppercase", fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              {name}
            </text>
          );
        })}
      {office && (() => {
        const p = project(office);
        return (
          <g>
            <rect x={p.x - 3.5} y={p.y - 3.5} width="7" height="7" transform={`rotate(45 ${p.x} ${p.y})`} fill="none" stroke={dot} strokeWidth="1.2" />
          </g>
        );
      })()}
      {inside.map((s, i) => {
        const p = project(s);
        const circle = (
          <g key={s.slug}>
            <circle cx={p.x} cy={p.y} r="7" fill={dot} opacity="0.14">
              <animate attributeName="r" values="3;9;3" dur="3.2s" begin={`${(i % 7) * 0.45}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3.2s" begin={`${(i % 7) * 0.45}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={p.x} cy={p.y} r="3" fill={dot} />
            <title>{`Fruiticana ${s.name}, ${s.street}`}</title>
          </g>
        );
        return linkDots ? (
          <Link key={s.slug} href={`/storefinder/${s.slug}`} aria-label={`Fruiticana ${s.name}`}>
            {circle}
          </Link>
        ) : (
          circle
        );
      })}
    </svg>
  );
}
