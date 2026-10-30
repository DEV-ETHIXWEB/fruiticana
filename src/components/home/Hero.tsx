"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/Button";
import type { Img } from "@/lib/content/types";

const produce = ["Okra", "Guava", "Sugarcane", "Rajan mangoes", "Karela", "Methi", "Indican spices", "Fresh paneer", "Basmati", "Lentils & dals", "Tinda", "Curry leaves", "Jaggery", "Kesar"];

/**
 * First screen. From `lg` up the section is exactly one viewport tall and
 * every size (headline, collage) is bound by viewport *height* as well as
 * width, so the whole hero, marquee included, is visible without scrolling
 * on any laptop or desktop screen.
 */
export function Hero({ storeCount, produceFloor, firstStore, spiceAisle }: { storeCount: number; produceFloor: Img; firstStore: Img; spiceAisle: Img }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yMain = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90]);
  const ySmall = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const ySpice = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 130]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section ref={ref} className="relative flex flex-col overflow-hidden pt-24 lg:h-[100svh] lg:max-h-[68rem] lg:min-h-[40rem] lg:pt-28">
      {/* soft sun wash */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.35),transparent_65%)] blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute top-[40%] left-[-15%] size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(24_161_79/0.12),transparent_65%)] blur-2xl" />

      <div className="container-x relative grid flex-1 items-center gap-8 pb-8 lg:min-h-0 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-[clamp(1.5rem,4svh,3rem)]">
        <div className="relative z-10">
          <h1 className="eyebrow enter-rise text-leaf">Fruiticana · {storeCount} Grocery Stores in BC &amp; Alberta</h1>

          <div className="relative mt-[clamp(1rem,2.5svh,1.5rem)]">
            <SplitHeading
              as="p"
              immediate
              delay={0.15}
              text="The taste of *home,* fresh every day."
              className="font-display text-[clamp(2.75rem,min(7vw,10.5svh),8.25rem)] leading-[0.94] tracking-[-0.035em] text-forest"
              accentClassName="brush-underline italic font-normal text-chili [font-variation-settings:'SOFT'_100]"
            />
          </div>

          <p className="enter-rise mt-[clamp(1.5rem,4svh,2.5rem)] max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg" style={{ animationDelay: "0.55s" }}>
            Quality fresh fruits, vegetables and spices at the best price: the flavours of India alongside the best of local farms, since our first Surrey store opened in 1994.
          </p>

          <div className="enter-rise mt-[clamp(1.25rem,3.5svh,2.25rem)] flex flex-wrap items-center gap-2 sm:gap-3" style={{ animationDelay: "0.7s" }}>
            <ButtonLink href="/flyers" variant="chili" size="fluid">
              <span className="sm:hidden">Weekly specials</span>
              <span className="hidden sm:inline">This week’s specials</span>
            </ButtonLink>
            <ButtonLink href="/storefinder" variant="ghost" size="fluid">
              <span className="sm:hidden">Find a store</span>
              <span className="hidden sm:inline">Find your store</span>
            </ButtonLink>
          </div>
        </div>

        {/*
          Photo collage (Fruiticana's own photography).
          Phones/tablets: a wide, shallow frame. lg+: a near-square frame whose
          height is capped by the viewport so it never pushes past the fold.
        */}
        <div className="relative mx-auto aspect-[16/10] w-full sm:aspect-[16/9] lg:mr-0 lg:aspect-[1/1.02] lg:h-[min(38rem,calc(100svh-15rem))] lg:w-auto lg:max-w-full">
          <motion.div style={{ y: yMain }} className="absolute top-0 right-0 h-[90%] w-[78%] lg:h-[74%] lg:w-[86%]">
            <div className="enter-unmask relative size-full overflow-hidden rounded-[1.5rem] shadow-[0_40px_90px_-30px_rgb(15_59_38/0.5)] lg:rounded-[2rem]">
              <Image src={produceFloor.src} alt={produceFloor.alt} fill preload fetchPriority="high" sizes="(min-width: 1024px) 38vw, 78vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/35 via-transparent to-transparent" />
            </div>
          </motion.div>

          <motion.div style={{ y: ySmall }} className="absolute bottom-[2%] left-[1%] w-[42%] lg:left-0 lg:w-[52%]">
          <figure className="enter-drop rounded-xl bg-white p-1.5 pb-2 shadow-[0_30px_60px_-20px_rgb(28_26_21/0.45)] sm:p-2.5 sm:pb-3 lg:rounded-2xl">
            <div className="relative aspect-[989/660] overflow-hidden rounded-lg lg:rounded-xl">
              <Image src={firstStore.src} alt={firstStore.alt} fill sizes="(min-width: 1024px) 20vw, 42vw" className="object-cover grayscale-[0.15]" />
            </div>
            <figcaption className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-1 sm:mt-2.5 sm:px-1.5">
              <span className="hidden font-display text-[0.95rem] whitespace-nowrap text-ink italic sm:inline">Where it began</span>
              <span className="text-[0.75rem] tracking-[0.16em] whitespace-nowrap text-muted uppercase sm:text-[0.75rem]">Surrey · 1994</span>
            </figcaption>
          </figure>
          </motion.div>

          <motion.div style={{ y: ySpice }} className="absolute right-[6%] bottom-[-4%] hidden aspect-square w-[30%] lg:block">
            <div className="enter-pop relative size-full overflow-hidden rounded-full ring-8 ring-cream" style={{ animationDelay: "0.7s" }}>
              <Image src={spiceAisle.src} alt={spiceAisle.alt} fill sizes="12rem" className="scale-125 object-cover" />
            </div>
          </motion.div>

          {/* rotating seal */}
          <motion.div
            style={{ rotate }}
            className="absolute top-[4%] left-[6%] size-[clamp(4.5rem,18vw,6rem)] lg:top-[56%] lg:left-[40%] lg:size-32 lg:-translate-x-1/2 lg:-translate-y-1/2"
            aria-hidden
          >
            <div className="enter-pop relative grid size-full place-items-center" style={{ animationDelay: "0.9s" }}>
            <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite]">
              <defs>
                <path id="seal" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="var(--color-turmeric)" />
              <text fontSize="10" fontWeight="600" fill="var(--color-forest)" style={{ textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
                <textPath href="#seal" textLength="286" lengthAdjust="spacing">Fruiticana hee jaana · fresh hai na ·</textPath>
              </text>
            </svg>
            <Image src="/brand/mark.png" alt="" width={118} height={118} className="relative w-[38%]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* produce marquee */}
      <div className="relative shrink-0 border-y border-ink/10 bg-paper/60 py-4 lg:py-[clamp(0.75rem,2svh,1.25rem)]" aria-hidden>
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap [--marquee-duration:60s]">
            {[...produce, ...produce].map((w, i) => (
              <span key={i} className="flex items-center font-display text-2xl text-forest/85 italic lg:text-[clamp(1.5rem,3.4svh,1.875rem)]">
                <span className="px-7">{w}</span>
                <svg viewBox="0 0 20 20" className="size-3.5 text-mango" fill="currentColor">
                  <path d="M10 0c.8 5.6 4.4 9.2 10 10-5.6.8-9.2 4.4-10 10-.8-5.6-4.4-9.2-10-10 5.6-.8 9.2-4.4 10-10Z" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
