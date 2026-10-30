import Image from "next/image";
import { SplitHeading, ZoomSettle } from "@/components/motion/primitives";
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
  imageClassName = "",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: Img;
  crumbs: { name: string; path: string }[];
  children?: React.ReactNode;
  imageClassName?: string;
}) {
  // Without a photo the title is the last thing in this clipped section: the bottom padding keeps its descenders visible.
  return (
    <section className={`relative overflow-hidden pt-28 lg:pt-36 ${image ? "" : "pb-6"}`}>
      <div aria-hidden className="pointer-events-none absolute -top-48 right-[-12%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.28),transparent_65%)] blur-2xl" />
      <div className="container-x relative">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            {eyebrow && <p className="eyebrow enter-rise text-leaf">{eyebrow}</p>}
            <SplitHeading as="h1" immediate delay={0.05} text={title} className="mt-5 font-display text-headline tracking-[-0.03em] text-forest" accentClassName="italic text-chili" />
          </div>
          {intro && (
            <p className="enter-rise max-w-xl text-lg leading-relaxed text-ink-soft lg:pb-2" style={{ animationDelay: "0.35s" }}>
              {intro}
            </p>
          )}
        </div>
        {children}
      </div>
      {image && (
        <div className="container-x mt-12 lg:mt-16">
          <div className="enter-rise" style={{ animationDelay: "0.2s" }}>
            {/* Natural aspect ratio: banners with lettering are never cropped */}
            <ZoomSettle className={`relative rounded-[var(--radius-card)] ${imageClassName}`}>
              <div className="relative w-full" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                <Image src={image.src} alt={image.alt} fill preload sizes="(min-width: 1408px) 1344px, 100vw" className="object-cover" quality={90} />
              </div>
            </ZoomSettle>
          </div>
        </div>
      )}
    </section>
  );
}
