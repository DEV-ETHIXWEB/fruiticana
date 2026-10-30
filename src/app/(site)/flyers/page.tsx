import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FlyerViewer } from "@/components/flyers/FlyerViewer";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { Icon } from "@/components/ui/Icon";
import { getFlyers, getRetailStores } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { regionLabels } from "@/lib/site";

const PATH = "/flyers";
export const metadata: Metadata = pageMetadata({
  title: "Fruiticana Weekly Specials",
  description: "This week’s Fruiticana flyer for Greater Vancouver, Calgary, Chestermere and Edmonton, with the best prices on fresh fruits, vegetables, spices and groceries.",
  path: PATH,
  image: "/images/banners/weekly-specials.jpg",
  absoluteTitle: true,
});

export default async function FlyersPage() {
  const [flyers, stores] = await Promise.all([getFlyers(), getRetailStores()]);
  const countBy = (r: string) => stores.filter((s) => s.flyerRegion === r).length;
  // Stores whose region has no flyer online right now: told to ask in store, never shown another region’s prices.
  const unlisted = stores.filter((s) => !flyers.some((f) => f.region === s.flyerRegion));
  const noFlyer = unlisted.length;
  const noFlyerLabel = [...new Set(unlisted.map((s) => (s.province === "AB" ? "Alberta" : s.locality)))].join(", ");

  return (
    <>
      <PageHero eyebrow="Weekly Specials" title="This week’s *best* prices." intro="Choose your region to see the specials at your nearest Fruiticana. Flyers refresh every week." crumbs={[{ name: "Weekly Specials", path: PATH }]} />

      <section className="container-x grid grid-cols-1 gap-12 pt-8 pb-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:pt-10 lg:pb-20">
        <Suspense
          fallback={
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-white p-3">
              <Image src={flyers[0].image.src} alt={flyers[0].image.alt} width={flyers[0].image.width} height={flyers[0].image.height} preload sizes="(min-width: 1024px) 56rem, 100vw" className="h-auto w-full rounded-[1.35rem]" />
            </div>
          }
        >
          <FlyerViewer flyers={flyers} />
        </Suspense>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="rounded-[var(--radius-card)] bg-paper p-6">
              <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">Which flyer is mine?</p>
              <ul className="mt-4 space-y-3 text-sm">
                {flyers.map((f) => (
                  <li key={f.region} className="flex justify-between gap-4">
                    <span className="font-medium text-ink">{regionLabels[f.region]}</span>
                    <span className="text-muted">{f.region === "greater-vancouver" ? `${countBy(f.region)} BC stores` : `${countBy(f.region)} store${countBy(f.region) === 1 ? "" : "s"}`}</span>
                  </li>
                ))}
                {noFlyer > 0 && (
                  <li className="flex justify-between gap-4 border-t border-ink/10 pt-3">
                    <span className="font-medium text-ink">{noFlyerLabel}</span>
                    <span className="text-right text-muted">
                      {noFlyer} store{noFlyer === 1 ? "" : "s"}: ask in store
                    </span>
                  </li>
                )}
              </ul>
              <Link href="/storefinder" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-leaf">
                <Icon name="pin" className="size-4" /> Find your store
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grain relative overflow-hidden rounded-[var(--radius-card)] bg-forest p-6 text-cream">
              <div className="relative z-10">
                <p className="font-display text-2xl">Get the flyer by email</p>
                <p className="mt-2 mb-5 text-sm text-cream/70">Weekly Specials and event news, straight to your inbox.</p>
                <NewsletterForm tone="dark" compact stacked />
              </div>
            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
