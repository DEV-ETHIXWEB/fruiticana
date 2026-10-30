import Image from "next/image";
import { Reveal, SplitHeading, Stagger, ZoomSettle } from "@/components/motion/primitives";
import { MotionItem } from "@/components/motion/MotionItem";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks, relatedExcept } from "@/components/page/RelatedLinks";
import { RichText } from "@/components/page/RichText";
import { ButtonLink } from "@/components/ui/Button";
import { getPage, mangoBenefits, mangoOutro, photos } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/mangoes";
export async function generateMetadata() {
  return metaFromPage(await getPage("mangoes"), PATH);
}

export default async function MangoesPage() {
  const page = await getPage("mangoes");
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title="Fruiticana’s *Signature* Mangoes" intro={page.intro} crumbs={[{ name: "In The Community", path: "/blog" }, { name: "Mangoes", path: PATH }]} />

      <section className="container-x grid gap-10 pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:pt-20">
        <Reveal y={50}>
          <ZoomSettle className="relative aspect-[4/3] rounded-[var(--radius-card)] lg:aspect-[495/660] lg:max-h-[calc(100svh-12rem)]">
            <Image src={photos.rajanMangoes.src} alt={photos.rajanMangoes.alt} fill preload sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
          </ZoomSettle>
        </Reveal>
        <div className="lg:pt-10">
          <Reveal>
            <span className="inline-block rounded-full bg-mango px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-forest-deep uppercase">Rajan · exclusive to Fruiticana</span>
            <RichText value={page.body} className="dropcap mt-8" />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[photos.mangoLassi, photos.mangoCurry].map((p, i) => (
              <Reveal key={p.src} delay={0.1 + i * 0.08}>
                <ZoomSettle className="relative aspect-[3/2] rounded-2xl">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover" />
                </ZoomSettle>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-[clamp(3.5rem,9svh,6rem)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-saffron">Good for you</p>
            <SplitHeading text="5 health benefits of eating *mangoes*" className="mt-4 font-display text-[clamp(2rem,min(1rem+3vw,6.5svh),3.75rem)] leading-[1.02] tracking-[-0.03em] text-forest" accentClassName="italic text-saffron" />
          </div>
          <p className="text-ink-soft lg:text-lg">
            Nothing beats a fresh, sweet and juicy mango as the weather starts to get warmer. But the great taste is only part of the reason why you should eat them. Here’s why you should pick some up at your nearest Fruiticana.
          </p>
        </div>
        <Stagger
          className="scrollbar-none -mx-5 mt-[clamp(2rem,5svh,3rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0"
          gap={0.07}
        >
          {mangoBenefits.map((b, i) => (
            <MotionItem key={b.title} className={`flex w-[78%] shrink-0 snap-start flex-col rounded-[var(--radius-card)] p-6 text-forest-deep sm:w-[19rem] xl:w-auto ${i % 2 ? "bg-turmeric" : "bg-mango"}`}>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase opacity-80">0{i + 1}</span>
              <h3 className="mt-4 font-display text-2xl leading-tight">{b.title}</h3>
              <p className="mt-1 font-display text-[2rem] leading-tight italic">{b.stat}</p>
              <p className="text-xs uppercase opacity-80">{b.unit}</p>
              <p className="mt-4 text-sm leading-relaxed text-forest-deep/90">{b.body}</p>
            </MotionItem>
          ))}
        </Stagger>
      </section>

      <section className="container-x pb-[clamp(3.5rem,9svh,6rem)]">
        <Reveal className="grid gap-6 rounded-[var(--radius-card)] bg-paper p-7 md:grid-cols-[1fr_auto] md:items-center sm:p-10">
          <RichText value={mangoOutro} />
          <ButtonLink href="/storefinder" variant="primary">Find your nearest store</ButtonLink>
        </Reveal>
      </section>

      <RelatedLinks items={relatedExcept(PATH)} />
    </>
  );
}
