import { ApplyForm } from "@/components/forms/ApplyForm";
import { Reveal } from "@/components/motion/primitives";
import { ContentPage } from "@/components/page/ContentPage";
import { JsonLd } from "@/components/ui/JsonLd";
import { formatDate } from "@/i18n/format";
import { getLocale, getT } from "@/i18n/server";
import { getJobs, getPage, getRetailStores, getSettings } from "@/lib/content";
import { jobPostingLd, metaFromPage } from "@/lib/seo";

const PATH = "/employment";
export async function generateMetadata() {
  return metaFromPage(await getPage("employment"), PATH, await getLocale());
}

export default async function Page() {
  const [t, lang] = await Promise.all([getT(), getLocale()]);
  const [page, settings, jobs, stores] = await Promise.all([getPage("employment"), getSettings(), getJobs(), getRetailStores()]);
  const c = t.careers;
  // a job's store, matched by name, gives its address; otherwise head office
  const placeOf = (store?: string) => stores.find((s) => store && s.name.toLowerCase() === store.toLowerCase()) ?? settings.headOffice;

  return (
    <>
      {jobs.length > 0 && <JsonLd data={jobs.map((j) => jobPostingLd(j, placeOf(j.store), lang))} />}
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
            <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-turmeric uppercase">{c.orEmail}</p>
            <p className="mt-2 font-display text-2xl">{t.pages.sendResume}</p>
            <p className="mt-2 text-sm text-cream/70">{t.pages.whichStore}</p>
            <a href={`mailto:${settings.jobsEmail}?subject=${encodeURIComponent("Employment application")}`} className="mt-4 block rounded-full bg-cream px-4 py-3 text-center text-sm font-semibold text-forest transition-colors hover:bg-white">
              {settings.jobsEmail}
            </a>
          </div>
        }
        after={
          <section
            id="apply"
            className={`container-x grid scroll-mt-28 gap-10 pb-14 sm:pb-20 ${jobs.length ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-16" : "max-w-3xl"}`}
          >
            <div>
              <h2 className="font-display text-title text-forest">{c.openRoles}</h2>
              {jobs.length === 0 ? (
                <p className="mt-3 text-ink-soft">{c.noRoles}</p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {jobs.map((j) => (
                    <li key={j.id} id={`job-${j.id}`} className="scroll-mt-28 rounded-2xl bg-paper/70 p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-display text-xl text-ink">{j.title}</h3>
                        <span className="text-xs font-semibold tracking-wide text-leaf uppercase">{c.employmentType[j.type]}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {j.store || t.common.headOffice} · {c.posted(formatDate(j.posted, lang))}
                      </p>
                      <p className="mt-3 text-[0.95rem] whitespace-pre-line text-ink-soft">{j.description}</p>
                      <a href={`?position=${encodeURIComponent(j.title)}#apply-form`} className="mt-4 inline-flex text-sm font-semibold text-chili-deep hover:underline">
                        {c.applyNow} →
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Reveal>
              <div id="apply-form" className="scroll-mt-28 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-ink/[0.06] sm:p-8">
                <h2 className="font-display text-title text-forest">{c.applyTitle}</h2>
                <p className="mt-2 mb-6 text-ink-soft">{c.applyIntro}</p>
                <ApplyForm positions={jobs.map((j) => j.title)} stores={stores.map((s) => s.name)} />
              </div>
            </Reveal>
          </section>
        }
      />
    </>
  );
}
