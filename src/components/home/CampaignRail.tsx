"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CampaignBanner } from "@/lib/content/types";

const DURATION = 6500;

export function CampaignRail({ items }: { items: CampaignBanner[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduce = useReducedMotion();
  const started = useRef(0);
  const elapsed = useRef(0);

  const go = useCallback(
    (next: number, d = next > index ? 1 : -1) => {
      setDir(d);
      setIndex((next + items.length) % items.length);
      elapsed.current = 0;
      setProgress(0);
    },
    [index, items.length],
  );

  // rAF-driven timer so the progress bar and the slide change never drift apart.
  useEffect(() => {
    if (reduce || paused || items.length < 2) return;
    let raf = 0;
    started.current = performance.now() - elapsed.current;
    const tick = (t: number) => {
      elapsed.current = t - started.current;
      const p = Math.min(1, elapsed.current / DURATION);
      setProgress(p);
      if (p >= 1) {
        go(index + 1, 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, reduce, go, items.length]);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!items.length) return null;
  const current = items[index];

  return (
    <section aria-roledescription="carousel" aria-label="Current campaigns" className="container-x py-[clamp(3rem,8svh,5rem)]">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-chili-deep">In store now</p>
          <h2 className="mt-3 font-display text-title text-forest">What’s fresh at Fruiticana</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(index - 1, -1)} className="grid size-12 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-forest hover:text-cream hover:ring-forest" aria-label="Previous banner">
            <Icon name="chevron" className="size-5 rotate-180" strokeWidth={2} />
          </button>
          <button type="button" onClick={() => go(index + 1, 1)} className="grid size-12 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-forest hover:text-cream hover:ring-forest" aria-label="Next banner">
            <Icon name="chevron" className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[var(--radius-card)] bg-paper shadow-[0_30px_80px_-40px_rgb(15_59_38/0.45)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="relative aspect-[1800/517]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={current.id}
              custom={dir}
              className="absolute inset-0"
              variants={{
                enter: (d: number) => ({ clipPath: d > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", scale: 1.06 }),
                center: { clipPath: "inset(0 0 0 0%)", scale: 1 },
                exit: (d: number) => ({ opacity: 0.4, x: d > 0 ? "-12%" : "12%" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0 : 1.05, ease: [0.76, 0, 0.24, 1] }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(index + 1, 1);
                else if (info.offset.x > 60) go(index - 1, -1);
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}: ${current.label}`}
            >
              {current.href ? (
                <Link href={current.href} draggable={false} className="relative block size-full">
                  <Image src={current.image.src} alt={current.image.alt} fill sizes="(min-width: 1408px) 1344px, 100vw" className="object-contain" draggable={false} preload={index === 0} quality={90} />
                </Link>
              ) : (
                <Image src={current.image.src} alt={current.image.alt} fill sizes="100vw" className="object-contain" draggable={false} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Segmented progress doubles as the slide picker; the active slide's full title sits beneath (never truncated). */}
      <div className="mt-5 grid gap-x-2 sm:gap-x-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <button key={item.id} type="button" onClick={() => go(i)} className="group py-2" aria-label={`Show ${item.label}`} aria-current={i === index}>
            <span className="block h-[3px] overflow-hidden rounded-full bg-ink/10 transition-colors group-hover:bg-ink/20">
              <span
                className="block h-full origin-left rounded-full bg-chili"
                style={{ transform: `scaleX(${i < index ? 1 : i === index ? (reduce ? 1 : progress) : 0})`, opacity: i < index ? 0.35 : 1 }}
              />
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 flex items-baseline gap-3 text-sm" aria-live="polite">
        <span className="font-display text-muted tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <span className="font-semibold text-ink">{current.label}</span>
      </p>
    </section>
  );
}
