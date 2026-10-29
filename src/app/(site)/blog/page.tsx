import { Reveal } from "@/components/motion/primitives";
import { PageHero } from "@/components/page/PageHero";
import { PostCard } from "@/components/page/PostCard";
import { RichText } from "@/components/page/RichText";
import { getPage, getPosts } from "@/lib/content";
import { metaFromPage } from "@/lib/seo";

const PATH = "/blog";
export async function generateMetadata() {
  return metaFromPage(await getPage("blog"), PATH);
}

export default async function CommunityPage() {
  const [page, posts] = await Promise.all([getPage("blog"), getPosts()]);
  const [first, ...rest] = posts;
  const years = [...new Set(posts.map((p) => p.date.slice(0, 4)))];
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title="In The *Community*" intro={page.intro} image={page.heroImage} crumbs={[{ name: "In The Community", path: PATH }]} />
      <section className="container-x py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
          <Reveal>
            <RichText value={page.body} className="max-w-3xl text-xl" />
          </Reveal>
          <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1">
            <div>
              <dt className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted uppercase">Categories</dt>
              <dd className="mt-2 text-ink">{[...new Set(posts.map((p) => p.category))].join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted uppercase">Archives</dt>
              <dd className="mt-2 text-ink">{years.join(" · ")}</dd>
            </div>
          </dl>
        </div>
        {/* Feature the newest story only when there are enough to fill a grid beneath it */}
        <div className="mt-14 grid gap-5">
          {posts.length >= 4 && first && (
            <Reveal>
              <PostCard post={first} large />
            </Reveal>
          )}
          <div className={`grid gap-5 md:grid-cols-2 ${posts.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {(posts.length >= 4 ? rest : posts).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06} className="h-full">
                <PostCard post={p} eager={i === 0 && posts.length < 4} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
