import type { Metadata } from "next";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { getEvents } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/events";
export const metadata: Metadata = pageMetadata({
  title: "Events",
  description: "Calendar of Fruiticana community events, in-store celebrations and contests across BC and Alberta.",
  path: PATH,
});

const day = new Intl.DateTimeFormat("en-CA", { day: "2-digit", timeZone: "America/Vancouver" });
const mon = new Intl.DateTimeFormat("en-CA", { month: "short", timeZone: "America/Vancouver" });
const full = new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" });

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <>
      <PageHero eyebrow="In The Community" title="Calendar of *Events*" intro="Festivals, in-store celebrations and community gatherings: here’s what’s coming up at Fruiticana." crumbs={[{ name: "In The Community", path: "/blog" }, { name: "Events", path: PATH }]} />
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
            <div className="grid gap-10 overflow-hidden rounded-[var(--radius-card)] bg-turmeric p-8 text-forest sm:p-14 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <span className="grid size-14 place-items-center rounded-full bg-forest/10">
                  <Icon name="calendar" className="size-7" />
                </span>
                <h2 className="mt-6 font-display text-[clamp(2rem,1.3rem+2vw,3.25rem)] leading-tight">There are no events right now.</h2>
                <p className="mt-4 max-w-md text-forest/75">New dates are announced in our newsletter first. Sign up and we’ll let you know about the next celebration at your store.</p>
                <ButtonLink href="/blog" variant="primary" className="mt-8">
                  Community stories
                </ButtonLink>
              </div>
              <div className="rounded-2xl bg-forest p-6 sm:p-8">
                <p className="mb-4 font-display text-xl text-cream">Get event news</p>
                <NewsletterForm tone="dark" />
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}
