import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { RichText } from "@/components/page/RichText";
import { Icon } from "@/components/ui/Icon";
import { getPage, getRetailStores, getSettings } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/contact";
export async function generateMetadata() {
  return metaFromPage(await getPage("contact"), PATH);
}

export default async function ContactPage() {
  const [page, settings, stores] = await Promise.all([getPage("contact"), getSettings(), getRetailStores()]);
  const tel = `tel:+1${settings.phone.replace(/\D/g, "")}`;
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title="Contact *Us*" intro={page.intro} crumbs={[{ name: "Contact", path: PATH }]} />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-[22rem_1fr] lg:gap-16 lg:py-20">
        <aside className="space-y-4">
          <Reveal>
            <RichText value={page.body} />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grain relative overflow-hidden rounded-[var(--radius-card)] bg-forest p-7 text-cream">
              <div className="relative z-10 space-y-5">
                <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-turmeric uppercase">Head office</p>
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
                    <Icon name="heart" className="size-4" /> {settings.jobsEmail} <span className="text-xs text-cream/50">careers</span>
                  </a>
                </div>
                <p className="flex items-center gap-3 border-t border-cream/15 pt-5 text-sm text-cream/65">
                  <Icon name="clock" className="size-4" /> Office hours: 9 AM - 5 PM
                </p>
              </div>
            </div>
          </Reveal>
        </aside>
        <Reveal delay={0.05}>
          <div className="relative rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-ink/[0.06] sm:p-10">
            <h2 className="mb-8 font-display text-title text-forest">Leave us a message</h2>
            <ContactForm stores={stores.map((s) => `${s.name} (${s.locality})`)} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
