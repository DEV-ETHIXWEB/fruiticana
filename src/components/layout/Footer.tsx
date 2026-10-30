import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Icon, socialIcon } from "@/components/ui/Icon";
import type { SiteSettings, Store } from "@/lib/content/types";
import { citySlug } from "@/lib/site";
import { BackToTop } from "./BackToTop";

/* Same menu as the legacy footer, in the same order. */
const menu = [
  { label: "Home", href: "/" },
  { label: "Our Company", href: "/our-company" },
  { label: "In the Community", href: "/blog" },
  { label: "Indican", href: "/indican" },
  { label: "Store Locator", href: "/storefinder" },
  { label: "Weekly Specials", href: "/flyers" },
  { label: "Careers", href: "/employment" },
  { label: "Contact", href: "/contact" },
];

const explore = [
  { label: "Commitment to Quality", href: "/commitment-to-quality" },
  { label: "Farm to Table", href: "/farm-to-table" },
  { label: "Rajan Mangoes", href: "/mangoes" },
  { label: "Events", href: "/events" },
  { label: "Forced and Child Labour Report 2024-25", href: "/forced-and-child-labour-report-2024-25" },
];

const heading = "text-[0.75rem] font-semibold tracking-[0.2em] text-cream/65 uppercase";
const link = "text-[0.9rem] text-cream/85 transition-colors hover:text-turmeric";

export function Footer({ settings, stores }: { settings: SiteSettings; stores: Store[] }) {
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
          <Link href="/" aria-label="Fruiticana home" className="inline-flex items-end gap-2">
            <Image src="/brand/wordmark-cream.png" alt="Fruiticana, since 1994" width={380} height={89} className="h-auto w-[176px] sm:w-[190px]" />
            <Image src="/brand/mark.png" alt="" width={118} height={118} className="mb-0.5 h-auto w-[48px] sm:w-[52px]" />
          </Link>
          <p className="mt-4 max-w-[17rem] text-[0.9rem] leading-relaxed text-cream/70">
            Fresh fruits, vegetables and spices at the best price, since {settings.founded}.
          </p>
          </div>
          <ul className="mt-5 flex shrink-0 gap-2 md:mt-0 xl:mt-5" aria-label="Fruiticana on social media">
            {settings.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Fruiticana on ${s.label}`}
                  className="grid size-10 place-items-center rounded-full ring-1 ring-cream/25 transition-[background-color,color,box-shadow] hover:bg-turmeric hover:text-forest hover:ring-turmeric"
                >
                  <Icon name={socialIcon(s.label)} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="xl:col-span-2">
          <h2 className={heading}>Menu</h2>
          <ul className="mt-4 space-y-2">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={link}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Explore" className="xl:col-span-2">
          <h2 className={heading}>Explore</h2>
          <ul className="mt-4 space-y-2">
            {explore.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={link}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-1 xl:col-span-2">
          <h2 className={heading}>Head office</h2>
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
            <h2 className={heading}>Weekly specials by email</h2>
            <p className="mt-4 mb-4 text-[0.9rem] text-cream/70 md:mb-0 xl:mb-4">Sign up and receive Weekly Specials and Event Information.</p>
          </div>
          <NewsletterForm tone="dark" compact />
        </div>
      </div>

      {/* Locations strip: every city links straight to its stores */}
      <div className="relative z-10 border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-6">
          <Link href="/storefinder" className="group inline-flex shrink-0 items-center gap-2 text-[0.9rem] font-semibold text-turmeric">
            <Icon name="pin" className="size-4" strokeWidth={2} /> {retail.length} stores in BC &amp; Alberta
            <Icon name="chevron" className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
          <ul className="hidden flex-wrap gap-1.5 sm:flex" aria-label="Stores by city">
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
            © {new Date().getFullYear()} Fruiticana. All Rights Reserved. <span className="ml-1 font-display text-cream/80 italic">Fruiticana hee jaana!</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/site-map" className="hover:text-cream">
              Site Map
            </Link>
            <Link href="/forced-and-child-labour-report-2024-25" className="hover:text-cream">
              Supply-chain report
            </Link>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
