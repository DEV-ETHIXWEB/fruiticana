import { Fraunces, Instrument_Sans, Noto_Sans_Gurmukhi, Noto_Serif_Gurmukhi } from "next/font/google";

/*
 * Fonts are self-hosted by next/font (no Google request, no layout shift:
 * size-adjusted fallbacks are generated automatically) and trimmed to the
 * axes we actually use: Fraunces keeps SOFT (warm curves), WONK (the leaning,
 * hand-drawn italic and n/m/h shapes) and opsz (tighter, higher-contrast cuts
 * at display sizes, chosen automatically per font size). Instrument Sans'
 * width axis is dropped to cut preload weight.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

/*
 * Punjabi (Gurmukhi). These sit after the Latin fonts in each stack (see globals.css), so
 * brand names, prices and numbers keep Fraunces / Instrument Sans while Gurmukhi letters use
 * the matching Noto serif / sans. They are limited to the Gurmukhi subset (unicode-range),
 * so English pages never download them, and are not preloaded for the same reason.
 */
const notoSerifGurmukhi = Noto_Serif_Gurmukhi({
  subsets: ["gurmukhi"],
  variable: "--font-gurmukhi-serif",
  display: "swap",
  preload: false,
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  variable: "--font-gurmukhi-sans",
  display: "swap",
  preload: false,
});

export const fontVariables = [fraunces.variable, instrument.variable, notoSerifGurmukhi.variable, notoSansGurmukhi.variable].join(" ");
