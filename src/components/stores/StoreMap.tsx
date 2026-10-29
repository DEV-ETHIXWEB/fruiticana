"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadMapLibre, MAP_STYLE } from "@/lib/map/load";

/** Single-store map for store pages. Scroll-zoom off so the page scrolls normally. */
export function StoreMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;
    loadMapLibre().then((ml) => {
      if (cancelled || !el.current) return;
      map = new ml.Map({ container: el.current, style: MAP_STYLE, center: [lng, lat], zoom: 14.2, scrollZoom: false, attributionControl: { compact: true } });
      map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      const pin = document.createElement("div");
      pin.className = "fr-pin is-active";
      pin.innerHTML = `<span class="fr-pin-dot"><img src="/brand/mark.png" alt="" /></span>`;
      new ml.Marker({ element: pin, anchor: "bottom" }).setLngLat([lng, lat]).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng]);
  return (
    <div className="absolute inset-0">
      <div ref={el} className="h-full w-full" role="img" aria-label={`Map showing ${label}`} />
    </div>
  );
}
