"use client";

import { Icon } from "@/components/ui/Icon";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }}
      className="group inline-flex items-center gap-1.5 hover:text-cream"
    >
      Back to top
      <Icon name="chevron" className="size-3.5 -rotate-90 transition-transform group-hover:-translate-y-0.5" strokeWidth={2} />
    </button>
  );
}
