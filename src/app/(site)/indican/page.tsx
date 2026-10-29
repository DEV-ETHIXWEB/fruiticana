import Image from "next/image";
import { Reveal, SplitHeading, ZoomSettle } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks, relatedExcept } from "@/components/page/RelatedLinks";
import { RichText } from "@/components/page/RichText";
import { ButtonLink } from "@/components/ui/Button";
import { getPage, photos } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/indican";
export async function generateMetadata() {
  return metaFromPage(await getPage("indican"), PATH);
}

const range = [
  { title: "Spices", body: "Aromatic, all-natural and exotic, handpicked by our experts.", image: { src: "/images/banners/spices.png", alt: "Indican spices, whole and ground", width: 1800, height: 517 } },
  { title: "Lentils & dals", body: "The staples of every kitchen, packed to international standards.", image: { src: "/images/banners/lentils.png", alt: "Indican lentils and dals", width: 1800, height: 517 } },
  { title: "Rice, sugar & juices", body: "Kheer rice, brown cane sugar, mango juice and more.", image: { src: "/images/banners/indican.jpg", alt: "Indican mango juice, kheer rice and brown cane sugar", width: 1800, height: 517 } },
];

export default async function IndicanPage() {
  const page = await getPage("indican");
  const [lead, ...rest] = page.body;
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title="*Indican*" intro={page.intro} image={page.heroImage} crumbs={[{ name: "Indican", path: PATH }]} />

      <section className="container-x grid gap-14 py-20 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:py-28">
        <div>
          <Reveal>
            <RichText value={lead ? [lead] : []} className="dropcap text-xl" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <ZoomSettle className="relative aspect-[990/556] rounded-[var(--radius-card)]">
              <Image src={photos.spiceAisle.src} alt={photos.spiceAisle.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </ZoomSettle>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <RichText value={rest} />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/storefinder" variant="chili">Find Indican near you</ButtonLink>
            <ButtonLink href="/commitment-to-quality" variant="ghost">Our quality promise</ButtonLink>
          </div>
        </Reveal>
      </section>

      <section className="grain relative overflow-hidden bg-chili py-24 text-white lg:py-32">
        <div className="container-x relative z-10">
          <p className="eyebrow text-turmeric">The range</p>
          <SplitHeading text="Available *exclusively* at Fruiticana." className="mt-5 max-w-3xl font-display text-headline tracking-[-0.03em]" accentClassName="italic text-turmeric" />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {range.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.08}>
                <article className="h-full overflow-hidden rounded-[var(--radius-card)] bg-white text-ink">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={r.image.src} alt={r.image.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover object-left" />
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl">{r.title}</h3>
                    <p className="mt-2 text-ink-soft">{r.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RelatedLinks items={relatedExcept(PATH)} />
    </>
  );
}
