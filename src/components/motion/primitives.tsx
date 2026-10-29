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
 * Word-by-word masked rise. Words stay real text (SEO + screen readers read
 * the plain string via aria-label; spans are aria-hidden).
 * Wrap a word in *asterisks* to render it in the italic accent style.
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
  /** animate on mount (hero) instead of on scroll */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const plain = text.replace(/\*/g, "");
  const tokens = text.split(/(\s+)/);
  let i = 0;
  const animateProps = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <Tag className={className} aria-label={plain}>
      <motion.span
        aria-hidden
        className="block"
        initial={reduce ? false : "hidden"}
        {...animateProps}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      >
        {tokens.map((tok, idx) => {
          if (/^\s+$/.test(tok)) return " ";
          const accent = tok.startsWith("*") && tok.endsWith("*");
          const word = accent ? tok.slice(1, -1) : tok;
          i++;
          return (
            <span key={idx} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
              <motion.span
                className={`inline-block will-change-transform ${accent ? accentClassName : ""}`}
                variants={{ hidden: { y: "105%", rotate: 4 }, show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } } }}
                data-i={i}
              >
                {word}
              </motion.span>
            </span>
          );
        })}
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

/** Hand-drawn brush underline (echoes the red swash under the logo). */
export function BrushUnderline({ className, color = "var(--color-chili)", delay = 0.4 }: { className?: string; color?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d="M3 13.5c38-6.2 79-8.6 121-8.2 44 .4 87 3.2 128 4.4 15 .4 30 .3 45-.9M18 16.2c52-3.4 110-4.4 168-2.8"
        fill="none"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay }}
      />
    </svg>
  );
}
