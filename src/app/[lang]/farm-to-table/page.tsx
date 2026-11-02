import { ContentPage } from "@/components/page/ContentPage";
import { getLocale, getT } from "@/i18n/server";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/farm-to-table";
export async function generateMetadata() {
  return metaFromPage(await getPage("farm-to-table"), PATH, await getLocale());
}

export default async function Page() {
  const t = await getT();
  const page = await getPage("farm-to-table");
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: t.nav.ourCompany, path: "/our-company" }}
      facts={[
        { icon: "clock", title: t.pages.farmHours, body: t.pages.farmHoursBody },
        { icon: "leaf", title: t.pages.farmSeasonal, body: t.pages.farmSeasonalBody },
        { icon: "truck", title: t.pages.farmImported, body: t.pages.farmImportedBody },
      ]}
    />
  );
}
