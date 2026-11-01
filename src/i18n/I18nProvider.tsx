"use client";

import { createContext, useContext, type ReactNode } from "react";
import { localizePath, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18n = { lang: Locale; t: Dictionary; href: (path: string) => string };

const Ctx = createContext<I18n | null>(null);

/** Gives client components the current language, its dictionary and a localized href helper. */
export function I18nProvider({ lang, dict, children }: { lang: Locale; dict: Dictionary; children: ReactNode }) {
  return <Ctx.Provider value={{ lang, t: dict, href: (path) => localizePath(path, lang) }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
