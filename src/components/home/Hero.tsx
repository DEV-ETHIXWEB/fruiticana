"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { BrushUnderline, SplitHeading } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/Button";
import type { Img } from "@/lib/content/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const produce = ["Okra", "Guava", "Sugarcane", "Rajan mangoes", "Karela", "Methi", "Indican spices", "Fresh paneer", "Basmati", "Lentils & dals", "Tinda", "Curry leaves", "Jaggery", "Kesar"];

export function Hero({ storeCount, produceFloor, firstStore, spiceAisle }: { storeCount: number; produceFloor: Img; firstStore: Img; spiceAisle: Img }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yMain = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const ySmall = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -90]);
  const ySpice = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 lg:pt-32">
      {/* soft sun wash */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.35),transparent_65%)] blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute top-[40%] left-[-15%] size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(24_161_79/0.12),transparent_65%)] blur-2xl" />

      <div className="container-x relative grid items-center gap-14 pb-16 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:pb-24">
        <div className="relative z-10">
          <motion.h1
            className="eyebrow text-leaf"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            Fruiticana · {storeCount} Grocery Stores in BC &amp; Alberta
          </motion.h1>

          <div className="relative mt-6">
            <SplitHeading
              as="p"
              immediate
              delay={0.15}
              text="The taste of *home,* fresh every day."
              className="font-display text-display tracking-[-0.035em] text-forest"
              accentClassName="italic font-normal text-chili [font-variation-settings:'SOFT'_100,'WONK'_1]"
            />
            <BrushUnderline className="absolute -bottom-3 left-[4%] h-4 w-[52%] sm:w-[44%]" delay={1.1} />
          </div>

          <motion.p
            className="mt-9 max-w-xl text-lg leading-relaxed text-ink-soft"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          >
            Quality fresh fruits, vegetables and spices at the best price: the flavours of India alongside the best of local farms, since our first Surrey store opened in 1994.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          >
            <ButtonLink href="/flyers" variant="chili">This week’s specials</ButtonLink>
            <ButtonLink href="/storefinder" variant="ghost">Find your store</ButtonLink>
          </motion.div>
        </div>

        {/* Photo collage, all Fruiticana’s own photography */}
        <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[38rem] lg:mr-0">
          <motion.div
            style={{ y: yMain }}
            initial={reduce ? false : { opacity: 0, scale: 0.94, clipPath: "inset(12% 12% 12% 12% round 2rem)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
            className="absolute top-0 right-0 h-[74%] w-[86%] overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-30px_rgb(15_59_38/0.5)]"
          >
            <Image src={produceFloor.src} alt={produceFloor.alt} fill priority sizes="(min-width: 1024px) 38vw, 86vw" className="object-cover" quality={90} />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/35 via-transparent to-transparent" />
          </motion.div>

          <motion.figure
            style={{ y: ySmall }}
            initial={reduce ? false : { opacity: 0, y: 60, rotate: -9 }}
            animate={{ opacity: 1, y: 0, rotate: -5 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
            className="absolute bottom-[2%] left-0 w-[52%] rounded-2xl bg-white p-2.5 pb-3 shadow-[0_30px_60px_-20px_rgb(28_26_21/0.45)]"
          >
            <div className="relative aspect-[989/660] overflow-hidden rounded-xl">
              <Image src={firstStore.src} alt={firstStore.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover grayscale-[0.15]" />
            </div>
            <figcaption className="mt-2.5 flex items-baseline justify-between px-1.5 font-display text-[0.95rem] text-ink">
              <span className="italic">Where it began</span>
              <span className="font-sans text-[0.7rem] tracking-[0.18em] text-muted uppercase">Surrey · 1994</span>
            </figcaption>
          </motion.figure>

          <motion.div
            style={{ y: ySpice }}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.7 }}
            className="absolute right-[6%] bottom-[-4%] hidden aspect-square w-[30%] overflow-hidden rounded-full ring-8 ring-cream sm:block"
          >
            <Image src={spiceAisle.src} alt={spiceAisle.alt} fill sizes="12rem" className="scale-125 object-cover" />
          </motion.div>

          {/* rotating seal */}
          <motion.div
            style={{ rotate }}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.9 }}
            className="absolute top-[56%] left-[40%] grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center sm:size-32"
            aria-hidden
          >
            <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite]">
              <defs>
                <path id="seal" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="var(--color-turmeric)" />
              <text fontSize="10" fontWeight="600" fill="var(--color-forest)" style={{ textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
                <textPath href="#seal" textLength="286" lengthAdjust="spacing">Fruiticana hee jaana · fresh hai na ·</textPath>
              </text>
            </svg>
            <Image src="/brand/mark.png" alt="" width={112} height={112} className="relative w-11 sm:w-12" />
          </motion.div>
        </div>
      </div>

      {/* produce marquee */}
      <div className="relative border-y border-ink/10 bg-paper/60 py-5" aria-hidden>
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap [--marquee-duration:60s]">
            {[...produce, ...produce].map((w, i) => (
              <span key={i} className="flex items-center font-display text-2xl text-forest/85 italic sm:text-3xl">
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
