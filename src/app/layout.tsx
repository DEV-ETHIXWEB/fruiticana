import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "New Fruiticana Grocery Stores in BC and Alberta",
    template: "%s | Fruiticana",
  },
  description:
    "Fresh fruits, vegetables and spices of the highest quality at the best price. 25 Fruiticana grocery stores across BC and Alberta since 1994.",
  applicationName: "Fruiticana",
  keywords: ["Fruiticana", "South Asian grocery", "Indian grocery Surrey", "Indian grocery Calgary", "Indican spices", "Rajan mangoes", "weekly specials", "fresh produce BC"],
  authors: [{ name: "Fruiticana" }],
  formatDetection: { telephone: true, address: true },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: "#0f3b26",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${fraunces.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
