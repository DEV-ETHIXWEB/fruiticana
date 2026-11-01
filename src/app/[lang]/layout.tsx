import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "../fonts";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SITE_URL } from "@/lib/site";
import { SiteShell } from "./SiteShell";
import "../globals.css";

/** Both languages are pre-rendered; any other first segment is a 404. */
export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

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

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={htmlLang[lang]} className={fontVariables}>
      <body>
        <I18nProvider lang={lang} dict={getDictionary(lang)}>
          <SiteShell>{children}</SiteShell>
        </I18nProvider>
      </body>
    </html>
  );
}
