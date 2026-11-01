"use client";

import { usePathname } from "next/navigation";
import { LANG_COOKIE, localizePath, punjabiLive, stripLocale, type Locale } from "./config";
import { useI18n } from "./I18nProvider";

/**
 * Switches to the same page in the other language. It is a real link (works without
 * JavaScript and is crawlable), labelled in the target language's own script, and it
 * remembers the choice so the homepage opens in that language next time.
 */
export function LanguageSwitcher({ variant = "pill", tone = "light", className = "" }: { variant?: "pill" | "menu" | "text"; tone?: "light" | "dark"; className?: string }) {
  const { lang, t } = useI18n();
  const target: Locale = lang === "en" ? "pa" : "en";
  const { path } = stripLocale(usePathname() || "/");
  const href = localizePath(path, target);
  if (!punjabiLive) return null;

  const remember = () => {
    document.cookie = `${LANG_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
  };
  // keep any ?query (e.g. the selected flyer region) when switching
  const withQuery = () => (typeof window === "undefined" ? href : href + window.location.search);

  const label = (
    <>
      <span aria-hidden className={`grid size-5 place-items-center rounded-full text-[0.7rem] leading-none font-bold ${variant === "menu" ? "bg-forest text-cream" : tone === "dark" ? "bg-cream/20 text-cream" : "bg-forest text-cream"}`}>
        {target === "pa" ? "ਅ" : "A"}
      </span>
      {/* In the header at 1280-1535px (full nav + both CTAs) only the badge shows; the
          aria-label still names the language. Everywhere else the full label is visible. */}
      <span lang={target === "pa" ? "pa" : "en"} className={variant === "pill" ? "max-[359px]:sr-only xl:max-2xl:sr-only" : ""}>
        {t.language.switchTo}
      </span>
    </>
  );

  const styles = {
    pill: `btn-glass ${tone === "dark" ? "btn-glass-dark text-cream" : "text-forest"} inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[0.85rem] font-semibold sm:gap-2 sm:px-3 xl:max-2xl:p-2.5`,
    menu: "btn-3d btn-cream flex items-center justify-center gap-2 rounded-full bg-cream py-3.5 text-sm font-semibold text-forest",
    text: "inline-flex items-center gap-2 text-sm font-semibold hover:text-turmeric",
  }[variant];

  return (
    <a
      href={href}
      hrefLang={target === "pa" ? "pa-CA" : "en-CA"}
      aria-label={t.language.switchToLabel}
      onClick={(e) => {
        remember();
        const to = withQuery();
        if (to !== href) {
          e.preventDefault();
          window.location.assign(to);
        }
      }}
      className={`${styles} ${className}`}
    >
      {label}
    </a>
  );
}
