import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/Link";
import { Suspense } from "react";
import { FlyerViewer } from "@/components/flyers/FlyerViewer";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { Icon } from "@/components/ui/Icon";
import { getFlyers, getRetailStores, getSettings } from "@/lib/content";
import { getLocale, getT } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

const PATH = "/flyers";
export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getT(), getLocale()]);
  return pageMetadata({ title: t.flyers.metaTitle, description: t.flyers.metaDescription, path: PATH, image: "/images/banners/weekly-specials.jpg", absoluteTitle: true, lang });
}

export default async function FlyersPage() {
  const [flyers, stores, t, settings] = await Promise.all([getFlyers(), getRetailStores(), getT(), getSettings()]);
  const delivery = settings.deliveryLinks?.filter((d) => d.label && d.href) ?? [];
  const countBy = (r: string) => stores.filter((s) => s.flyerRegion === r).length;
  // Stores whose region has no flyer online right now: told to ask in store, never shown another region’s prices.
  const unlisted = stores.filter((s) => !flyers.some((f) => f.region === s.flyerRegion));
  const noFlyer = unlisted.length;
  const noFlyerLabel = [...new Set(unlisted.map((s) => (s.province === "AB" ? t.flyers.alberta : s.locality)))].join(", ");

  return (
    <>
      <PageHero eyebrow={t.common.weeklySpecials} title={t.flyers.title} intro={t.flyers.intro} crumbs={[{ name: t.common.weeklySpecials, path: PATH }]} />

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
              <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-muted uppercase">{t.flyers.whichFlyer}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {flyers.map((f) => (
                  <li key={f.region} className="flex justify-between gap-4">
                    <span className="font-medium text-ink">{f.label}</span>
                    <span className="text-muted">{f.region === "greater-vancouver" ? t.flyers.bcStores(countBy(f.region)) : t.flyers.stores(countBy(f.region))}</span>
                  </li>
                ))}
                {noFlyer > 0 && (
                  <li className="flex justify-between gap-4 border-t border-ink/10 pt-3">
                    <span className="font-medium text-ink">{noFlyerLabel}</span>
                    <span className="text-right text-muted">
                      {t.flyers.askInStore(noFlyer)}
                    </span>
                  </li>
                )}
              </ul>
              <Link href="/storefinder" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-leaf">
                <Icon name="pin" className="size-4" /> {t.home.heroCtaStore}
              </Link>
            </div>
          </Reveal>
          {(delivery.length > 0 || settings.whatsappUrl) && (
            <Reveal delay={0.04}>
              <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-ink/[0.06]">
                <p className="font-display text-2xl text-forest">{t.flyers.shopFromHome}</p>
                {delivery.length > 0 && <p className="mt-2 text-sm text-ink-soft">{t.flyers.shopFromHomeBody}</p>}
                <ul className="mt-4 space-y-2">
                  {delivery.map((d) => (
                    <li key={d.href}>
                      <a
                        href={d.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="Delivery service"
                        data-track-service={d.label}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-leaf hover:text-white"
                      >
                        <span>{t.flyers.orderOn(d.label)}</span>
                        <Icon name="external" className="size-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                  {settings.whatsappUrl && (
                    <li>
                      <a
                        href={settings.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="WhatsApp channel"
                        className="flex items-center justify-between gap-3 rounded-2xl bg-leaf/10 px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-leaf hover:text-white"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon name="whatsapp" className="size-4" /> {t.footer.whatsapp}
                        </span>
                        <Icon name="external" className="size-4 shrink-0" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <div className="grain relative overflow-hidden rounded-[var(--radius-card)] bg-forest p-6 text-cream">
              <div className="relative z-10">
                <p className="font-display text-2xl">{t.flyers.byEmailTitle}</p>
                <p className="mt-2 mb-5 text-sm text-cream/70">{t.flyers.byEmailBody}</p>
                <NewsletterForm tone="dark" compact stacked />
              </div>
            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
