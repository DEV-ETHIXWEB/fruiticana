import "server-only";
import { lang as rootLang } from "next/root-params";
import { defaultLocale, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/** The current page's language, read from the [lang] root segment (Server Components only). */
export async function getLocale(): Promise<Locale> {
  try {
    const value = await rootLang();
    return value && isLocale(value) ? value : defaultLocale;
  } catch {
    // Route handlers (sitemap, robots) can't read root params yet: they're language-neutral.
    return defaultLocale;
  }
}

/** The current page's dictionary. */
export async function getT() {
  return getDictionary(await getLocale());
}
