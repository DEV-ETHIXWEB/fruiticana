import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { StoreLocator } from "@/components/stores/StoreLocator";
import { JsonLd } from "@/components/ui/JsonLd";
import { getRetailStores, getStores } from "@/lib/content";
import { pageMetadata, storeListLd } from "@/lib/seo";
import { citySlug } from "@/lib/site";

const PATH = "/storefinder";
export const metadata: Metadata = pageMetadata({
  title: "Fruiticana Store Locator",
  description:
    "Find your nearest Fruiticana: 25 grocery stores in Surrey, Abbotsford, Richmond, Vancouver, Kelowna, Calgary, Chestermere and Edmonton. Hours and directions.",
  path: PATH,
  absoluteTitle: true,
});

export default async function StoreFinderPage() {
  const [stores, retail] = await Promise.all([getStores(), getRetailStores()]);
  const byCity = Object.entries(
    retail.reduce<Record<string, typeof retail>>((acc, s) => {
      (acc[s.locality] ||= []).push(s);
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <JsonLd data={storeListLd(retail)} />
      <PageHero
        eyebrow="Store Locator"
        title="There’s a Fruiticana *near* *you.*"
        intro={`${retail.length} stores across British Columbia and Alberta. Search by postal code, browse by city, or let us find the closest one.`}
        crumbs={[{ name: "Store Locator", path: PATH }]}
      />
      <section className="container-x py-12 lg:py-16">
        <StoreLocator stores={stores} />
      </section>

      {/* Crawlable directory: every store linked by city */}
      <section className="container-x pb-24 lg:pb-32">
        <h2 className="font-display text-title text-forest">All locations</h2>
        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {byCity.map(([city, list], i) => (
            <Reveal key={city} delay={(i % 4) * 0.05} id={citySlug(city)} className="scroll-mt-28">
              <h3 className="flex items-baseline justify-between border-b border-ink/10 pb-3 text-[0.72rem] font-semibold tracking-[0.2em] text-muted uppercase">
                {city} <span>{list.length}</span>
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
