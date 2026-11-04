"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * One delegated listener turns the clicks Fruiticana cares about into analytics events,
 * without wiring every link: calls to a store, directions, language switches, and any
 * element marked `data-track="Event name"` (extra details from its data-track-* attributes).
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [data-track]");
      if (!el) return;
      const page = window.location.pathname;
      const marked = el.closest<HTMLElement>("[data-track]");
      if (marked) {
        const data: Record<string, string> = { page };
        for (const [k, v] of Object.entries(marked.dataset)) if (k.startsWith("track") && k !== "track" && v) data[k.slice(5).toLowerCase()] = v;
        track(marked.dataset.track!, data);
        return;
      }
      const href = el.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("Call", { page });
      else if (/google\.[^/]+\/maps/.test(href)) track("Directions", { page });
      else if (el.hasAttribute("hreflang")) track("Language switch", { to: el.getAttribute("hreflang") ?? "", page });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
