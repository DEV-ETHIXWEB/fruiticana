import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/PageHero";
import { getPosts, getRetailStores } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { nav } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ title: "Site Map", description: "Every page on fruiticana.com: company, Indican, community, weekly specials, all 25 store locations and contact.", path: "/site-map" });

export default async function SiteMapPage() {
  const [stores, posts] = await Promise.all([getRetailStores(), getPosts()]);
  const groups = [
    ...nav.map((n) => ({ title: n.label, links: "children" in n ? n.children.map((c) => ({ href: c.href, label: c.label })) : [{ href: n.href, label: n.label }] })),
    { title: "Community stories", links: posts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })) },
  ];
  return (
    <>
      <PageHero eyebrow="Site Map" title="Everything, *in* *one* *place.*" crumbs={[{ name: "Site Map", path: "/site-map" }]} />
      <section className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-24">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="border-b border-ink/10 pb-3 text-[0.75rem] font-semibold tracking-[0.2em] text-muted uppercase">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink hover:text-leaf">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="border-b border-ink/10 pb-3 text-[0.75rem] font-semibold tracking-[0.2em] text-muted uppercase">Store locations</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((s) => (
              <li key={s.slug}>
                <Link href={`/storefinder/${s.slug}`} className="text-ink hover:text-leaf">
                  {s.name} <span className="text-muted">· {s.locality}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
