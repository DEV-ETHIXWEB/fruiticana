import { ContentPage } from "@/components/page/ContentPage";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/farm-to-table";
export async function generateMetadata() {
  return metaFromPage(await getPage("farm-to-table"), PATH);
}

export default async function Page() {
  const page = await getPage("farm-to-table");
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: "Our Company", path: "/our-company" }}
      facts={[
        { icon: "clock", title: "12-24 hours", body: "From local farm to every Fruiticana location." },
        { icon: "leaf", title: "Seasonal, daily", body: "Fresh seasonal produce from local farms, every day." },
        { icon: "truck", title: "Imported fast", body: "Produce from outside Canada is delivered to stores as quickly as possible." },
      ]}
    />
  );
}
