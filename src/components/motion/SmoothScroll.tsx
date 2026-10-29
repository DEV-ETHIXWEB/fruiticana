"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Lenis inertia scrolling. Skipped for reduced-motion users and touch
 * devices (native momentum is already good there).
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -96 } });
    lenis.current = l;
    (window as unknown as { __lenis?: Lenis }).__lenis = l;
    let raf = 0;
    const tick = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Route change → start at the top instantly.
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
