import type { Metadata } from "next";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ButtonLink } from "@/components/ui/Button";
import { Icon3D } from "@/components/ui/Icon3D";
import { JsonLd } from "@/components/ui/JsonLd";
import { getEvents } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

const PATH = "/events";
export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getT(), getLocale()]);
  return pageMetadata({ title: t.pages.eventsMetaTitle, description: t.pages.eventsMetaDescription, path: PATH, lang });
}


export default async function EventsPage() {
  const [events, t, lang] = await Promise.all([getEvents(), getT(), getLocale()]);
  const loc = lang === "pa" ? "pa-IN" : "en-CA";
  const day = new Intl.DateTimeFormat(loc, { day: "2-digit", timeZone: "America/Vancouver" });
  const mon = new Intl.DateTimeFormat(loc, { month: "short", timeZone: "America/Vancouver" });
  const full = new Intl.DateTimeFormat(loc, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" });
  return (
    <>
      <PageHero eyebrow={t.nav.community} title={t.pages.eventsTitle} intro={t.pages.eventsIntro} crumbs={[{ name: t.nav.community, path: "/blog" }, { name: t.nav.events, path: PATH }]} />
      <section className="container-x py-16 lg:py-24">
        {events.length ? (
          <>
            <JsonLd
              data={events.map((e) => ({
                "@context": "https://schema.org",
                "@type": "Event",
                name: e.title,
                startDate: e.start,
                endDate: e.end,
                description: e.description,
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                location: { "@type": "Place", name: e.location ?? "Fruiticana", address: e.location ?? "BC, Canada" },
                organizer: { "@type": "Organization", name: "Fruiticana", url: "https://www.fruiticana.com" },
              }))}
            />
            <ol className="divide-y divide-ink/10 border-y border-ink/10">
              {events.map((e, i) => (
                <Reveal as="li" key={e.id} delay={i * 0.05} className="grid gap-4 py-8 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
                  <p className="font-display leading-none text-leaf">
                    <span className="block text-5xl">{day.format(new Date(e.start))}</span>
                    <span className="text-sm tracking-[0.2em] uppercase">{mon.format(new Date(e.start))}</span>
                  </p>
                  <div>
                    <h2 className="font-display text-2xl text-ink">{e.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {full.format(new Date(e.start))}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                    {e.description && <p className="mt-3 max-w-2xl text-ink-soft">{e.description}</p>}
                  </div>
                </Reveal>
              ))}
            </ol>
          </>
        ) : (
          <Reveal>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-10 overflow-hidden rounded-[var(--radius-card)] bg-turmeric p-6 text-forest max-sm:p-5 sm:p-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center max-sm:gap-7">
              <div>
                <Icon3D name="calendar" className="size-20 -ml-1" />
                <h2 className="mt-6 font-display text-[clamp(2rem,1.3rem+2vw,3.25rem)] leading-tight">{t.pages.noEvents}</h2>
                <p className="mt-4 max-w-md text-forest/75">{t.pages.noEventsBody}</p>
                <ButtonLink href="/blog" variant="primary" className="mt-8">
                  {t.nav.stories}
                </ButtonLink>
              </div>
              <div className="rounded-2xl bg-forest p-6 sm:p-8">
                <p className="mb-4 font-display text-xl text-cream">{t.pages.getEventNews}</p>
                <NewsletterForm tone="dark" stacked />
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}
