import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { formatDate } from "@/i18n/format";
import { getLocale, getT } from "@/i18n/server";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/privacy";
/** Change this date whenever the policy text changes. */
const UPDATED = "2026-11-04";

export async function generateMetadata() {
  const [t, lang] = await Promise.all([getT(), getLocale()]);
  return pageMetadata({ title: t.privacy.metaTitle, description: t.privacy.metaDescription, path: PATH, lang });
}

export default async function PrivacyPage() {
  const [t, lang, settings] = await Promise.all([getT(), getLocale(), getSettings()]);
  const p = t.privacy;
  const office = settings.headOffice;
  const address = `${office.street}, ${office.locality}, ${office.province} ${office.postalCode}`;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} intro={p.intro} crumbs={[{ name: p.metaTitle, path: PATH }]} />
      <article className="container-x max-w-3xl pt-6 pb-14 sm:pb-20">
        <p className="text-sm text-muted">
          <time dateTime={UPDATED}>{p.updated(formatDate(UPDATED, lang))}</time>
        </p>
        <div className="prose-fr mt-8 [&>section:first-child>h2]:mt-0">
          {p.sections.map((s) => (
            <section key={s.title} className="space-y-4">
              <h2>{s.title}</h2>
              {s.body.map((b) => (
                <p key={b}>{b}</p>
              ))}
              {s.list.length > 0 && (
                <ul>
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section className="space-y-4">
            <h2>{p.contactTitle}</h2>
            <p>{p.contactBody(settings.email, settings.phone, address)}</p>
            <p className="text-sm text-muted">{p.changes}</p>
          </section>
        </div>
      </article>
      <RelatedLinks exclude={PATH} />
    </>
  );
}
