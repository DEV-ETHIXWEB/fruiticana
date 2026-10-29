import Image from "next/image";
import { PageHero } from "@/components/page/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/forced-and-child-labour-report-2024-25";
const PDF = "/docs/forced-and-child-labour-report-2024-25.pdf";
const PAGES = 7;

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
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/10">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4 text-sm">
            <span className="font-medium">Fruiticana Produce Ltd. · Fiscal Year 2024-25</span>
            <span className="text-muted">{PAGES} pages</span>
          </div>
          {/* Rendered page images: readable on every device, no PDF plugin needed */}
          <ol className="space-y-px bg-ink/10">
            {Array.from({ length: PAGES }, (_, i) => (
              <li key={i} className="bg-white">
                <Image
                  src={`/docs/report-p${i + 1}.jpg`}
                  alt={`Forced and Child Labour Report 2024-25, page ${i + 1} of ${PAGES}`}
                  width={1222}
                  height={1580}
                  sizes="(min-width: 896px) 56rem, 100vw"
                  preload={i === 0}
                  className="h-auto w-full"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
