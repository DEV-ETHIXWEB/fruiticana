"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + rise into view, once. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "article" | "span" } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Stagger container for lists of Reveal-like children. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/**
 * Word-by-word masked rise. The words are the real text (one clean sentence
 * for screen readers and search engines, no aria-label/duplicate copy).
 * Wrap a word in *asterisks* to render it in the accent style.
 *  - `immediate` (above the fold): pure CSS animation that starts on first
 *    paint, so it never waits for JavaScript and never delays LCP.
 *  - otherwise: reveals on scroll via Motion.
 */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className,
  accentClassName = "italic text-leaf",
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  accentClassName?: string;
  delay?: number;
  /** animate on first paint (heroes) instead of on scroll */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const tokens = text.split(/(\s+)/);
  let i = 0;

  const words = (render: (word: string, accent: boolean, index: number, key: number) => ReactNode) =>
    tokens.map((tok, idx) => {
      if (/^\s+$/.test(tok)) return " ";
      const accent = tok.startsWith("*") && tok.endsWith("*");
      const word = accent ? tok.slice(1, -1) : tok;
      // The mask is padded past the line box (and cancelled with negative margins, so layout is
      // unchanged): italic overhangs and descenders (the tail of a y, g, p) would otherwise be clipped.
      return (
        <span key={idx} className="-mx-[0.12em] -mt-[0.2em] -mb-[0.28em] inline-block overflow-hidden px-[0.12em] pt-[0.2em] pb-[0.28em] align-bottom">
          {render(word, accent, i++, idx)}
        </span>
      );
    });

  if (immediate) {
    return (
      <Tag className={className}>
        {words((word, accent, index) => (
          <span className={`split-word ${accent ? accentClassName : ""}`} style={{ animationDelay: `${delay + index * 0.06}s` }}>
            {word}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      >
        {words((word, accent) => (
          <motion.span
            className={`inline-block will-change-transform ${accent ? accentClassName : ""}`}
            variants={{ hidden: { y: "150%", rotate: 4 }, show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } } }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Vertical parallax drift tied to the element's scroll progress. */
export function Parallax({ children, className, amount = 60 }: { children: ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-amount, amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="relative h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Image that scales down from 1.15 as it scrolls in, the "lens settle" effect. */
export function ZoomSettle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.18, 1]);
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ scale }} className="relative h-full w-full origin-center will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Pointer-following pull for primary buttons. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const reduce = useReducedMotion();
  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Counts up when scrolled into view. Server-rendered with the final value for SEO/no-JS. */
export function Counter({ to, suffix = "", prefix = "", className, format = true }: { to: number; suffix?: string; prefix?: string; className?: string; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const fmt = (n: number) => (format ? Math.round(n).toLocaleString("en-CA") : String(Math.round(n)));
  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = `${prefix}${fmt(v)}${suffix}`;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt(to)}
      {suffix}
    </span>
  );
}
