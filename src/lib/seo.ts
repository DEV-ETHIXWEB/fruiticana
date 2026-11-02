import type { Metadata } from "next";
import type { Page, Post, SiteSettings, Store } from "./content/types";
import { openingHoursSpec } from "./hours";
import { absoluteUrl, SITE_URL } from "./site";
import { htmlLang, localizePath, ogLocale, punjabiLive, type Locale } from "@/i18n/config";

export function pageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle,
  lang = "en",
}: {
  title: string;
  description: string;
  /** The page's path without a language prefix, e.g. "/flyers". */
  path: string;
  /** Share image. Omit for the brand card; `false` when the route has its own opengraph-image file. */
  image?: string | false;
  /** Use the title verbatim (legacy titles already contain the brand). */
  absoluteTitle?: boolean;
  lang?: Locale;
}): Metadata {
  const url = localizePath(path, lang);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      // hreflang: every page exists in both languages (advertised only once Punjabi is live)
      ...(punjabiLive && {
        languages: { [htmlLang.en]: localizePath(path, "en"), [htmlLang.pa]: localizePath(path, "pa"), "x-default": localizePath(path, "en") },
      }),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Fruiticana",
      locale: ogLocale[lang],
      ...(punjabiLive && { alternateLocale: [ogLocale[lang === "en" ? "pa" : "en"]] }),
      type: "website",
      // Every page shares with an image: its own hero photo, else the brand card.
      ...(image === false
        ? {}
        : { images: [image ? { url: image } : { url: localizePath("/opengraph-image", lang), width: 1200, height: 630, alt: "Fruiticana" }] }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const metaFromPage = (page: Page, path: string, lang: Locale = "en"): Metadata =>
  pageMetadata({
    lang,
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro ?? "",
    path,
    image: page.heroImage?.src,
    absoluteTitle: Boolean(page.seoTitle),
  });

/* ---------------------------- JSON-LD ---------------------------- */

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Fruiticana",
    legalName: "Fruiticana Produce Ltd.",
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo.png"),
    foundingDate: String(s.founded),
    foundingLocation: "Surrey, British Columbia",
    slogan: s.tagline,
    email: s.email,
    telephone: `+1-${s.phone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.headOffice.street,
      addressLocality: s.headOffice.locality,
      addressRegion: s.headOffice.province,
      postalCode: s.headOffice.postalCode,
      addressCountry: "CA",
    },
    sameAs: s.socials.map((x) => x.href),
    areaServed: [
      { "@type": "AdministrativeArea", name: "British Columbia" },
      { "@type": "AdministrativeArea", name: "Alberta" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: `+1-${s.phone}`,
      email: s.email,
      areaServed: "CA",
    },
    brand: { "@type": "Brand", name: "Indican" },
  };
}

export const websiteLd = (lang: Locale = "en") => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Fruiticana",
  publisher: { "@id": ORG_ID },
  inLanguage: punjabiLive ? [htmlLang.en, htmlLang.pa] : htmlLang[lang],
});

/* Stores and the organisation keep one @id in both languages (one business, two page versions);
   `url` points at the page in the reader's language. */
export function storeLd(s: Store, lang: Locale = "en") {
  const address = [s.street, s.locality, s.province, s.postalCode].filter(Boolean).join(", ");
  return {
    "@context": "https://schema.org",
    // The head office is an office, not a shop: typed as a generic LocalBusiness.
    "@type": s.isHeadOffice ? "LocalBusiness" : "GroceryStore",
    "@id": absoluteUrl(`/storefinder/${s.slug}#store`),
    name: s.isHeadOffice ? "Fruiticana Head Office" : `Fruiticana ${s.name}`,
    url: absoluteUrl(localizePath(`/storefinder/${s.slug}`, lang)),
    image: absoluteUrl("/images/photos/store-produce-floor.jpg"),
    telephone: `+1-${s.phone.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}`,
    ...(s.isHeadOffice ? {} : { priceRange: "$", currenciesAccepted: "CAD" }),
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: s.locality,
      addressRegion: s.province,
      ...(s.postalCode ? { postalCode: s.postalCode } : {}),
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Fruiticana ${address}`)}`,
    openingHoursSpecification: [openingHoursSpec(s)],
    parentOrganization: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[], lang: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(localizePath(it.path, lang)) })),
  };
}

export function articleLd(p: Post, lang: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: p.title,
    datePublished: p.date,
    dateModified: p.date,
    description: p.excerpt,
    image: p.image ? [p.image.src.startsWith("http") ? p.image.src : absoluteUrl(p.image.src)] : undefined,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: absoluteUrl(localizePath(`/blog/${p.slug}`, lang)),
    inLanguage: htmlLang[lang],
  };
}

export function storeListLd(stores: Store[], name: string, lang: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: stores.length,
    itemListElement: stores.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(localizePath(`/storefinder/${s.slug}`, lang)), name: `Fruiticana ${s.name}` })),
  };
}
