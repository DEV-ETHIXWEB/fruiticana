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
  /** Punjabi text from the CMS (blank fields fall back, see content/localize.ts) */
  pa?: { label?: string; imageAlt?: string };
};

export type CampaignBanner = {
  id: string;
  image: Img;
  href?: string;
  label: string;
  /** Last day the banner shows (YYYY-MM-DD, Pacific time); after it the banner hides itself */
  endsOn?: string;
  pa?: { label?: string; imageAlt?: string };
};

export type Video = {
  youtubeId: string;
  title: string;
  caption?: string;
  poster: Img;
  pa?: { title?: string; caption?: string; posterAlt?: string };
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
  pa?: { title?: string; category?: string; excerpt?: string; imageAlt?: string; body?: PortableTextBlock[]; seoTitle?: string; seoDescription?: string };
};

export type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
  pa?: { title?: string; location?: string; description?: string };
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
  pa?: { title?: string; eyebrow?: string; intro?: string; heroAlt?: string; body?: PortableTextBlock[]; seoTitle?: string; seoDescription?: string };
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
  /** WhatsApp channel for weekly deals; shown in the footer and on the flyers page once set */
  whatsappUrl?: string;
  /** Delivery services Fruiticana sells through (Instacart, Uber Eats...); shown on the flyers page once set */
  deliveryLinks?: { label: string; href: string }[];
  pa?: { tagline?: string; mission?: string; companySummary?: string; presidentQuote?: string; presidentName?: string; announcementText?: string };
};

export type EmploymentType = "full-time" | "part-time" | "seasonal";

/** An open position, managed in the CMS (Studio, "Job opening"). */
export type Job = {
  id: string;
  title: string;
  store?: string;
  type: EmploymentType;
  description: string;
  posted: string;
  pa?: { title?: string; description?: string };
};
