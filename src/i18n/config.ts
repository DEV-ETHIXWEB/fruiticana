/**
 * Languages. English lives at the existing URLs (no prefix, so nothing changes for SEO or
 * old links); Punjabi (Gurmukhi script) mirrors every page under /pa.
 */
export const locales = ["en", "pa"] as const;


/**
 * Release switch for the Punjabi version: on by default. Setting NEXT_PUBLIC_PUNJABI_LIVE=0
 * in the hosting environment hides every language button, makes /pa return 404 and stops
 * advertising Punjabi URLs to search engines (an emergency off switch).
 */
export const punjabiLive = process.env.NEXT_PUBLIC_PUNJABI_LIVE !== "0";
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** <html lang>, hreflang and Open Graph locale codes. */
export const htmlLang: Record<Locale, string> = { en: "en-CA", pa: "pa-CA" };
export const ogLocale: Record<Locale, string> = { en: "en_CA", pa: "pa_IN" };

/** The name of each language, written in that language (used by the switcher). */
export const languageName: Record<Locale, string> = { en: "English", pa: "ਪੰਜਾਬੀ" };

/** Cookie remembering a visitor's explicit language choice. */
/** sessionStorage key: where the reader was, so the other language opens at the same spot */
export const SWITCH_KEY = "fr-lang-switch";

export const LANG_COOKIE = "fr_lang";

/** Paths that are never localized: API routes, the CMS, files (PDFs, images, feeds). */
const unlocalized = (path: string) => /^\/(api|studio)(\/|$)/.test(path) || /\.[a-z0-9]+$/i.test(path.split(/[?#]/)[0]);

/** "/flyers" -> "/pa/flyers" in Punjabi; English URLs carry no prefix. Hashes and queries are kept. */
export function localizePath(path: string, lang: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//") || unlocalized(path)) return path;
  const bare = stripLocale(path).path;
  if (lang === defaultLocale) return bare;
  return bare === "/" ? "/pa" : bare.startsWith("/?") || bare.startsWith("/#") ? `/pa${bare.slice(1)}` : `/pa${bare}`;
}

/** "/pa/flyers?x=1" -> { lang: "pa", path: "/flyers?x=1" }. */
export function stripLocale(path: string): { lang: Locale; path: string } {
  const m = path.match(/^\/(pa|en)(?=\/|\?|#|$)/);
  if (!m) return { lang: defaultLocale, path: path || "/" };
  const rest = path.slice(m[0].length);
  return { lang: m[1] as Locale, path: rest.startsWith("/") ? rest : `/${rest}` };
}
