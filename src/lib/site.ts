export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.fruiticana.com").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Site navigation. Labels and blurbs live in the dictionaries (`nav` / `navBlurb`), keyed by id. */
export const nav = [
  {
    id: "ourCompany",
    href: "/our-company",
    children: [
      { id: "ourStory", href: "/our-company" },
      { id: "commitment", href: "/commitment-to-quality" },
      { id: "farmToTable", href: "/farm-to-table" },
      { id: "employment", href: "/employment" },
    ],
  },
  { id: "indican", href: "/indican" },
  {
    id: "community",
    href: "/blog",
    children: [
      { id: "stories", href: "/blog" },
      { id: "events", href: "/events" },
      { id: "mangoes", href: "/mangoes" },
      { id: "report", href: "/forced-and-child-labour-report-2024-25" },
    ],
  },
  { id: "weeklySpecials", href: "/flyers" },
  { id: "storeLocator", href: "/storefinder" },
  { id: "contact", href: "/contact" },
] as const;

type NavDict = { nav: Record<string, string>; navBlurb: Record<string, string> };
/** The navigation with labels (and child blurbs) in the given dictionary's language. */
export const localizedNav = (t: NavDict) =>
  nav.map((item) => ({
    ...item,
    label: t.nav[item.id],
    children: "children" in item ? item.children.map((c) => ({ ...c, label: t.nav[c.id], blurb: t.navBlurb[c.id] })) : undefined,
  }));

export const regionLabels = {
  "greater-vancouver": "Greater Vancouver",
  calgary: "Calgary",
  chestermere: "Chestermere",
  edmonton: "Edmonton",
} as const;

/** Anchor id for a city group in the store directory, e.g. "city-new-westminster". */
export const citySlug = (city: string) => `city-${city.toLowerCase().replace(/[^a-z]+/g, "-")}`;
