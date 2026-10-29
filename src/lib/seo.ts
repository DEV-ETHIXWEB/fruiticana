import type { Metadata } from "next";
import type { Page, Post, SiteSettings, Store } from "./content/types";
import { openingHoursSpec } from "./hours";
import { absoluteUrl, SITE_URL } from "./site";

export function pageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Use the title verbatim (legacy titles already contain the brand). */
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Fruiticana",
      locale: "en_CA",
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const metaFromPage = (page: Page, path: string): Metadata =>
  pageMetadata({
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
    brand: { "@type": "Brand", name: "Indican" },
  };
}

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Fruiticana",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-CA",
});

export function storeLd(s: Store) {
  const address = [s.street, s.locality, s.province, s.postalCode].filter(Boolean).join(", ");
  return {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "@id": absoluteUrl(`/storefinder/${s.slug}#store`),
    name: s.isHeadOffice ? "Fruiticana Head Office" : `Fruiticana ${s.name}`,
    url: absoluteUrl(`/storefinder/${s.slug}`),
    image: absoluteUrl("/images/photos/store-produce-floor.jpg"),
    telephone: `+1-${s.phone.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}`,
    priceRange: "$",
    servesCuisine: undefined,
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

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function articleLd(p: Post) {
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
    mainEntityOfPage: absoluteUrl(`/blog/${p.slug}`),
  };
}

export function storeListLd(stores: Store[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fruiticana grocery stores in BC and Alberta",
    numberOfItems: stores.length,
    itemListElement: stores.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/storefinder/${s.slug}`), name: `Fruiticana ${s.name}` })),
  };
}
