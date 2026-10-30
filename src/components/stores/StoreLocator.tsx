"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadMapLibre, MAP_STYLE } from "@/lib/map/load";
import { Icon } from "@/components/ui/Icon";
import type { Store } from "@/lib/content/types";
import { distanceKm, formatKm, POSTAL_RE } from "@/lib/geo";
import { formatHours } from "@/lib/hours";
import { OpenBadge } from "./NearestStore";


type Origin = { lat: number; lng: number; label: string } | null;

const directions = (s: Store) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Fruiticana ${s.street}, ${s.locality}, ${s.province}`)}`;

export function StoreLocator({ stores }: { stores: Store[] }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("All");
  const [origin, setOrigin] = useState<Origin>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  // MapLibre is heavy: phones load it only when the Map tab is opened, desktops once the browser is idle.
  const [mapWanted, setMapWanted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const showMap = useCallback(() => {
    setMapWanted(true);
    setView("map");
  }, []);

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const listRefs = useRef(new Map<string, HTMLLIElement>());

  const cities = useMemo(() => ["All", ...[...new Set(stores.map((s) => s.city))].sort()], [stores]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    // A postal code typed into the box drives distance sorting instead of text matching.
    const textFilter = q && !POSTAL_RE.test(q) ? q : "";
    const list = stores.filter(
      (s) =>
        (city === "All" || s.city === city) &&
        (!textFilter || [s.name, s.street, s.locality, s.city, s.postalCode ?? "", s.province].join(" ").toLowerCase().includes(textFilter)),
    );
    const withKm = list.map((s) => ({ s, km: origin ? distanceKm(origin, s) : null }));
    if (origin) withKm.sort((a, b) => a.km! - b.km!);
    else withKm.sort((a, b) => Number(Boolean(a.s.isHeadOffice)) - Number(Boolean(b.s.isHeadOffice)));
    return withKm;
  }, [stores, query, city, origin]);

  /* ------------------------------ map ------------------------------ */
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setMapWanted(true));
    return () => cancelIdle(id);
  }, []);

  useEffect(() => {
    if (!mapWanted) return;
    let cancelled = false;
    const pins = markers.current;
    (async () => {
      const ml = await loadMapLibre();
      if (cancelled || !mapEl.current) return;
      const m = new ml.Map({
        container: mapEl.current,
        style: MAP_STYLE,
        center: [-122.85, 49.15],
        zoom: 9.4,
        attributionControl: { compact: true },
        cooperativeGestures: window.matchMedia("(pointer: coarse)").matches,
      });
      m.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      map.current = m;

      for (const s of stores) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "fr-pin";
        el.setAttribute("aria-label", `Fruiticana ${s.name}`);
        el.innerHTML = `<span class="fr-pin-dot${s.isHeadOffice ? " is-office" : ""}"><img src="/brand/mark.png" alt="" /></span>`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelected(s.slug);
        });
        const marker = new ml.Marker({ element: el, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(m);
        pins.set(s.slug, marker);
      }
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      pins.clear();
      setMapReady(false);
    };
  }, [stores, mapWanted]);

  // Reflect filters on the map: hide filtered-out pins and frame the rest.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const visible = new Set(results.map((r) => r.s.slug));
    markers.current.forEach((mk, slug) => {
      mk.getElement().style.display = visible.has(slug) ? "" : "none";
    });
    if (!results.length || selected) return;
    loadMapLibre().then((ml) => {
      const b = new ml.LngLatBounds();
      results.slice(0, origin ? 5 : results.length).forEach(({ s }) => b.extend([s.lng, s.lat]));
      if (origin) b.extend([origin.lng, origin.lat]);
      m.fitBounds(b, { padding: 70, maxZoom: 13, duration: 900 });
    });
  }, [results, origin, selected, mapReady]);

  // Selection: fly to pin, highlight it, scroll its card into view.
  useEffect(() => {
    markers.current.forEach((mk, slug) => mk.getElement().classList.toggle("is-active", slug === selected));
    if (!selected) return;
    const s = stores.find((x) => x.slug === selected);
    if (s && map.current) map.current.flyTo({ center: [s.lng, s.lat], zoom: 13.5, duration: 1100, essential: true });
    listRefs.current.get(selected)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected, stores, mapReady]);

  // The map lives in a hidden panel on mobile until "Map" is tapped; re-measure when it appears.
  useEffect(() => {
    const t = setTimeout(() => map.current?.resize(), 30);
    return () => clearTimeout(t);
  }, [view]);

  // "You are here" marker
  useEffect(() => {
    if (!origin || !map.current) return;
    let mk: Marker | undefined;
    loadMapLibre().then((ml) => {
      const el = document.createElement("div");
      el.className = "fr-me";
      mk = new ml.Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map.current!);
    });
    return () => {
      mk?.remove();
    };
  }, [origin, mapReady]);

  /* --------------------------- actions ----------------------------- */
  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return setNotice("Location isn’t available in this browser.");
    setBusy(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude, label: "your location" });
        setSelected(null);
        setCity("All");
        setBusy(false);
      },
      () => {
        setBusy(false);
        setNotice("We couldn’t get your location. Try entering your postal code.");
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!POSTAL_RE.test(q)) return;
    setBusy(true);
    setNotice(null);
    try {
      const r = await fetch(`/api/geocode?postal=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { lat: number; lng: number; label: string };
      setOrigin(data);
      setSelected(null);
      setCity("All");
    } catch {
      setNotice("We couldn’t find that postal code. Check it, or use your location.");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setOrigin(null);
    setQuery("");
    setSelected(null);
    setNotice(null);
  };

  /* ----------------------------- UI -------------------------------- */
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/[0.07] shadow-[0_40px_100px_-50px_rgb(15_59_38/0.5)]">
      <div className="border-b border-ink/[0.07] p-4 sm:p-5">
        <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row" role="search">
          <label htmlFor="store-q" className="sr-only">
            Search by postal code, city or street
          </label>
          <div className="flex flex-1 items-center gap-3 rounded-full bg-cream px-5 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-leaf">
            <Icon name="search" className="size-5 shrink-0 text-muted" />
            <input
              id="store-q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              placeholder="Postal code, city or street"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-[0.95rem] outline-none placeholder:text-muted"
              autoComplete="postal-code"
            />
            {(query || origin) && (
              <button type="button" onClick={clear} className="text-sm font-medium text-muted hover:text-ink">
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {POSTAL_RE.test(query.trim()) && (
              <button type="submit" disabled={busy} className="btn-3d btn-chili rounded-full bg-chili px-5 py-3 text-sm font-semibold text-white hover:bg-chili-deep">
                Find nearby
              </button>
            )}
            <button type="button" onClick={locate} disabled={busy} className="inline-flex flex-1 items-center justify-center btn-3d btn-forest gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-forest-deep md:flex-none">
              {busy ? <span className="size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" /> : <Icon name="locate" className="size-4" strokeWidth={2} />}
              Near me
            </button>
          </div>
        </form>
        <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5" role="group" aria-label="Filter by city">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCity(c);
                setSelected(null);
              }}
              aria-pressed={city === c}
              className={`shrink-0 rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors ${city === c ? "bg-leaf text-white" : "bg-cream text-ink/75 hover:text-ink"}`}
            >
              {c}
              {c !== "All" && <span className={`ml-1.5 ${city === c ? "text-white/90" : "text-muted"}`}>{stores.filter((s) => s.city === c).length}</span>}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {(notice || origin) && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 px-1 text-sm text-ink-soft" aria-live="polite">
              {notice ?? `Sorted by distance from ${origin!.label}.`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* mobile view switch */}
      <div className="grid grid-cols-2 border-b border-ink/[0.07] lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button key={v} type="button" onClick={() => (v === "map" ? showMap() : setView(v))} aria-pressed={view === v} className={`py-3 text-sm font-semibold capitalize ${view === v ? "bg-cream text-forest" : "text-muted"}`}>
            {v === "list" ? `List · ${results.length}` : "Map"}
          </button>
        ))}
      </div>

      <div className="grid lg:h-[clamp(26rem,calc(100svh-24rem),44rem)] lg:grid-cols-[26rem_1fr]">
        <ul className={`overflow-y-auto overscroll-contain lg:block ${view === "list" ? "block max-h-[70vh] lg:max-h-none" : "hidden"}`} data-lenis-prevent aria-label={`${results.length} stores`}>
          {results.length === 0 && <li className="p-8 text-center text-ink-soft">No stores match “{query}”. Try a city like Surrey or Calgary.</li>}
          {results.map(({ s, km }) => (
            <li
              key={s.slug}
              ref={(el) => {
                if (el) listRefs.current.set(s.slug, el);
                else listRefs.current.delete(s.slug);
              }}
              className={`border-b border-ink/[0.06] transition-colors ${selected === s.slug ? "bg-turmeric/25" : "hover:bg-cream/70"}`}
              onMouseEnter={() => markers.current.get(s.slug)?.getElement().classList.add("is-hover")}
              onMouseLeave={() => markers.current.get(s.slug)?.getElement().classList.remove("is-hover")}
            >
              <div className="flex gap-4 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(s.slug);
                    showMap();
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-xl leading-tight text-ink">{s.isHeadOffice ? "Head Office" : s.name}</span>
                    {km != null && <span className="shrink-0 text-xs font-semibold text-leaf">{formatKm(km)}</span>}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {s.street}, {s.locality}, {s.province} {s.postalCode}
                  </span>
                  <OpenBadge store={s} className="text-ink-soft" />
                  <span className="sr-only">, show on the map</span>
                </button>
              </div>
              <div className="-mt-2 flex flex-wrap gap-x-5 gap-y-2 px-5 pb-5 text-[0.82rem] font-semibold">
                <a href={`tel:+1${s.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 text-forest hover:text-leaf">
                  <Icon name="phone" className="size-3.5" /> {s.phone}
                </a>
                <a href={directions(s)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-forest hover:text-leaf">
                  <Icon name="directions" className="size-3.5" /> Directions
                </a>
                <Link href={`/storefinder/${s.slug}`} className="inline-flex items-center gap-1.5 text-chili-deep hover:text-chili">
                  Store details <Icon name="chevron" className="size-3.5" strokeWidth={2} />
                </Link>
                <span className="inline-flex items-center gap-1.5 font-normal text-muted">
                  <Icon name="clock" className="size-3.5" /> {formatHours(s)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className={`relative min-h-[60vh] bg-paper lg:block lg:min-h-0 ${view === "map" ? "block" : "hidden"}`}>
          {/* MapLibre forces position:relative on its container, so size it from an absolute wrapper */}
          <div className="absolute inset-0">
            <div ref={mapEl} className="h-full w-full" aria-label="Map of Fruiticana stores" role="region" />
          </div>
        </div>
      </div>
    </div>
  );
}
