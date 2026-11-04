import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/i18n/Link";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { OpenBadge } from "@/components/stores/NearestStore";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Icon3D } from "@/components/ui/Icon3D";
import { JsonLd } from "@/components/ui/JsonLd";
import { getLocale, getT } from "@/i18n/server";
import { localizePath } from "@/i18n/config";
import { cityPath, commonHours, groupByCity } from "@/lib/cities";
import { getFlyers, getRetailStores } from "@/lib/content";
import { formatHours } from "@/lib/hours";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Props = PageProps<"/[lang]/indian-grocery-store/[city]">;

export async function generateStaticParams() {
  return groupByCity(await getRetailStores()).map((c) => ({ city: c.slug }));
}

async function load(slug: string) {
  const [stores, t, lang] = await Promise.all([getRetailStores(), getT(), getLocale()]);
  const cities = groupByCity(stores);
  const city = cities.find((c) => c.slug === slug);
  if (!city) notFound();
  const place = (name: string) => t.places[name as keyof typeof t.places] ?? name;
  return { city, cities, t, lang, place, name: place(city.name) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, t, lang, name } = await load((await params).city);
  const h = commonHours(city.stores);
  return pageMetadata({
    title: t.city.metaTitle(name, t.provinces[city.province]),
    description: t.city.metaDescription(name, city.stores.length, formatHours(h, lang)),
    path: cityPath(city.name),
    image: "/images/photos/store-produce-floor.jpg",
    lang,
  });
}

export default async function CityPage({ params }: Props) {
  const { city, cities, t, lang, place, name } = await load((await params).city);
  const flyers = await getFlyers();
  const n = city.stores.length;
  const h = commonHours(city.stores);
  const hours = formatHours(h, lang);
  const region = city.stores[0].flyerRegion;
  const flyer = flyers.find((f) => f.region === region);
  const path = cityPath(city.name);
  // the city name is the title's accent (each word, so multi-word cities work in both scripts)
  const accented = t.city.title(name).replace(name, name.split(" ").map((w) => `*${w}*`).join(" "));

  const faq = [
    { q: t.city.qHours(name), a: n === 1 ? t.city.aHoursOne(name, hours) : h.all ? t.city.aHoursAll(name, hours) : t.city.aHoursMost(name, hours) },
    { q: t.city.qCount(name), a: t.city.aCount(name, n, city.stores.map((s) => s.name).join(", ")) },
    { q: t.city.qSpecials(name), a: flyer ? t.city.aSpecials(name, flyer.label) : t.city.aSpecialsNone(name) },
    { q: t.city.qProducts, a: t.city.aProducts },
  ];
  const aisles = [
    { icon: "leaf" as const, title: t.stores.freshTitle, body: t.stores.freshBody },
    { icon: "chili" as const, title: t.stores.spicesTitle, body: t.stores.spicesBody },
    { icon: "mango" as const, title: t.stores.mangoTitle, body: t.stores.mangoBody },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t.city.storesTitle(name, n),
      numberOfItems: n,
      itemListElement: city.stores.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(localizePath(`/storefinder/${s.slug}`, lang)),
        item: { "@id": absoluteUrl(`/storefinder/${s.slug}#store`), name: `Fruiticana ${s.name}` },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow={`${name}, ${t.provinceNames[city.province]}`}
        title={accented}
        intro={t.city.intro(name, n)}
        crumbs={[
          { name: t.common.storeLocator, path: "/storefinder" },
          { name, path },
        ]}
      />

      <section className="container-x pt-6 pb-14 sm:pb-20">
        <h2 className="font-display text-title text-forest">{t.city.storesTitle(name, n)}</h2>
        <ul className={`mt-8 grid gap-4 ${n > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "max-w-xl"}`}>
          {city.stores.map((s, i) => {
            const address = `${s.street}, ${s.locality}, ${s.province}${s.postalCode ? ` ${s.postalCode}` : ""}`;
            return (
              <Reveal as="li" key={s.slug} delay={Math.min(i, 5) * 0.05} className="flex flex-col rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-ink/[0.06]">
                <Link href={`/storefinder/${s.slug}`} className="font-display text-2xl text-ink hover:text-leaf">
                  {s.name}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">{address}</p>
                <OpenBadge store={s} className="text-ink-soft" />
                <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                  <Icon name="clock" className="size-3.5" /> {formatHours(s, lang)}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 text-sm font-semibold">
                  <a href={`tel:+1${s.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 text-forest hover:text-leaf">
                    <Icon name="phone" className="size-3.5" /> {s.phone}
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Fruiticana ${address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-forest hover:text-leaf"
                  >
                    <Icon name="directions" className="size-3.5" /> {t.stores.getDirections}
                  </a>
                  <Link href={`/storefinder/${s.slug}`} className="inline-flex items-center gap-1.5 text-chili-deep">
                    {t.stores.viewStore} <Arrow />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="container-x pb-14 sm:pb-20">
        <h2 className="font-display text-title text-forest">{t.stores.inStore}</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-4 sm:grid-cols-3">
            {aisles.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.07} className="h-full">
                <div className="h-full rounded-[var(--radius-card)] bg-paper/70 p-6">
                  <Icon3D name={a.icon} className="-ml-1 size-14" />
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
              <div className="flex h-full flex-col rounded-[var(--radius-card)] bg-leaf p-7 text-white">
                <Icon3D name="flyer" className="-ml-1 size-16" />
                <p className="mt-5 font-display text-2xl leading-tight">{t.stores.thisWeeksSpecials}</p>
                <p className="mt-2 text-sm text-white/80">{t.city.aSpecialsNone(name)}</p>
                <ButtonLink href="/flyers" variant="light" magnetic={false} className="mt-auto self-start">
                  {t.city.seeSpecials}
                </ButtonLink>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-14 sm:pb-20">
        <h2 className="font-display text-title text-forest">{t.city.faqTitle}</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {faq.map((f) => (
            <div key={f.q} className="border-t border-ink/10 pt-5">
              <dt className="font-semibold text-ink">{f.q}</dt>
              <dd className="mt-2 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-x pb-16 sm:pb-24">
        <h2 className="text-[0.75rem] font-semibold tracking-[0.2em] text-muted uppercase">{t.city.otherCities}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {cities
            .filter((c) => c.slug !== city.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link href={cityPath(c.name)} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm text-ink ring-1 ring-ink/10 transition hover:bg-forest hover:text-cream">
                  {place(c.name)} <span className="text-muted">{c.stores.length}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
