import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/Link";
import { notFound } from "next/navigation";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { Breadcrumbs } from "@/components/page/Breadcrumbs";
import { OpenBadge } from "@/components/stores/NearestStore";
import { StoreMap } from "@/components/stores/StoreMap";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Icon3D } from "@/components/ui/Icon3D";
import { JsonLd } from "@/components/ui/JsonLd";
import { getFlyers, getStore, getStores } from "@/lib/content";
import { distanceKm, formatKm } from "@/lib/geo";
import { formatHours } from "@/lib/hours";
import { pageMetadata, storeLd } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

export async function generateStaticParams() {
  return (await getStores()).map((s) => ({ slug: s.slug }));
}

/** Store names stay in English (they match signage and maps); only the head office is described. */
const title = (s: { name: string; isHeadOffice?: boolean; locality: string }, headOfficeTitle: string) =>
  s.isHeadOffice ? headOfficeTitle : `Fruiticana ${s.name}${s.name.includes(s.locality) ? "" : `, ${s.locality}`}`;

export async function generateMetadata({ params }: PageProps<"/[lang]/storefinder/[slug]">): Promise<Metadata> {
  const [s, t, lang] = await Promise.all([getStore((await params).slug), getT(), getLocale()]);
  if (!s) return {};
  // Address, hours and phone always; the tagline only while it fits Google's ~160-character snippet.
  const address = `${s.street}, ${s.locality}, ${s.province}${s.postalCode ? ` ${s.postalCode}` : ""}`;
  const facts = t.stores.facts(s.name, address, formatHours(s, lang), s.phone);
  const tagline = t.stores.metaTagline;
  return pageMetadata({
    lang,
    title: t.stores.metaTitle(title(s, t.stores.headOfficeTitle)),
    description: facts.length + tagline.length <= 160 ? facts + tagline : facts,
    path: `/storefinder/${s.slug}`,
    image: false,
    absoluteTitle: true,
  });
}

