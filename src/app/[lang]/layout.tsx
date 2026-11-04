import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "../fonts";
import { htmlLang, isLocale, locales, punjabiLive, SWITCH_KEY } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SITE_URL } from "@/lib/site";
import { SiteShell } from "./SiteShell";
import { TrackClicks } from "@/components/analytics/TrackClicks";
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

/*
 * Language switch, the arriving side: scrolls the new page to the section the reader was
 * reading (saved by useLanguageLink). Registered at the end of the body, which still runs
 * before the first paint (both wait for the stylesheet), so pagereveal scrolls before the
 * view transition reveals the page; DOMContentLoaded is the fallback.
 */
const restoreSpot = `(function(){try{var k=${JSON.stringify(SWITCH_KEY)},s=sessionStorage.getItem(k);if(!s)return;sessionStorage.removeItem(k);var d=JSON.parse(s);if(d.to!==location.pathname+location.search||!d.spot)return;var p=d.spot,done=false,go=function(){if(done)return;var m=document.querySelector("main"),h=document.documentElement,el=m&&m.children[p.i],y;if(el){var b=el.getBoundingClientRect();y=b.top+scrollY+p.frac*b.height-80}else y=p.ratio*(h.scrollHeight-innerHeight);scrollTo({top:Math.max(0,y),behavior:"instant"});if(document.readyState!=="loading")done=true};addEventListener("pagereveal",go);document.addEventListener("DOMContentLoaded",go)}catch(e){}})();`;

/*
 * Vercel Web Analytics: cookieless, aggregate visit counts (described in the privacy policy).
 * Only on Vercel builds; enable it once under the project's Analytics tab. The queue lets
 * track() calls made before the script loads still count.
 */
const analyticsOn = process.env.VERCEL === "1";
const analyticsQueue = "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};";

/* Prerender the other language as soon as the reader shows intent (hover / press on a
   language link), so the switch is instant. Chromium only; elsewhere it is a normal link. */
const speculation = JSON.stringify({ prerender: [{ where: { selector_matches: "a[hreflang]" }, eagerness: "moderate" }] });

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={htmlLang[lang]} className={fontVariables}>
      <body>
        <I18nProvider lang={lang}>
          <SiteShell>{children}</SiteShell>
        </I18nProvider>
        {/* last in the body: an inline script waits for the stylesheet, and here that holds
            up nothing (at the top it would delay discovering the hero image) */}
        <TrackClicks />
        {analyticsOn && (
          <>
            <script dangerouslySetInnerHTML={{ __html: analyticsQueue }} />
            <script defer src="/_vercel/insights/script.js" />
          </>
        )}
        {punjabiLive && (
          <>
            <script dangerouslySetInnerHTML={{ __html: restoreSpot }} />
            <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculation }} />
          </>
        )}
      </body>
    </html>
  );
}
