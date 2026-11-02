import Link from "@/i18n/Link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Icon, socialIcon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { SiteSettings, Store } from "@/lib/content/types";
import { citySlug } from "@/lib/site";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { getT } from "@/i18n/server";
import { BackToTop } from "./BackToTop";

/* Same menu as the legacy footer, in the same order. Labels come from the dictionary. */
const menu = [
  { key: "home", href: "/" },
  { key: "ourCompany", href: "/our-company" },
  { key: "community", href: "/blog" },
  { key: "indican", href: "/indican" },
  { key: "storeLocator", href: "/storefinder" },
  { key: "weeklySpecials", href: "/flyers" },
  { key: "careers", href: "/employment" },
  { key: "contact", href: "/contact" },
] as const;

const explore = [
  { key: "commitment", href: "/commitment-to-quality" },
  { key: "farmToTable", href: "/farm-to-table" },
  { key: "rajanMangoes", href: "/mangoes" },
  { key: "events", href: "/events" },
  { key: "report", href: "/forced-and-child-labour-report-2024-25" },
] as const;

const heading = "text-[0.75rem] font-semibold tracking-[0.2em] text-cream/65 uppercase";
const link = "text-[0.9rem] text-cream/85 transition-colors hover:text-turmeric";

export async function Footer({ settings, stores }: { settings: SiteSettings; stores: Store[] }) {
  const t = await getT();
  const label = (key: string) => (key in t.common ? t.common[key as keyof typeof t.common] : t.nav[key as keyof typeof t.nav]);
  const tel = `tel:+1${settings.phone.replace(/\D/g, "")}`;
  const retail = stores.filter((s) => !s.isHeadOffice);
  const cities = Object.entries(
    retail.reduce<Record<string, number>>((acc, s) => ((acc[s.locality] = (acc[s.locality] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <footer className="grain relative overflow-hidden bg-forest-deep text-cream">
      {/* Phones: 2 cols. md-lg: brand row, 3 link columns, newsletter row. xl: single 12-col row. */}
      <div className="container-x relative z-10 grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-12 xl:gap-8 xl:py-14">
        {/* Brand */}
        <div className="col-span-2 md:col-span-3 md:flex md:items-end md:justify-between md:gap-8 xl:col-span-3 xl:block">
          <div>
          <Link href="/" aria-label={t.common.homeLink} className="inline-flex">
            <Logo tone="light" className="w-[220px] sm:w-[244px]" />
          </Link>
          <p className="mt-4 max-w-[17rem] text-[0.9rem] leading-relaxed text-cream/70">
            {t.footer.tagline(settings.founded)}
          </p>
          </div>
          <ul className="mt-5 flex shrink-0 gap-2 md:mt-0 xl:mt-5" aria-label={t.footer.socialList}>
            {settings.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.footer.social(s.label)}
                  className="grid size-10 place-items-center rounded-full ring-1 ring-cream/25 transition-[background-color,color,box-shadow] hover:bg-turmeric hover:text-forest hover:ring-turmeric"
                >
                  <Icon name={socialIcon(s.label)} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={t.footer.menu} className="xl:col-span-2">
          <h2 className={heading}>{t.footer.menu}</h2>
          <ul className="mt-4 space-y-2">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={link}>
                  {label(m.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.footer.explore} className="xl:col-span-2">
          <h2 className={heading}>{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2">
            {explore.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={link}>
                  {label(m.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-1 xl:col-span-2">
          <h2 className={heading}>{t.common.headOffice}</h2>
          <address className="mt-4 text-[0.9rem] leading-relaxed text-cream/85 not-italic">
            {settings.headOffice.street}
            <br />
            {settings.headOffice.locality}, {settings.headOffice.province} {settings.headOffice.postalCode}
          </address>
          <div className="mt-3 flex flex-col gap-2 text-[0.9rem]">
            <a href={tel} className="inline-flex items-center gap-2 text-cream hover:text-turmeric">
              <Icon name="phone" className="size-3.5 text-turmeric" /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 text-cream hover:text-turmeric">
              <Icon name="mail" className="size-3.5 text-turmeric" /> {settings.email}
            </a>
          </div>
        </div>

        <div className="col-span-2 md:col-span-3 md:grid md:grid-cols-[1fr_minmax(0,26rem)] md:items-center md:gap-8 md:border-t md:border-cream/10 md:pt-8 xl:col-span-3 xl:block xl:border-0 xl:pt-0">
          <div>
            <h2 className={heading}>{t.footer.newsletterTitle}</h2>
            <p className="mt-4 mb-4 text-[0.9rem] text-cream/70 md:mb-0 xl:mb-4">{t.footer.newsletterBody}</p>
          </div>
          <NewsletterForm tone="dark" compact />
        </div>
      </div>

      {/* Locations strip: every city links straight to its stores */}
      <div className="relative z-10 border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-6">
          <Link href="/storefinder" className="group inline-flex shrink-0 items-center gap-2 text-[0.9rem] font-semibold text-turmeric">
            <Icon name="pin" className="size-4" strokeWidth={2} /> {t.footer.storesCount(retail.length)}
            <Icon name="chevron" className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
          <ul className="hidden flex-wrap gap-1.5 sm:flex" aria-label={t.footer.storesByCity}>
            {cities.map(([city, n]) => (
              <li key={city}>
                <Link
                  href={`/storefinder#${citySlug(city)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream/[0.06] px-3 py-1 text-[0.78rem] text-cream/85 ring-1 ring-cream/10 transition hover:bg-turmeric hover:text-forest"
                >
                  {city} <span className="opacity-70">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-cream/10">
        <div className="container-x flex flex-col gap-3 py-5 text-[0.78rem] text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t.footer.rights(new Date().getFullYear())} <span className="ml-1 font-display text-cream/80 italic">{t.footer.slogan}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <LanguageSwitcher variant="text" tone="dark" className="text-cream" />
            <Link href="/site-map" className="hover:text-cream">
              {t.footer.siteMap}
            </Link>
            <Link href="/forced-and-child-labour-report-2024-25" className="hover:text-cream">
              {t.footer.supplyChain}
            </Link>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
