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
          <ZoomSettle className="relative aspect-[495/660] rounded-[var(--radius-card)]">
            <Image src={photos.rajanMangoes.src} alt={photos.rajanMangoes.alt} fill preload sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
          </ZoomSettle>
        </Reveal>
        <div className="lg:pt-10">
          <Reveal>
            <span className="inline-block rounded-full bg-mango px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-white uppercase">Rajan · exclusive to Fruiticana</span>
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

      <section className="container-x py-24 lg:py-32">
        <p className="eyebrow text-saffron">Good for you</p>
        <SplitHeading text="5 health benefits of eating *mangoes*" className="mt-5 max-w-3xl font-display text-headline tracking-[-0.03em] text-forest" accentClassName="italic text-saffron" />
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Nothing beats a fresh, sweet and juicy mango as the weather starts to get warmer. But the great taste is only part of the reason why you should eat them. Here’s why you should pick some up at your nearest Fruiticana.
        </p>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" gap={0.07}>
          {mangoBenefits.map((b, i) => (
            <MotionItem key={b.title} className={`flex flex-col rounded-[var(--radius-card)] p-7 text-forest-deep ${i % 2 ? "bg-turmeric" : "bg-mango"}`}>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase opacity-70">0{i + 1}</span>
              <h3 className="mt-6 font-display text-[1.75rem] leading-tight">{b.title}</h3>
              <p className="mt-1 font-display text-4xl italic">{b.stat}</p>
              <p className="text-xs uppercase opacity-70">{b.unit}</p>
              <p className="mt-6 text-sm text-forest-deep/85">{b.body}</p>
            </MotionItem>
          ))}
        </Stagger>
        <Reveal className="mt-14 grid gap-8 rounded-[var(--radius-card)] bg-paper p-8 md:grid-cols-[1fr_auto] md:items-center sm:p-12">
          <RichText value={mangoOutro} />
          <ButtonLink href="/storefinder" variant="primary">Find your nearest store</ButtonLink>
        </Reveal>
      </section>

      <RelatedLinks items={relatedExcept(PATH)} />
    </>
  );
}
