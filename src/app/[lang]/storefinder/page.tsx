import type { Metadata } from "next";
import Link from "@/i18n/Link";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { StoreLocator } from "@/components/stores/StoreLocator";
import { JsonLd } from "@/components/ui/JsonLd";
import { getRetailStores, getStores } from "@/lib/content";
import { getLocale, getT } from "@/i18n/server";
import { pageMetadata, storeListLd } from "@/lib/seo";
import { citySlug } from "@/lib/site";
import { cityPath } from "@/lib/cities";

const PATH = "/storefinder";
export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getT(), getLocale()]);
  return pageMetadata({ title: t.stores.finderMetaTitle, description: t.stores.finderMetaDescription, path: PATH, absoluteTitle: true, lang });
}

export default async function StoreFinderPage() {
  const t = await getT();
  const [stores, retail] = await Promise.all([getStores(), getRetailStores()]);
  const byCity = Object.entries(
    retail.reduce<Record<string, typeof retail>>((acc, s) => {
      (acc[s.locality] ||= []).push(s);
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <JsonLd data={storeListLd(retail, t.stores.listName, await getLocale())} />
      <PageHero
        eyebrow={t.common.storeLocator}
        title={t.stores.finderTitle}
        intro={t.stores.finderIntro(retail.length)}
        crumbs={[{ name: t.common.storeLocator, path: PATH }]}
      />
      <section className="container-x py-10 lg:py-10">
        <StoreLocator stores={stores} />
      </section>

      {/* Crawlable directory: every store linked by city */}
      <section className="container-x pb-16 sm:pb-24 lg:pb-32">
        <h2 className="font-display text-title text-forest">{t.stores.allLocations}</h2>
        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {byCity.map(([city, list], i) => (
            <Reveal key={city} delay={(i % 4) * 0.05} id={citySlug(city)} className="scroll-mt-28">
              <h3 className="border-b border-ink/10 pb-3 text-[0.75rem] font-semibold tracking-[0.2em] text-muted uppercase">
                <Link href={cityPath(city)} className="flex items-baseline justify-between hover:text-leaf">
                  {t.places[city as keyof typeof t.places] ?? city} <span>{list.length}</span>
                </Link>
              </h3>
              <ul className="mt-4 space-y-3">
                {list.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/storefinder/${s.slug}`} className="group block">
                      <span className="font-medium text-ink group-hover:text-leaf">{s.name}</span>
                      <span className="block text-sm text-muted">{s.street}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
