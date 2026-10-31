"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadMapLibre, MAP_STYLE } from "@/lib/map/load";

/**
 * Single-store map for store and contact pages. Scroll-zoom off so the page scrolls normally.
 * MapLibre (several hundred KB) is only fetched once the map is about to scroll into view,
 * so it never competes with the page's first paint.
 */
export function StoreMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        init();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(node);
    const init = () => loadMapLibre().then((ml) => {
      if (cancelled || !el.current) return;
      map = new ml.Map({ container: el.current, style: MAP_STYLE, center: [lng, lat], zoom: 14.2, scrollZoom: false, attributionControl: { compact: true } });
      map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      const pin = document.createElement("div");
      pin.className = "fr-pin is-active";
      pin.innerHTML = `<span class="fr-pin-dot"><img src="/brand/mark.svg" alt="" /></span>`;
      new ml.Marker({ element: pin, anchor: "bottom" }).setLngLat([lng, lat]).addTo(map);
    });
    return () => {
      cancelled = true;
      io.disconnect();
      map?.remove();
    };
  }, [lat, lng]);
  return (
    <div className="absolute inset-0">
      <div ref={el} className="h-full w-full" role="img" aria-label={`Map showing ${label}`} />
    </div>
  );
}
