import { getImageProps } from "next/image";
import { SplitHeading } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/i18n/server";
import { HeroVideo } from "./HeroVideo";

/**
 * First screen: a full-bleed video stage (exactly one viewport tall with the
 * produce marquee) and the brand headline set in cream over a forest-green shade.
 */
export async function Hero({ storeCount }: { storeCount: number }) {
  const t = await getT();
  // Art-directed poster: a vertical crop on phones, the wide frame elsewhere.
  const { props: desktop } = getImageProps({ src: "/video/hero-poster.jpg", alt: t.home.heroPosterAlt, width: 1920, height: 1080, sizes: "100vw" });
  const { props: mobile } = getImageProps({ src: "/video/hero-poster-mobile.jpg", alt: t.home.heroPosterAlt, width: 544, height: 966, sizes: "100vw" });

  return (
    <section className="relative flex h-[100svh] max-h-[68rem] min-h-[36rem] flex-col">
      <div className="relative isolate flex flex-1 items-end overflow-hidden text-cream md:items-center">
        <HeroVideo desktopPoster={{ src: desktop.src, srcSet: desktop.srcSet }} mobilePoster={{ src: mobile.src, srcSet: mobile.srcSet }} alt={t.home.heroPosterAlt} />

        <div className="container-x relative pt-28 pb-10 md:pb-[clamp(2rem,6svh,4rem)] lg:pt-32">
          <div className="max-w-[44rem]">
            <h1 className="eyebrow enter-rise text-turmeric">{t.home.heroEyebrow(storeCount)}</h1>

            <SplitHeading
              as="p"
              immediate
              delay={0.15}
              text={t.home.heroTitle}
              className="mt-[clamp(1rem,2.5svh,1.5rem)] font-display text-[clamp(2.75rem,min(7.4vw,11svh),8rem)] leading-[0.94] tracking-[-0.035em] text-cream [text-shadow:0_2px_30px_rgb(10_40_25/0.35)]"
              accentClassName="brush-underline italic font-normal text-turmeric [font-variation-settings:'SOFT'_100]"
            />

            <p
              className="enter-rise mt-[clamp(1.5rem,4svh,2.5rem)] max-w-xl text-base leading-relaxed text-cream/90 sm:text-lg"
              style={{ animationDelay: "0.55s" }}
            >
              {t.home.heroLead}
            </p>

            <div className="enter-rise mt-[clamp(1.25rem,3.5svh,2.25rem)] flex flex-wrap items-center gap-2 sm:gap-3" style={{ animationDelay: "0.7s" }}>
              <ButtonLink href="/flyers" variant="chili" size="fluid">
                <span className="sm:hidden">{t.home.heroCtaSpecialsShort}</span>
                <span className="hidden sm:inline">{t.home.heroCtaSpecials}</span>
              </ButtonLink>
              <ButtonLink href="/storefinder" variant="outline-light" size="fluid" className="backdrop-blur-sm">
                <span className="sm:hidden">{t.home.heroCtaStoreShort}</span>
                <span className="hidden sm:inline">{t.home.heroCtaStore}</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      {/* produce marquee */}
      <div className="relative shrink-0 border-b border-ink/10 bg-paper py-4 lg:py-[clamp(0.75rem,2svh,1.25rem)]" aria-hidden>
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap [--marquee-duration:60s]">
            {[...t.home.produce, ...t.home.produce].map((w, i) => (
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
