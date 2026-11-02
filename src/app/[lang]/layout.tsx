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

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.home.metaTitle, template: "%s | Fruiticana" },
    description: t.site.defaultDescription,
    applicationName: "Fruiticana",
    keywords: [...t.site.keywords],
    authors: [{ name: "Fruiticana" }],
    formatDetection: { telephone: true, address: true },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

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
        <I18nProvider lang={lang}>
          <SiteShell>{children}</SiteShell>
        </I18nProvider>
      </body>
    </html>
  );
}
