import Link from "@/i18n/Link";
import { PageHero } from "@/components/page/PageHero";
import { getPosts, getRetailStores } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { localizedNav } from "@/lib/site";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return pageMetadata({ title: t.siteMap.metaTitle, description: t.siteMap.metaDescription, path: "/site-map", lang: await getLocale() });
}

export default async function SiteMapPage() {
  const [stores, posts, t] = await Promise.all([getRetailStores(), getPosts(), getT()]);
  const groups = [
    ...localizedNav(t).map((n) => ({ title: n.label, links: n.children ? n.children.map((c) => ({ href: c.href, label: c.label })) : [{ href: n.href, label: n.label }] })),
    { title: t.siteMap.communityStories, links: posts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })) },
  ];
  return (
    <>
      <PageHero eyebrow={t.siteMap.eyebrow} title={t.siteMap.title} crumbs={[{ name: t.siteMap.metaTitle, path: "/site-map" }]} />
      <section className="container-x grid gap-12 py-12 sm:py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-24">
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
          <h2 className="border-b border-ink/10 pb-3 text-[0.75rem] font-semibold tracking-[0.2em] text-muted uppercase">{t.siteMap.storeLocations}</h2>
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
