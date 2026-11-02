import { ContentPage } from "@/components/page/ContentPage";
import { getLocale, getT } from "@/i18n/server";
import { ButtonLink } from "@/components/ui/Button";
import { getPage, getSettings } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/employment";
export async function generateMetadata() {
  return metaFromPage(await getPage("employment"), PATH, await getLocale());
}

export default async function Page() {
  const t = await getT();
  const [page, settings] = await Promise.all([getPage("employment"), getSettings()]);
  return (
    <ContentPage
      page={page}
      path={PATH}
      parent={{ name: t.nav.ourCompany, path: "/our-company" }}
      facts={[
        { icon: "heart", title: t.pages.customerFirst, body: t.pages.customerFirstBody },
        { icon: "sparkle", title: t.pages.positive, body: t.pages.positiveBody },
      ]}
      aside={
        <div className="rounded-2xl bg-forest p-6 text-cream">
          <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-turmeric uppercase">{t.pages.apply}</p>
          <p className="mt-2 font-display text-2xl">{t.pages.sendResume}</p>
          <p className="mt-2 text-sm text-cream/70">{t.pages.whichStore}</p>
          <ButtonLink href={`mailto:${settings.jobsEmail}?subject=${encodeURIComponent("Employment application")}`} variant="light" className="mt-5 w-full" magnetic={false}>
            {settings.jobsEmail}
          </ButtonLink>
        </div>
      }
    />
  );
}
