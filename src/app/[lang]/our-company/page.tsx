import Image from "next/image";
import { Counter, Reveal, SplitHeading, ZoomSettle } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks, relatedExcept } from "@/components/page/RelatedLinks";
import { RichText } from "@/components/page/RichText";
import { getPage, getRetailStores, getSettings, milestones, photos } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/our-company";
export async function generateMetadata() {
  return metaFromPage(await getPage("our-company"), PATH);
}

export default async function OurCompanyPage() {
  const [page, settings, stores] = await Promise.all([getPage("our-company"), getSettings(), getRetailStores()]);
  const [lead, ...rest] = page.body;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title="Our *Story*" intro={page.intro} crumbs={[{ name: "Our Company", path: PATH }]} />

      <section className="container-x grid gap-14 py-20 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:py-28">
        <Reveal>
          <RichText value={lead ? [lead] : []} className="dropcap text-xl" />
        </Reveal>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-ink/10">
          {[
            { v: <Counter to={settings.founded} format={false} />, l: "First store, Surrey BC" },
            { v: <Counter to={stores.length} />, l: "Stores in BC & Alberta" },
            { v: <>6<span className="text-[0.45em]"> months</span></>, l: "Until our second store, in Richmond" },
            { v: <Counter to={settings.warehouseSqFt} />, l: "Sq. ft distribution warehouse" },
          ].map((s, i) => (
            <div key={i} className="bg-cream p-7">
              <p className="font-display text-[clamp(2.2rem,1.4rem+2vw,3.5rem)] leading-none tracking-tight text-leaf">{s.v}</p>
              <p className="mt-3 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Then & now */}
      <section className="container-x grid gap-5 md:grid-cols-[1.15fr_1fr] md:items-end">
        <Reveal>
          <figure>
            <ZoomSettle className="relative aspect-[989/660] rounded-[var(--radius-card)]">
              <Image src={photos.firstStore.src} alt={photos.firstStore.alt} fill preload sizes="(min-width: 768px) 52vw, 100vw" className="object-cover" />
            </ZoomSettle>
            <figcaption className="mt-3 flex justify-between text-sm text-muted">
              <span className="font-display text-base text-ink italic">The first Fruiticana</span> Surrey, 1994
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.1}>
          <figure>
            <ZoomSettle className="relative aspect-[990/511] rounded-[var(--radius-card)]">
              <Image src={photos.flagship.src} alt={photos.flagship.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </ZoomSettle>
            <figcaption className="mt-3 flex justify-between text-sm text-muted">
              <span className="font-display text-base text-ink italic">Flagship store, Scott Road</span> Surrey, 1997
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="container-x grid gap-8 py-20 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:py-28">
        <Reveal>
          <p className="eyebrow text-leaf">How we grew</p>
          <p className="mt-5 max-w-md font-display text-title text-forest">From a single store to one of Western Canada’s largest grocery chains.</p>
        </Reveal>
        <Reveal delay={0.05}>
          <RichText value={rest} />
        </Reveal>
      </section>

      {/* Timeline band */}
      <section className="grain relative overflow-hidden bg-forest py-24 text-cream">
        <div className="container-x relative z-10">
          <p className="eyebrow text-turmeric">Milestones</p>
          <SplitHeading text="Three decades of *bringing* *home* closer." className="mt-5 max-w-3xl font-display text-headline tracking-[-0.03em]" accentClassName="italic text-turmeric" />
          <ol className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-cream/10 sm:grid-cols-2 lg:grid-cols-5">
            {milestones.map((m, i) => (
              <Reveal as="li" key={i} delay={i * 0.07} className="bg-forest p-7">
                <p className="font-display text-4xl text-turmeric italic">{m.year}</p>
                <p className="mt-4 font-semibold">{m.title}</p>
                <p className="mt-2 text-sm text-cream/65">{m.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Mission */}
      <section className="container-x py-24 text-center lg:py-32">
        <p className="eyebrow justify-center text-chili-deep">Mission statement</p>
        <SplitHeading as="p" text={settings.mission} className="mx-auto mt-8 max-w-5xl font-display text-[clamp(1.7rem,1rem+2.4vw,3.25rem)] leading-[1.15] tracking-[-0.02em] text-forest" />
      </section>

      <RelatedLinks items={relatedExcept(PATH)} />
    </>
  );
}
