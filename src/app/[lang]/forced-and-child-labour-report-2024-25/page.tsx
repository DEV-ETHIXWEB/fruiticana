import Image from "next/image";
import { getLocale, getT } from "@/i18n/server";
import { PageHero } from "@/components/page/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPage } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/forced-and-child-labour-report-2024-25";
const PDF = "/docs/forced-and-child-labour-report-2024-25.pdf";
const PAGES = 7;

export async function generateMetadata() {
  return metaFromPage(await getPage("forced-and-child-labour-report-2024-25"), PATH, await getLocale());
}

export default async function ReportPage() {
  const t = await getT();
  const page = await getPage("forced-and-child-labour-report-2024-25");
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} crumbs={[{ name: t.nav.community, path: "/blog" }, { name: t.nav.report, path: PATH }]}>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={PDF} variant="primary" target="_blank" arrow={false}>
            <span className="inline-flex items-center gap-2">
              <Icon name="external" className="size-4" /> {t.pages.openReport}
            </span>
          </ButtonLink>
          <ButtonLink href={PDF} variant="ghost" download arrow={false}>
            <span className="inline-flex items-center gap-2">
              <Icon name="download" className="size-4" /> {t.pages.downloadPdf}
            </span>
          </ButtonLink>
        </div>
      </PageHero>
      <section className="container-x py-16 lg:py-20">
        <div className="mx-auto max-w-[min(72rem,calc((100svh-12rem)*1.55))] overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/10">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4 text-sm">
            <span className="font-medium">{t.pages.fiscalYear}</span>
            <span className="text-muted">{t.pages.reportPages(PAGES)}</span>
          </div>
          {/* Punjabi only: the official report itself is published in English */}
          {t.pages.reportLanguageNote && <p className="border-b border-ink/10 bg-paper/60 px-6 py-3 text-sm text-ink-soft">{t.pages.reportLanguageNote}</p>}
          {/* Rendered page images: readable on every device, no PDF plugin needed */}
          {/* Two-page spreads from md up so a page never exceeds the screen; tap a page to read it full size */}
          <ol className="grid gap-px bg-ink/10 md:grid-cols-2">
            {Array.from({ length: PAGES }, (_, i) => (
              <li key={i} className="bg-white">
                <a href={`/docs/report-p${i + 1}.jpg`} target="_blank" rel="noopener noreferrer" className="group relative block" aria-label={t.pages.openReportPage(i + 1, PAGES)}>
                <Image
                  src={`/docs/report-p${i + 1}.jpg`}
                  alt={t.pages.reportPageAlt(i + 1, PAGES)}
                  width={1222}
                  height={1580}
                  sizes="(min-width: 768px) 36rem, 100vw"
                  preload={i === 0}
                  className="h-auto w-full"
                />
                <span className="absolute right-3 bottom-3 rounded-full bg-forest/85 px-3 py-1.5 text-xs font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {t.pages.reportPageLink(i + 1)}
                </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
