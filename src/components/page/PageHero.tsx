import Image from "next/image";
import { Parallax, Reveal, SplitHeading } from "@/components/motion/primitives";
import type { Img } from "@/lib/content/types";
import { Breadcrumbs } from "./Breadcrumbs";

/** Inner-page masthead: breadcrumb, kicker, split-word title, intro, wide photo. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  crumbs,
  children,
  imageClassName = "aspect-[16/7] sm:aspect-[16/6]",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: Img;
  crumbs: { name: string; path: string }[];
  children?: React.ReactNode;
  imageClassName?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-28 lg:pt-36">
      <div aria-hidden className="pointer-events-none absolute -top-48 right-[-12%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.28),transparent_65%)] blur-2xl" />
      <div className="container-x relative">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            {eyebrow && <p className="eyebrow text-leaf">{eyebrow}</p>}
            <SplitHeading as="h1" immediate delay={0.05} text={title} className="mt-5 font-display text-headline tracking-[-0.03em] text-forest" accentClassName="italic text-chili" />
          </div>
          {intro && (
            <Reveal delay={0.35}>
              <p className="max-w-xl text-lg leading-relaxed text-ink-soft lg:pb-2">{intro}</p>
            </Reveal>
          )}
        </div>
        {children}
      </div>
      {image && (
        <div className="container-x mt-12 lg:mt-16">
          <Reveal y={50}>
            <Parallax amount={40} className={`relative overflow-hidden rounded-[var(--radius-card)] ${imageClassName}`}>
              <div className="absolute -inset-y-12 inset-x-0">
                <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1408px) 1344px, 100vw" className="object-cover" quality={90} />
              </div>
            </Parallax>
          </Reveal>
        </div>
      )}
    </section>
  );
}