export default async function StorePage({ params }: PageProps<"/[lang]/storefinder/[slug]">) {
  const { slug } = await params;
  const [store, all, flyers, t, lang] = await Promise.all([getStore(slug), getStores(), getFlyers(), getT(), getLocale()]);
  if (!store) notFound();
  const aisles = [
    { icon: "leaf" as const, title: t.stores.freshTitle, body: t.stores.freshBody },
    { icon: "chili" as const, title: t.stores.spicesTitle, body: t.stores.spicesBody },
    { icon: "mango" as const, title: t.stores.mangoTitle, body: t.stores.mangoBody },
  ];
  const nearby = all
    .filter((s) => s.slug !== store.slug && !s.isHeadOffice)
    .map((s) => ({ s, km: distanceKm(store, s) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);
  // Only this store’s own regional flyer: another region’s prices would be wrong here.
  const flyer = flyers.find((f) => f.region === store.flyerRegion);
  const address = `${store.street}, ${store.locality}, ${store.province}${store.postalCode ? ` ${store.postalCode}` : ""}`;
  const dirs = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Fruiticana ${address}`)}`;
  const tel = `tel:+1${store.phone.replace(/\D/g, "")}`;

  return (
    <>
      <JsonLd data={storeLd(store, lang)} />
      <section className="relative overflow-hidden pt-28 pb-8 lg:pt-36">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-[-12%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.28),transparent_65%)] blur-2xl" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: t.common.storeLocator, path: "/storefinder" }, { name: store.isHeadOffice ? t.common.headOffice : store.name, path: `/storefinder/${store.slug}` }]} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow text-leaf">{store.isHeadOffice ? t.common.headOffice : `${store.locality}, ${store.province}`}</p>
              <SplitHeading as="h1" immediate text={title(store, t.stores.headOfficeTitle)} className="mt-5 font-display text-headline tracking-[-0.03em] text-forest" />
              <div className="mt-6">
                <OpenBadge store={store} className="text-base text-ink-soft" />
              </div>
              <dl className="mt-10 grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">{t.stores.address}</dt>
                  <dd className="mt-2 text-lg text-ink not-italic">
                    {store.street}
                    <br />
                    {store.locality}, {store.province} {store.postalCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">{t.stores.hours}</dt>
                  <dd className="mt-2 text-lg text-ink">
                    {store.isHeadOffice ? t.stores.officeHours : t.stores.openSevenDays}
                    <br />
                    {formatHours(store, lang)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">{t.stores.phone}</dt>
                  <dd className="mt-2 text-lg">
                    <a href={tel} className="text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                      {store.phone}
                    </a>
                  </dd>
                </div>
                {!store.isHeadOffice && (
                  <div>
                    <dt className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">{t.stores.weeklyFlyer}</dt>
                    <dd className="mt-2 text-lg">
                      {flyer ? (
                        <Link href={`/flyers?region=${flyer.region}`} className="text-leaf underline decoration-leaf/30 underline-offset-4 hover:decoration-leaf">
                          {t.stores.regionSpecials(flyer.label)}
                        </Link>
                      ) : (
                        <a href={tel} className="text-leaf underline decoration-leaf/30 underline-offset-4 hover:decoration-leaf">
                          {t.stores.callForSpecials}
                        </a>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={dirs} target="_blank" rel="noopener noreferrer" variant="chili" magnetic={false} className="w-full sm:w-auto">
                  {t.stores.getDirections}
                </ButtonLink>
                <ButtonLink href={tel} variant="ghost" arrow={false} magnetic={false} className="w-full sm:w-auto">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="phone" className="size-4" /> {t.stores.callStore}
                  </span>
                </ButtonLink>
              </div>
            </div>
            <Reveal y={40}>
              <div className="relative aspect-[4/3.4] overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-ink/10 lg:aspect-auto lg:h-full lg:min-h-[30rem]">
                <StoreMap lat={store.lat} lng={store.lng} label={`Fruiticana ${store.name}`} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {!store.isHeadOffice && (
        <section className="container-x py-20 lg:py-28">
          <h2 className="font-display text-title text-forest">{t.stores.inStore}</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_22rem]">
            <div className="grid gap-4 sm:grid-cols-3">
              {aisles.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.07} className="h-full">
                  <div className="h-full rounded-[var(--radius-card)] bg-paper/70 p-6">
                    <Icon3D name={a.icon} className="size-14 -ml-1" />
                    <p className="mt-5 font-semibold text-ink">{a.title}</p>
                    <p className="mt-1.5 text-sm text-ink-soft">{a.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1} className="h-full">
            {flyer ? (
              <Link href={`/flyers?region=${flyer.region}`} className="group/btn flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-leaf p-4 text-white">
                <div className="relative min-h-40 flex-1 overflow-hidden rounded-2xl bg-white">
                  <Image src={flyer.image.src} alt={flyer.image.alt} fill sizes="22rem" className="object-cover object-top transition-transform duration-[1.2s] group-hover/btn:scale-105" />
                </div>
                <p className="mt-4 flex items-center justify-between px-2 pb-1 font-semibold">
                  {t.stores.thisWeeksFlyer(flyer.label)} <Arrow />
                </p>
              </Link>
            ) : (
              // No flyer is published for this region right now: point to the store, never to another region’s prices.
              <div className="flex h-full flex-col rounded-[var(--radius-card)] bg-leaf p-7 text-white">
                <Icon3D name="flyer" className="size-16 -ml-1" />
                <p className="mt-5 font-display text-2xl leading-tight">{t.stores.thisWeeksSpecials}</p>
                <p className="mt-2 text-sm text-white/80">{t.stores.noFlyer(store.locality)}</p>
                <ButtonLink href={tel} variant="light" magnetic={false} arrow={false} className="mt-auto self-start">
                  <span className="inline-flex items-center gap-2"><Icon name="phone" className="size-4" /> {store.phone}</span>
                </ButtonLink>
              </div>
            )}
            </Reveal>
          </div>
        </section>
      )}

      <section className="container-x pb-24 lg:pb-32">
        <h2 className="font-display text-title text-forest">{t.stores.nearbyTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {nearby.map(({ s, km }, i) => (
            <Reveal key={s.slug} delay={i * 0.07}>
              <Link href={`/storefinder/${s.slug}`} className="group/btn flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
                <span className="text-xs font-semibold text-leaf">{t.stores.away(formatKm(km))}</span>
                <span className="mt-2 font-display text-2xl text-ink">{s.name}</span>
                <span className="mt-1 text-sm text-ink-soft">
                  {s.street}, {s.locality}
                </span>
                <OpenBadge store={s} className="text-ink-soft" />
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-chili-deep">
                  {t.stores.viewStore} <Arrow />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
