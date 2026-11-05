"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Lenis inertia scrolling. Skipped for reduced-motion users and touch
 * devices (native momentum is already good there), and only downloaded where it runs,
 * so phones never load it.
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    let raf = 0;
    let cancelled = false;
    import("lenis").then(({ default: LenisClass }) => {
      if (cancelled) return;
      const l = new LenisClass({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -96 } });
      lenis.current = l;
      (window as unknown as { __lenis?: Lenis }).__lenis = l;
      const tick = (t: number) => {
        l.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis.current?.destroy();
      lenis.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Route change → start at the top instantly. Not on the first render: a full page load
  // keeps the position the browser (or the language switch) restored.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    lenis.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
