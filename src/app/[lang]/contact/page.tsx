import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RichText } from "@/components/page/RichText";
import { StoreMap } from "@/components/stores/StoreMap";
import { Icon } from "@/components/ui/Icon";
import { getPage, getRetailStores, getSettings, getStores } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";
import { formatHours } from "@/lib/hours";
import { getLocale, getT } from "@/i18n/server";

const PATH = "/contact";
export async function generateMetadata() {
  return metaFromPage(await getPage("contact"), PATH, await getLocale());
}

export default async function ContactPage() {
  const [page, settings, stores, all, t, lang] = await Promise.all([getPage("contact"), getSettings(), getRetailStores(), getStores(), getT(), getLocale()]);
  const office = all.find((s) => s.isHeadOffice);
  const tel = `tel:+1${settings.phone.replace(/\D/g, "")}`;
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={t.contact.title} intro={page.intro} crumbs={[{ name: t.common.contact, path: PATH }]} />
      <section className="container-x grid gap-10 pt-10 pb-16 lg:grid-cols-[22rem_1fr] lg:gap-16 lg:pt-12 lg:pb-12">
        {/* First-screen content uses the CSS entrance (no JavaScript), so it paints immediately. */}
        <aside className="space-y-4">
          <div className="enter-rise" style={{ animationDelay: "0.25s" }}>
            <RichText value={page.body} />
          </div>
          <div className="enter-rise" style={{ animationDelay: "0.35s" }}>
            <div className="grain relative overflow-hidden rounded-[var(--radius-card)] bg-forest p-7 text-cream">
              <div className="relative z-10 space-y-5">
                <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-turmeric uppercase">{t.common.headOffice}</p>
                <address className="text-lg not-italic">
                  {settings.headOffice.street},
                  <br />
                  {settings.headOffice.locality}, {settings.headOffice.province} {settings.headOffice.postalCode}
                </address>
                <div className="space-y-2.5 border-t border-cream/15 pt-5">
                  <a href={tel} className="flex items-center gap-3 hover:text-turmeric">
                    <Icon name="phone" className="size-4" /> {settings.phone}
                  </a>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-turmeric">
                    <Icon name="mail" className="size-4" /> {settings.email}
                  </a>
                  <a href={`mailto:${settings.jobsEmail}`} className="flex items-center gap-3 hover:text-turmeric">
                    <Icon name="heart" className="size-4" /> {settings.jobsEmail} <span className="text-xs text-cream/50">{t.contact.careersTag}</span>
                  </a>
                </div>
                <p className="flex items-center gap-3 border-t border-cream/15 pt-5 text-sm text-cream/65">
                  <Icon name="clock" className="size-4" /> {t.contact.officeHours(office ? formatHours(office, lang) : formatHours({ opens: "09:00", closes: "17:00" }, lang))}
                </p>
              </div>
            </div>
          </div>
          {office && (
            <Reveal delay={0.12}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-ink/10">
                <StoreMap lat={office.lat} lng={office.lng} label={t.contact.mapLabel} />
              </div>
            </Reveal>
          )}
        </aside>
        <div className="enter-rise" style={{ animationDelay: "0.3s" }}>
          <div className="relative rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-ink/[0.06] sm:p-8">
            <h2 className="mb-6 font-display text-title text-forest">{t.contact.leaveMessage}</h2>
            <ContactForm stores={stores.map((s) => `${s.name} (${s.locality})`)} />
          </div>
        </div>
      </section>
    </>
  );
}
