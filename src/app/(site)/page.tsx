import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CampaignRail } from "@/components/home/CampaignRail";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { NewsVideo } from "@/components/home/NewsVideo";
import { VideoGallery } from "@/components/home/VideoGallery";
import { Counter, Reveal, SplitHeading, ZoomSettle } from "@/components/motion/primitives";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import {
  getCampaigns,
  getFlyers,
  getPosts,
  getRetailStores,
  getSettings,
  getStores,
  getVideos,
  milestones,
  newsClip,
  nonEmbeddableVideos,
  photos,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "New Fruiticana Grocery Stores in BC and Alberta",
  description:
    "Fresh fruits, vegetables and spices at the best price. 25 Fruiticana grocery stores across BC and Alberta since 1994. See this week’s specials.",
  path: "/",
  absoluteTitle: true,
});

const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function HomePage() {
  const [settings, campaigns, flyers, stores, retail, videos, posts] = await Promise.all([
    getSettings(),
    getCampaigns(),
    getFlyers(),
    getStores(),
    getRetailStores(),
    getVideos(),
    getPosts(),
  ]);

  return (
    <>
      <Hero storeCount={retail.length} produceFloor={photos.produceFloor} firstStore={photos.firstStore} spiceAisle={photos.spiceAisle} />

      <CampaignRail items={campaigns} />

      <QuickActions flyers={flyers} stores={stores} />

      {/* ---------------- Mission + company ---------------- */}
      <section className="container-x py-24 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-leaf">Mission statement</p>
          </Reveal>
          <div>
            <SplitHeading
              as="h2"
              text={settings.mission.replace("the taste of home", "*the* *taste* *of* *home*")}
              className="font-display text-[clamp(1.85rem,1rem+2.6vw,3.6rem)] leading-[1.12] tracking-[-0.02em] text-forest"
              accentClassName="italic text-chili"
            />
            <div className="mt-16 grid grid-cols-2 gap-y-10 border-t border-ink/10 pt-10 md:grid-cols-4">
              {[
                { value: <Counter to={settings.founded} format={false} />, label: "Founded in Surrey with a single store" },
                { value: <Counter to={retail.length} />, label: "Locations across BC & Alberta" },
                { value: <Counter to={settings.warehouseSqFt / 1000} suffix="k" />, label: "Sq. ft warehouse in Surrey" },
                { value: <>12-24<span className="text-[0.5em]">h</span></>, label: "Local farm to our shelves" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.08} className="pr-6">
                  <p className="font-display text-[clamp(2.4rem,1.2rem+2.4vw,4.25rem)] leading-none tracking-tight whitespace-nowrap text-leaf">{s.value}</p>
                  <p className="mt-3 max-w-[12rem] text-sm text-muted">{s.label}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-lg text-ink-soft">{settings.companySummary}</p>
              <ButtonLink href="/our-company" variant="ghost" className="shrink-0">
                Our company
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Commercials ---------------- */}
      <section className="grain relative overflow-hidden bg-forest py-24 text-cream lg:py-32">
        <div className="container-x relative z-10">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow text-turmeric">Featuring Diljit Dosanjh</p>
              <SplitHeading
                text="Kehnda ae zamaana, *Fruiticana* *hee* *jaana.*"
                className="mt-5 max-w-4xl font-display text-headline tracking-[-0.03em]"
                accentClassName="italic text-turmeric"
              />
            </div>
            {videos[0]?.caption && <p className="max-w-sm text-cream/60 italic lg:text-right">“{videos[0].caption.replace(/^@diljitdosanjh says,\s*/i, "")}”</p>}
          </div>
          <Reveal>
            <VideoGallery videos={videos} nonEmbeddable={[...nonEmbeddableVideos]} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Story ---------------- */}
      <section className="container-x py-24 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-leaf">Our story</p>
            <SplitHeading text="From one Surrey store to *Western* *Canada’s* favourite." className="mt-5 font-display text-headline tracking-[-0.03em] text-forest" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-lg text-ink-soft">
                In the early 1990s, families in the Lower Mainland struggled to find okra, guava and sugarcane. In 1994, Fruiticana opened to fill that gap.
              </p>
              <ButtonLink href="/our-company" variant="primary" className="mt-8">
                Read our story
              </ButtonLink>
            </Reveal>
          </div>
          <ol className="relative border-l border-ink/10 pl-8 sm:pl-12">
            {milestones.map((m, i) => (
              <Reveal as="li" key={i} className="relative pb-14 last:pb-0">
                <span className="absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full bg-chili ring-4 ring-cream sm:-left-[calc(3rem+5px)]" />
                <p className="font-display text-5xl tracking-tight text-leaf italic">{m.year}</p>
                <h3 className="mt-3 text-xl font-semibold text-ink">{m.title}</h3>
                <p className="mt-2 max-w-lg text-ink-soft">{m.body}</p>
                {m.image && (
                  <ZoomSettle className="mt-6 aspect-[16/9] rounded-2xl">
                    <Image src={m.image.src} alt={m.image.alt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
                  </ZoomSettle>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Indican + Mangoes ---------------- */}
      <section className="container-x grid gap-5 pb-24 md:grid-cols-2 lg:pb-36">
        {[
          { href: "/indican", eyebrow: "Our own brand · since 1997", title: "Indican", body: "Aromatic, all-natural spices, lentils and juices, handpicked by our experts and available exclusively at Fruiticana.", image: photos.spiceAisle, tone: "bg-chili" },
          { href: "/mangoes", eyebrow: "Signature · March to summer", title: "Rajan Mangoes", body: "Harvested on farms built to Fruiticana’s standard for quality and care, and only at Fruiticana.", image: photos.mangoLassi, tone: "bg-mango" },
        ].map((card, i) => (
          <Reveal key={card.href} delay={i * 0.1}>
            <Link href={card.href} className="group/btn relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] sm:aspect-[5/5.4]">
              <Image src={card.image.src} alt={card.image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover/btn:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-cream sm:p-10">
                <span className={`inline-block rounded-full ${card.tone} px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-white uppercase`}>{card.eyebrow}</span>
                <h2 className="mt-4 font-display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] leading-none tracking-tight">{card.title}</h2>
                <p className="mt-3 max-w-md text-cream/80">{card.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  Discover <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* ---------------- President's message ---------------- */}
      <section className="relative overflow-hidden bg-paper py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 font-display text-[16rem] leading-[0.85] text-leaf/[0.08] select-none">“</div>
        <div className="container-x relative max-w-5xl text-center">
          <p className="eyebrow justify-center text-chili">President’s message</p>
          <SplitHeading
            as="blockquote"
            text={settings.presidentQuote}
            className="mt-8 font-display text-[clamp(1.7rem,1rem+2.4vw,3.25rem)] leading-[1.15] tracking-[-0.02em] text-forest"
          />
          <Reveal delay={0.2} className="mt-10 inline-flex items-center gap-4">
            <Image src={photos.president.src} alt={photos.president.alt} width={64} height={64} className="size-16 rounded-full object-cover ring-4 ring-cream" />
            <span className="text-left">
              <span className="block font-display text-xl text-ink">{settings.presidentName}</span>
              <span className="block text-sm text-muted">{settings.presidentTitle}, Fruiticana</span>
            </span>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Community ---------------- */}
      <section className="container-x py-24 lg:py-32">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-leaf">In the community</p>
            <SplitHeading text="More than your *neighbourhood* supermarket." className="mt-5 max-w-3xl font-display text-headline tracking-[-0.03em] text-forest" />
          </div>
          <ButtonLink href="/blog" variant="ghost" className="shrink-0">
            All stories
          </ButtonLink>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {posts.slice(0, 2).map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="group/btn flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
                {post.image && (
                  <div className={`relative aspect-[16/10] overflow-hidden ${post.image.width < 400 ? "bg-white" : "bg-paper"}`}>
                    <Image src={post.image.src} alt={post.image.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className={`transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/btn:scale-105 ${post.image.width < 400 ? "object-contain p-6" : "object-cover"}`} />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs text-muted">
                    <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time> · {post.category}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-ink">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-[0.95rem] text-ink-soft">{post.excerpt}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leaf">
                    Read more <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.16}>
            <div className="flex h-full flex-col gap-5">
              <NewsVideo clip={newsClip} />
              <Link href="/events" className="group/btn flex items-center justify-between rounded-[var(--radius-card)] bg-turmeric p-7 text-forest">
                <span>
                  <span className="block text-[0.7rem] font-semibold tracking-[0.18em] uppercase opacity-70">Calendar</span>
                  <span className="mt-1 block font-display text-2xl">See all events</span>
                </span>
                <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
