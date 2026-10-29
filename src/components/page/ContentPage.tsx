import { Reveal } from "@/components/motion/primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Page } from "@/lib/content/types";
import { PageHero } from "./PageHero";
import { RelatedLinks, relatedExcept } from "./RelatedLinks";
import { RichText } from "./RichText";

export type Fact = { icon: IconName; title: string; body: string };

/** Standard long-form page: hero → copy with a fact rail → related links. */
export function ContentPage({
  page,
  path,
  parent,
  facts = [],
  aside,
  after,
}: {
  page: Page;
  path: string;
  parent?: { name: string; path: string };
  facts?: Fact[];
  aside?: React.ReactNode;
  after?: React.ReactNode;
}) {
  const crumbs = [...(parent ? [parent] : []), { name: page.title, path }];
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} image={page.heroImage} crumbs={crumbs} />
      <section className="container-x grid gap-14 pt-16 pb-20 lg:grid-cols-[1fr_22rem] lg:gap-24 lg:pt-24 lg:pb-24">
        <Reveal>
          <RichText value={page.body} className="dropcap max-w-[44rem]" />
        </Reveal>
        <aside className="space-y-4 lg:pt-2">
          {facts.map((f, i) => (
            <Reveal key={f.title} delay={0.1 + i * 0.07}>
              <div className="flex gap-4 rounded-2xl bg-paper/70 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-leaf text-white">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{f.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
          {aside}
        </aside>
      </section>
      {after}
      <RelatedLinks items={relatedExcept(path)} />
    </>
  );
}
