import type { Locale } from "./config";

/** Dates in the page's language: "March 1, 2017" / "1 ਮਾਰਚ 2017" (Latin digits, as Canadian Punjabi print uses). */
export function formatDate(iso: string | Date, lang: Locale, options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) {
  return new Intl.DateTimeFormat(lang === "pa" ? "pa-IN" : "en-CA", options).format(typeof iso === "string" ? new Date(iso) : iso);
}
