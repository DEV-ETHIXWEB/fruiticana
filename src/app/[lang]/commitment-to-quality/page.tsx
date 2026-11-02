import { ContentPage } from "@/components/page/ContentPage";
import { getLocale, getT } from "@/i18n/server";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/commitment-to-quality";
export async function generateMetadata() {
  return metaFromPage(await getPage("commitment-to-quality"), PATH, await getLocale());
}

export default async function Page() {
  const t = await getT();
  const page = await getPage("commitment-to-quality");
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: t.nav.ourCompany, path: "/our-company" }}
      facts={[
        { icon: "leaf", title: t.pages.qualityDirect, body: t.pages.qualityDirectBody },
        { icon: "badge", title: t.home.promiseIndican, body: t.pages.qualityIndicanBody },
        { icon: "truck", title: t.pages.qualityFacilities, body: t.pages.qualityFacilitiesBody },
      ]}
    />
  );
}
