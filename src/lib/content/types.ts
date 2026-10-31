import type { PortableTextBlock } from "@portabletext/types";

/** A resolved image, local path (seed) or CDN URL (Sanity) with intrinsic size. */
export type Img = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** base64 blur placeholder, Sanity only */
  lqip?: string;
};

export type Province = "BC" | "AB";

export type FlyerRegion = "greater-vancouver" | "chestermere" | "edmonton" | "calgary";

export type Store = {
  slug: string;
  name: string;
  /** Neighbourhood / city grouping used for filtering (matches the legacy locator) */
  city: string;
  street: string;
  locality: string;
  province: Province;
  postalCode?: string;
  phone: string;
  lat: number;
  lng: number;
  /** 24h "HH:MM", every store keeps the same hours seven days a week */
  opens: string;
  closes: string;
  flyerRegion: FlyerRegion;
  isHeadOffice?: boolean;
};

export type Flyer = {
  region: FlyerRegion;
  label: string;
  image: Img;
  validFrom?: string;
  validTo?: string;
};

export type CampaignBanner = {
  id: string;
  image: Img;
  href?: string;
  label: string;
};

export type Video = {
  youtubeId: string;
  title: string;
  caption?: string;
  poster: Img;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image?: Img;
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
};

export type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
};

export type Page = {
  slug: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  heroImage?: Img;
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  founded: number;
  phone: string;
  email: string;
  jobsEmail: string;
  headOffice: { street: string; locality: string; province: Province; postalCode: string };
  mission: string;
  companySummary: string;
  presidentQuote: string;
  presidentName: string;
  presidentTitle: string;
  socials: { label: string; href: string }[];
  warehouseSqFt: number;
  announcement?: { text: string; href?: string };
};
