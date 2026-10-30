import { ContentPage } from "@/components/page/ContentPage";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/commitment-to-quality";
export async function generateMetadata() {
  return metaFromPage(await getPage("commitment-to-quality"), PATH);
}

export default async function Page() {
  const page = await getPage("commitment-to-quality");
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: "Our Company", path: "/our-company" }}
      facts={[
        { icon: "leaf", title: "Direct sourcing", body: "We deal directly with growers, packers and manufacturers wherever we can." },
        { icon: "badge", title: "Indican, since 1997", body: "Our own brand of premium spices, lentils and juices from India." },
        { icon: "truck", title: "Our own facilities", body: "Fruiticana runs its own procuring and packing facilities in India." },
      ]}
    />
  );
}
