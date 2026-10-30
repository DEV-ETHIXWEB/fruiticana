import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CampaignRail } from "@/components/home/CampaignRail";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { NewsVideo } from "@/components/home/NewsVideo";
import { VideoGallery } from "@/components/home/VideoGallery";
import { Counter, Reveal, SplitHeading } from "@/components/motion/primitives";
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
      <section className="container-x py-[clamp(3.5rem,10svh,7rem)]">
        <div className="grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-leaf">Mission statement</p>
          </Reveal>
          <div>
            <SplitHeading
              as="h2"
              text={settings.mission.replace("the taste of home", "*the* *taste* *of* *home*")}
              className="font-display text-[clamp(1.55rem,min(1rem+2.2vw,4.7svh),3.25rem)] leading-[1.14] tracking-[-0.02em] text-forest"
              accentClassName="italic text-chili"
            />
            <div className="mt-[clamp(1.75rem,5svh,3rem)] grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink/10 pt-[clamp(1.25rem,4svh,2.25rem)] md:grid-cols-4">
              {[
                { value: <Counter to={settings.founded} format={false} />, label: "Founded in Surrey with a single store" },
                { value: <Counter to={retail.length} />, label: "Locations across BC & Alberta" },
                { value: <Counter to={settings.warehouseSqFt / 1000} suffix="k" />, label: "Sq. ft warehouse in Surrey" },
                { value: <>12-24<span className="text-[0.5em]">h</span></>, label: "From local farm to our shelves" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="font-display text-[clamp(2.1rem,min(1.2rem+2.4vw,7svh),4rem)] leading-none tracking-tight whitespace-nowrap text-leaf">{s.value}</p>
                  <p className="mt-2 max-w-[12rem] text-sm text-muted">{s.label}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-[clamp(1.5rem,4svh,2.5rem)] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden max-w-2xl text-ink-soft sm:block lg:text-lg">{settings.companySummary}</p>
              <ButtonLink href="/our-company" variant="ghost" className="self-start sm:self-auto sm:shrink-0">
                Our company
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Commercials ---------------- */}
      <section className="grain relative overflow-hidden bg-forest py-[clamp(3.5rem,9svh,6rem)] text-cream">
        <div className="container-x relative z-10">
          <Reveal>
            <VideoGallery
              videos={videos}
              nonEmbeddable={[...nonEmbeddableVideos]}
              intro={
                <div>
                  <p className="eyebrow text-turmeric">Featuring Diljit Dosanjh</p>
                  <SplitHeading
                    text="Kehnda ae zamaana, *Fruiticana* *hee* *jaana.*"
                    className="mt-4 font-display text-[clamp(2rem,min(1rem+3vw,6svh),3rem)] leading-[1.02] tracking-[-0.03em]"
                    accentClassName="italic text-turmeric"
                  />
                  {videos[0]?.caption && (
                    <p className="show-when-roomy mt-4 text-[0.92rem] leading-relaxed text-cream/65 italic">“{videos[0].caption.replace(/^@diljitdosanjh says,\s*/i, "")}”</p>
                  )}
                </div>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Story: one-screen horizontal timeline ---------------- */}
      <section className="container-x py-[clamp(3rem,8svh,7rem)] lg:py-[clamp(3.5rem,10svh,7rem)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-leaf">Our story</p>
            <SplitHeading
              text="From one Surrey store to *Western* *Canada’s* favourite."
              className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,min(1rem+3vw,6.5svh),3.75rem)] leading-[1.04] tracking-[-0.03em] text-forest"
            />
          </div>
          <Reveal delay={0.1} className="lg:max-w-sm">
            <p className="text-ink-soft">
              In the early 1990s, families in the Lower Mainland struggled to find okra, guava and sugarcane. In 1994, Fruiticana opened to fill that gap.
            </p>
            <ButtonLink href="/our-company" variant="primary" className="mt-5">
              Read our story
            </ButtonLink>
          </Reveal>
        </div>
        <ol className="scrollbar-none -mx-5 mt-[clamp(2rem,6svh,3.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:px-0">
          {milestones.map((m, i) => (
            <Reveal
              as="li"
              key={i}
              delay={i * 0.07}
              className="relative w-[78%] shrink-0 snap-start rounded-[var(--radius-card)] bg-paper/70 p-6 sm:w-[44%] lg:w-auto lg:rounded-none lg:border-t lg:border-ink/15 lg:bg-transparent lg:p-0 lg:pt-8 lg:pr-8"
            >
              <span className="absolute -top-[5px] left-0 hidden size-2.5 rounded-full bg-chili ring-4 ring-cream lg:block" />
              <p className="font-display text-[clamp(2.25rem,min(1.4rem+1.6vw,6svh),3rem)] leading-none tracking-tight text-leaf italic">{m.year}</p>
              <h3 className="mt-3 font-semibold text-ink">{m.title}</h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{m.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------- Indican + Mangoes ---------------- */}
      <section className="container-x grid gap-4 pb-[clamp(3.5rem,10svh,7rem)] md:grid-cols-2 md:gap-5">
        {[
          { href: "/indican", eyebrow: "Our own brand · since 1997", title: "Indican", body: "Aromatic, all-natural spices, lentils and juices, handpicked by our experts and available exclusively at Fruiticana.", image: photos.spiceAisle, tone: "bg-chili text-white" },
          { href: "/mangoes", eyebrow: "Signature · March to summer", title: "Rajan Mangoes", body: "Harvested on farms built to Fruiticana’s standard for quality and care, and only at Fruiticana.", image: photos.mangoLassi, tone: "bg-mango text-forest-deep" },
        ].map((card, i) => (
          <Reveal key={card.href} delay={i * 0.1}>
            <Link
              href={card.href}
              className="group/btn relative block h-[clamp(18rem,38svh,21rem)] overflow-hidden rounded-[var(--radius-card)] md:h-[clamp(22rem,calc(100svh-12rem),34rem)]"
            >
              <Image src={card.image.src} alt={card.image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover/btn:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-9">
                <span className={`inline-block rounded-full ${card.tone} px-3 py-1 text-[0.75rem] font-semibold tracking-[0.18em] uppercase`}>{card.eyebrow}</span>
                <h2 className="mt-3 font-display text-[clamp(2.25rem,min(1.5rem+2.6vw,8svh),4.25rem)] leading-none tracking-tight">{card.title}</h2>
                <p className="mt-3 max-w-md text-[0.95rem] text-cream/85">{card.body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold sm:mt-5">
                  Discover <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* ---------------- President's message ---------------- */}
      <section className="relative overflow-hidden bg-paper py-[clamp(3.5rem,11svh,7rem)]">
        <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 font-display text-[clamp(9rem,22svh,16rem)] leading-[0.85] text-leaf/[0.08] select-none">“</div>
        <div className="container-x relative max-w-5xl text-center">
          <p className="eyebrow justify-center text-chili-deep">President’s message</p>
          <SplitHeading
            as="blockquote"
            text={settings.presidentQuote}
            className="mt-6 font-display text-[clamp(1.55rem,min(1rem+2.2vw,5.4svh),3rem)] leading-[1.16] tracking-[-0.02em] text-forest"
          />
          <Reveal delay={0.2} className="mt-8 inline-flex items-center gap-4">
            <Image src={photos.president.src} alt={photos.president.alt} width={64} height={64} className="size-14 rounded-full object-cover ring-4 ring-cream" />
            <span className="text-left">
              <span className="block font-display text-xl text-ink">{settings.presidentName}</span>
              <span className="block text-sm text-muted">{settings.presidentTitle}, Fruiticana</span>
            </span>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Community ---------------- */}
      <section className="container-x py-[clamp(3rem,8svh,7rem)] lg:py-[clamp(3.5rem,10svh,7rem)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-leaf">In the community</p>
            <SplitHeading
              text="More than your *neighbourhood* supermarket."
              className="mt-4 font-display text-[clamp(1.75rem,min(1rem+2.4vw,5.5svh),3.25rem)] leading-[1.04] tracking-[-0.03em] text-forest"
            />
          </div>
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <ButtonLink href="/events" variant="ghost" arrow={false}>
              Events
            </ButtonLink>
            <ButtonLink href="/blog" variant="primary">
              All stories
            </ButtonLink>
          </div>
        </div>
        <div className="scrollbar-none -mx-5 mt-[clamp(1.75rem,5svh,3rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {posts.slice(0, 2).map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08} className="w-[82%] shrink-0 snap-start md:w-auto">
              <Link href={`/blog/${post.slug}`} className="group/btn flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
                {post.image && (
                  <div className={`relative aspect-[16/9] overflow-hidden lg:aspect-[2/1] ${post.image.width < 400 ? "bg-white" : "bg-paper"}`}>
                    <Image src={post.image.src} alt={post.image.alt} fill sizes="(min-width: 768px) 30vw, 82vw" className={`transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/btn:scale-105 ${post.image.width < 400 ? "object-contain p-5" : "object-cover"}`} />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5 xl:p-6">
                  <p className="text-xs text-muted">
                    <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time> · {post.category}
                  </p>
                  <h3 className="mt-2 font-display text-[1.2rem] leading-snug text-ink xl:text-[1.35rem]">{post.title}</h3>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-leaf">
                    Read the story <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.16} className="w-[82%] shrink-0 snap-start md:w-auto">
            <NewsVideo clip={newsClip} />
          </Reveal>
        </div>
        <div className="mt-6 flex gap-3 sm:hidden">
          <ButtonLink href="/blog" variant="primary" size="fluid" magnetic={false}>
            All stories
          </ButtonLink>
          <ButtonLink href="/events" variant="ghost" size="fluid" arrow={false} magnetic={false}>
            Events
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
