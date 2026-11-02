import Image from "next/image";
import { getLocale, getT } from "@/i18n/server";
import { Reveal, SplitHeading, ZoomSettle } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { RichText } from "@/components/page/RichText";
import { ButtonLink } from "@/components/ui/Button";
import { Icon3D } from "@/components/ui/Icon3D";
import { getPage, getPhotos } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/indican";
export async function generateMetadata() {
  return metaFromPage(await getPage("indican"), PATH, await getLocale());
}


export default async function IndicanPage() {
  const [t, photos] = await Promise.all([getT(), getPhotos()]);
  const range = [
    { icon: "chili" as const, title: t.pages.rangeSpices, body: t.pages.rangeSpicesBody },
    { icon: "bowl" as const, title: t.pages.rangeLentils, body: t.pages.rangeLentilsBody },
    { icon: "bottle" as const, title: t.pages.rangeRice, body: t.pages.rangeRiceBody },
  ];
  const page = await getPage("indican");
  const [lead, ...rest] = page.body;
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={t.pages.indicanTitle} intro={page.intro} image={page.heroImage} crumbs={[{ name: t.nav.indican, path: PATH }]} />

      <section className="container-x grid gap-14 py-14 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:py-28">
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
            <ButtonLink href="/storefinder" variant="chili">{t.pages.findIndican}</ButtonLink>
            <ButtonLink href="/commitment-to-quality" variant="ghost">{t.pages.qualityPromise}</ButtonLink>
          </div>
        </Reveal>
      </section>

      <section className="grain relative overflow-hidden bg-chili py-16 sm:py-24 text-white lg:py-32">
        <div className="container-x relative z-10">
          <p className="eyebrow text-turmeric">{t.pages.theRange}</p>
          <SplitHeading text={t.pages.rangeTitle} className="mt-5 max-w-3xl font-display text-headline tracking-[-0.03em]" accentClassName="italic text-turmeric" />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {range.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.08}>
                <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-8 text-ink">
                  <Icon3D name={r.icon} className="size-20 -ml-2" />
                  <span className="mt-6 text-[0.75rem] font-semibold tracking-[0.18em] text-chili-deep uppercase">Indican</span>
                  <h3 className="mt-1 font-display text-3xl">{r.title}</h3>
                  <p className="mt-2 text-ink-soft">{r.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RelatedLinks exclude={PATH} />
    </>
  );
}
