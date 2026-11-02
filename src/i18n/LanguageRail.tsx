"use client";

import { useState } from "react";
import { punjabiLive, type Locale } from "./config";
import { useI18n } from "./I18nProvider";
import { useLanguageLink } from "./LanguageSwitcher";

const options: { lang: Locale; label: string; name: string; hrefLang: string }[] = [
  { lang: "en", label: "EN", name: "English", hrefLang: "en-CA" },
  { lang: "pa", label: "ਪੰਜਾਬੀ", name: "ਪੰਜਾਬੀ (Punjabi)", hrefLang: "pa-CA" },
];

function Option({ option, current, onPick }: { option: (typeof options)[number]; current: boolean; onPick: () => void }) {
  const { href, onClick } = useLanguageLink(option.lang);
  const base = "relative z-10 grid h-11 w-full place-items-center rounded-xl px-1 text-center font-semibold leading-tight transition-colors duration-300";
  const size = option.lang === "pa" ? "text-[0.8rem]" : "text-[0.82rem] tracking-[0.06em]";
  if (current)
    return (
      <span lang={option.lang} aria-current="true" className={`${base} ${size} text-forest`}>
        {option.label}
      </span>
    );
  return (
    <a
      href={href}
      hrefLang={option.hrefLang}
      lang={option.lang}
      aria-label={option.name}
      onClick={(e) => {
        onPick();
        onClick(e);
      }}
      className={`${base} ${size} text-cream hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric`}
    >
      {option.label}
    </a>
  );
}

/* Narrow screens: one slim vertical tab naming the other language, sized to the page gutter
   (container-x: 20px phone, 32px tablet, 48px laptop) so it never covers content:
   20px phone, 24px tablet, 44px from 1024px. scripts/qa-rail.mjs checks this on every page. */
function SlimTab({ target }: { target: (typeof options)[number] }) {
  const { href, onClick } = useLanguageLink(target.lang);
  return (
    <a
      href={href}
      hrefLang={target.hrefLang}
      lang={target.lang}
      aria-label={target.name}
      onClick={onClick}
      className="lang-tab flex w-5 flex-col items-center gap-2 rounded-l-xl border border-r-0 border-forest/20 bg-turmeric py-3 text-forest shadow-[0_10px_28px_-6px_rgba(9,40,26,0.6)] transition-[background-color,transform] duration-300 hover:bg-[#ffe03a] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:w-6 lg:w-11 lg:rounded-l-2xl lg:pt-2 lg:pb-3"
    >
      <span aria-hidden className="hidden size-6 place-items-center lg:grid rounded-full bg-forest text-[0.75rem] leading-none font-bold text-cream">
        {target.lang === "en" ? "A" : "ਅ"}
      </span>
      <span className="text-[0.72rem] leading-none sm:text-[0.78rem] font-semibold [writing-mode:vertical-rl] lg:text-[0.85rem]">{target.lang === "en" ? "English" : target.label}</span>
    </a>
  );
}

/**
 * Language toggle pinned to the right edge of every page, so a visitor can switch between
 * English and Punjabi from anywhere without scrolling back to the header. Both languages are
 * named in their own script; the current one is highlighted (1400px and wider; narrower
 * screens get a slim tab). Sits under the header, menu and
 * flyer viewer (z-30), and is left out of print.
 */
export function LanguageRail() {
  const { lang, t } = useI18n();
  // the highlight slides to the chosen language the moment it is clicked
  const [picked, setPicked] = useState<Locale>(lang);
  if (!punjabiLive) return null;
  const index = options.findIndex((o) => o.lang === picked);
  return (
    <nav aria-label={t.language.rail} data-qa-i18n-skip className="fixed top-1/2 right-0 z-30 -translate-y-1/2 print:hidden">
      <div className="min-[1400px]:hidden">
        <SlimTab target={options.find((o) => o.lang !== lang)!} />
      </div>
      <div className="relative hidden w-[3.75rem] flex-col gap-1 rounded-l-2xl border border-r-0 border-cream/30 bg-forest/95 p-1.5 shadow-[0_10px_30px_-8px_rgba(9,40,26,0.55)] backdrop-blur-sm min-[1400px]:flex">
        <span
          aria-hidden
          className="lang-pill absolute inset-x-1.5 top-1.5 h-11 rounded-xl bg-turmeric shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(246,210,28,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{ transform: `translateY(${index * 3}rem)` }}
        />
        {options.map((o) => (
          <Option key={o.lang} option={o} current={o.lang === picked} onPick={() => setPicked(o.lang)} />
        ))}
      </div>
    </nav>
  );
}
