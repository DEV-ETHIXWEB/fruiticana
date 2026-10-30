import Image from "next/image";
import { Reveal, SplitHeading, ZoomSettle } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks, relatedExcept } from "@/components/page/RelatedLinks";
import { RichText } from "@/components/page/RichText";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPage, photos } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/indican";
export async function generateMetadata() {
  return metaFromPage(await getPage("indican"), PATH);
}

const range = [
  { icon: "spark" as const, title: "Spices", body: "Aromatic, all-natural and exotic, handpicked by our experts." },
  { icon: "leaf" as const, title: "Lentils & dals", body: "The staples of every kitchen, packed to international standards." },
  { icon: "heart" as const, title: "Rice, sugar & juices", body: "Kheer rice, brown cane sugar, mango juice and more." },
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
                <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-8 text-ink">
                  <span className="grid size-12 place-items-center rounded-full bg-chili text-white">
                    <Icon name={r.icon} className="size-6" />
                  </span>
                  <span className="mt-8 text-[0.75rem] font-semibold tracking-[0.18em] text-chili-deep uppercase">Indican</span>
                  <h3 className="mt-1 font-display text-3xl">{r.title}</h3>
                  <p className="mt-2 text-ink-soft">{r.body}</p>
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
