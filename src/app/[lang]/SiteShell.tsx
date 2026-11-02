import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/ui/JsonLd";
import { LanguageRail } from "@/i18n/LanguageRail";
import { getLocale } from "@/i18n/server";
import { getSettings, getStores } from "@/lib/content";
import { organizationLd, websiteLd } from "@/lib/seo";

/** The site chrome around every page: structured data, header, main, footer. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, stores] = await Promise.all([getSettings(), getStores()]);
  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd(await getLocale())]} />
      <SmoothScroll />
      <Header announcement={settings.announcement} phone={settings.phone} />
      <main id="main">{children}</main>
      <Footer settings={settings} stores={stores} />
      <LanguageRail />
    </>
  );
}
