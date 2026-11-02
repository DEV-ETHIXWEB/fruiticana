import Link from "@/i18n/Link";
import { Reveal } from "@/components/motion/primitives";
import { Arrow } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionaries";
import { getT } from "@/i18n/server";

export type Related = { href: string; title: string; body: string };

/** The company pages, labelled from the dictionary (same wording as the navigation). */
const companyLinks = (t: Dictionary): Related[] => [
  { href: "/our-company", title: t.nav.ourStory, body: t.navBlurb.ourStory },
  { href: "/commitment-to-quality", title: t.nav.commitment, body: t.navBlurb.commitment },
  { href: "/farm-to-table", title: t.nav.farmToTable, body: t.navBlurb.farmToTable },
  { href: "/employment", title: t.nav.employment, body: t.navBlurb.employment },
  { href: "/indican", title: t.nav.indican, body: t.pages.relatedIndicanBody },
  { href: "/mangoes", title: t.common.rajanMangoes, body: t.pages.relatedMangoesBody },
];

/** "Keep exploring": the first `n` company pages other than the current one. */
export async function RelatedLinks({ exclude, n = 3 }: { exclude: string; n?: number }) {
  const t = await getT();
  const items = companyLinks(t)
    .filter((l) => l.href !== exclude)
    .slice(0, n);
  return (
    <section className="container-x pb-20 lg:pb-28">
      <h2 className="border-t border-ink/10 pt-14 font-display text-title text-forest">{t.pages.keepExploring}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.href} delay={i * 0.07}>
            <Link href={it.href} className="group/btn flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-ink/[0.06] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
              <span className="font-display text-2xl text-ink">{it.title}</span>
              <span className="mt-2 text-[0.95rem] text-ink-soft">{it.body}</span>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leaf">
                {t.pages.readMore} <Arrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
