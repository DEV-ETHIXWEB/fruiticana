import { ContentPage } from "@/components/page/ContentPage";
import { ButtonLink } from "@/components/ui/Button";
import { getPage, getSettings } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/employment";
export async function generateMetadata() {
  return metaFromPage(await getPage("employment"), PATH);
}

export default async function Page() {
  const [page, settings] = await Promise.all([getPage("employment"), getSettings()]);
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: "Our Company", path: "/our-company" }}
      facts={[
        { icon: "heart", title: "Customer-first", body: "We look for people passionate about serving customers." },
        { icon: "spark", title: "Positive & energetic", body: "You enjoy a fast-paced environment focused on customers’ needs." },
      ]}
      aside={
        <div className="rounded-2xl bg-forest p-6 text-cream">
          <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-turmeric uppercase">Apply</p>
          <p className="mt-2 font-display text-2xl">Send us your résumé</p>
          <p className="mt-2 text-sm text-cream/70">Tell us which store you’d like to work at.</p>
          <ButtonLink href={`mailto:${settings.jobsEmail}?subject=${encodeURIComponent("Employment application")}`} variant="light" className="mt-5 w-full" magnetic={false}>
            {settings.jobsEmail}
          </ButtonLink>
        </div>
      }
    />
  );
}
