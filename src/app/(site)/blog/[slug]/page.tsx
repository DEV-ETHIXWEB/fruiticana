import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { Breadcrumbs } from "@/components/page/Breadcrumbs";
import { PostCard, dateFmt } from "@/components/page/PostCard";
import { RichText } from "@/components/page/RichText";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { getPost, getPosts } from "@/lib/content";
import { articleLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const meta = pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.image?.src });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date } };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const others = (await getPosts()).filter((p) => p.slug !== slug).slice(0, 2);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <article>
      <JsonLd data={articleLd(post)} />
      <header className="container-x max-w-5xl pt-32 lg:pt-40">
        <Breadcrumbs items={[{ name: "In The Community", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />
        <p className="mt-10 text-sm text-muted">
          <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time> · <span className="text-leaf">{post.category}</span>
        </p>
        <SplitHeading as="h1" immediate text={post.title} className="mt-4 font-display text-[clamp(2.25rem,1.3rem+3vw,4.25rem)] leading-[1.02] tracking-[-0.03em] text-forest" />
      </header>
      {post.image && (
        <Reveal className="container-x mt-12 max-w-5xl">
          <div className={`relative overflow-hidden rounded-[var(--radius-card)] ${post.image.width < 400 ? "aspect-[16/7] bg-white ring-1 ring-ink/[0.06]" : "bg-paper"}`}>
            {post.image.width < 400 ? (
              <Image src={post.image.src} alt={post.image.alt} fill preload sizes="64rem" className="object-contain p-10" />
            ) : (
              <Image src={post.image.src} alt={post.image.alt} width={post.image.width} height={post.image.height} preload sizes="(min-width: 1024px) 64rem, 100vw" className="h-auto w-full" />
            )}
          </div>
        </Reveal>
      )}
      <div className="container-x grid max-w-5xl gap-12 py-16 lg:grid-cols-[1fr_12rem] lg:py-24">
        <Reveal>
          <RichText value={post.body} className="dropcap" />
        </Reveal>
        <aside className="flex gap-3 lg:flex-col lg:pt-2">
          <p className="hidden text-[0.7rem] font-semibold tracking-[0.18em] text-muted uppercase lg:block">Share</p>
          <a
            className="grid size-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-forest hover:text-cream"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
          >
            <Icon name="x" className="size-4" />
          </a>
          <a
            className="grid size-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-forest hover:text-cream"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <Icon name="facebook" className="size-4" />
          </a>
        </aside>
      </div>
      {others.length > 0 && (
        <section className="container-x max-w-5xl pb-24">
          <div className="flex items-baseline justify-between border-t border-ink/10 pt-10">
            <h2 className="font-display text-title text-forest">More from the community</h2>
            <Link href="/blog" className="text-sm font-semibold text-leaf">All stories</Link>
          </div>
          <div className={`mt-8 grid gap-5 ${others.length > 1 ? "md:grid-cols-2" : ""}`}>
            {others.map((p) => (
              <PostCard key={p.slug} post={p} large={others.length === 1} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
