export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.fruiticana.com").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const nav = [
  {
    label: "Our Company",
    href: "/our-company",
    children: [
      { label: "Our Story", href: "/our-company", blurb: "From one Surrey store in 1994 to 25 across BC & Alberta." },
      { label: "Commitment to Quality", href: "/commitment-to-quality", blurb: "Direct from growers, packers and our own facilities in India." },
      { label: "Farm to Table", href: "/farm-to-table", blurb: "Local farm produce on our shelves within 12-24 hours." },
      { label: "Employment", href: "/employment", blurb: "Join a team where people connect with “home”." },
    ],
  },
  { label: "Indican", href: "/indican" },
  {
    label: "In The Community",
    href: "/blog",
    children: [
      { label: "Community Stories", href: "/blog", blurb: "Philanthropy, sponsorships and contests." },
      { label: "Events", href: "/events", blurb: "What’s happening in and around our stores." },
      { label: "Mangoes", href: "/mangoes", blurb: "Rajan mangoes, our signature, exclusive to Fruiticana." },
      { label: "Forced and Child Labour Report 2024\u201125", href: "/forced-and-child-labour-report-2024-25", blurb: "Our supply-chain transparency report." },
    ],
  },
  { label: "Weekly Specials", href: "/flyers" },
  { label: "Store Locator", href: "/storefinder" },
  { label: "Contact", href: "/contact" },
] as const;

export const regionLabels = {
  "greater-vancouver": "Greater Vancouver",
  calgary: "Calgary",
  chestermere: "Chestermere",
  edmonton: "Edmonton",
} as const;

/** Anchor id for a city group in the store directory, e.g. "city-new-westminster". */
export const citySlug = (city: string) => `city-${city.toLowerCase().replace(/[^a-z]+/g, "-")}`;
