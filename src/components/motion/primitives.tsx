"use client";

import { m, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_CSS = `cubic-bezier(${EASE.join(", ")})`;
/* Close match to EASE for number tweens (an expo ease-out) */
const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* Fades use the browser's own Web Animations API, so no animation library loads for them. */
const rise = (el: HTMLElement, y: number, duration: number, delay: number) =>
  el
    .animate([{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "translateY(0px)" }], { duration: duration * 1000, delay: delay * 1000, easing: EASE_CSS, fill: "both" })
    .finished.then(() => {
      el.style.opacity = "";
      el.style.transform = "";
    })
    .catch(() => {});

/*
 * Scroll reveals are progressive enhancement. The server HTML is always fully visible, so
 * first-screen content paints (and counts for LCP) without waiting for JavaScript. After
 * hydration, only elements that are still below the fold are hidden and then animated in
 * as they scroll into view; anything already on screen is left exactly as rendered.
 */
const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.88;

function onEnter(el: Element, run: () => void) {
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      run();
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Fade-and-rise on scroll (see note above: never hides first-screen content). */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  id,
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "article" | "span"; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce || !belowFold(el)) return;
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
    return onEnter(el, () => {
      rise(el, y, 0.9, delay);
    });
  }, [reduce, y, delay]);
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

/** Stagger container: its <MotionItem> children rise in one after another on scroll. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce || !belowFold(el)) return;
    const items = [...el.querySelectorAll<HTMLElement>(":scope > [data-stagger-item]")];
    items.forEach((it) => {
      it.style.opacity = "0";
      it.style.transform = "translateY(24px)";
    });
    return onEnter(el, () => {
      items.forEach((it, i) => rise(it, 24, 0.8, i * gap));
    });
  }, [reduce, gap]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

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
  // Long sentences (quotes, Punjabi copy) would take seconds to finish at a fixed per-word
  // delay: cap the whole stagger at ~1.2s, keeping the 0.06s rhythm for short headings.
  const step = Math.min(0.06, 1.2 / Math.max(1, tokens.filter((x) => x.trim()).length));
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
          <span className={`split-word ${accent ? accentClassName : ""}`} style={{ animationDelay: `${delay + index * step}s` }}>
            {word}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <m.span
        className="block"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }}
      >
        {words((word, accent) => (
          <m.span
            className={`inline-block will-change-transform ${accent ? accentClassName : ""}`}
            variants={{ hidden: { y: "150%", rotate: 4 }, show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } } }}
          >
            {word}
          </m.span>
        ))}
      </m.span>
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
      <m.div style={{ y }} className="relative h-full w-full will-change-transform">
        {children}
      </m.div>
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
      <m.div style={{ scale }} className="relative h-full w-full origin-center will-change-transform">
        {children}
      </m.div>
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
    <m.span
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
    </m.span>
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
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1800);
      el.textContent = `${prefix}${fmt(to * easeOut(t))}${suffix}`;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
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
