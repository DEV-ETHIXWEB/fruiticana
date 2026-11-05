"use client";

import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Components animate with the lightweight `m` elements; the animation engine downloads
 * separately once the page is up. `strict` makes a stray full `motion.*` element an error,
 * so the engine never slips back into the first download.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
