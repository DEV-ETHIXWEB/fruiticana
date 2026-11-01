import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/ui/JsonLd";
import { getSettings, getStores } from "@/lib/content";
import { organizationLd, websiteLd } from "@/lib/seo";

/** The site chrome around every page: structured data, header, main, footer. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, stores] = await Promise.all([getSettings(), getStores()]);
  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd()]} />
      <SmoothScroll />
      <Header announcement={settings.announcement} phone={settings.phone} />
      <main id="main">{children}</main>
      <Footer settings={settings} stores={stores} />
    </>
  );
}
