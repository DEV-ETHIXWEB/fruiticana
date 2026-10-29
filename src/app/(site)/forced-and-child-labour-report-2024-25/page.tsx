import { PageHero } from "@/components/page/PageHero";
import { Reveal } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/forced-and-child-labour-report-2024-25";
const PDF = "/docs/forced-and-child-labour-report-2024-25.pdf";

export async function generateMetadata() {
  return metaFromPage(await getPage("forced-and-child-labour-report-2024-25"), PATH);
}

export default async function ReportPage() {
  const page = await getPage("forced-and-child-labour-report-2024-25");
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} crumbs={[{ name: "In The Community", path: "/blog" }, { name: "Forced and Child Labour Report 2024-25", path: PATH }]}>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={PDF} variant="primary" target="_blank" arrow={false}>
            <span className="inline-flex items-center gap-2">
              <Icon name="external" className="size-4" /> Open full report
            </span>
          </ButtonLink>
          <ButtonLink href={PDF} variant="ghost" download arrow={false}>
            <span className="inline-flex items-center gap-2">
              <Icon name="download" className="size-4" /> Download PDF · 340 KB
            </span>
          </ButtonLink>
        </div>
      </PageHero>
      <section className="container-x py-16 lg:py-20">
        <Reveal>
          <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/10">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4 text-sm">
              <span className="font-medium">Fruiticana Produce Ltd. · Fiscal Year 2024-25</span>
              <span className="text-muted">PDF</span>
            </div>
            <object data={`${PDF}#view=FitH`} type="application/pdf" className="block h-[80vh] min-h-[36rem] w-full" aria-label="Forced and Child Labour Report 2024-25">
              <div className="grid place-items-center gap-4 p-12 text-center">
                <p className="text-ink-soft">Your browser can’t display PDFs inline.</p>
                <a href={PDF} className="font-semibold text-leaf underline underline-offset-4">
                  Download the report
                </a>
              </div>
            </object>
          </div>
        </Reveal>
      </section>
    </>
  );
}
