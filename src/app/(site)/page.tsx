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
import { Icon3D } from "@/components/ui/Icon3D";
import { isSmallImage, ProductShot } from "@/components/ui/ProductShot";
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

/**
 * Marks phrases for SplitHeading's accent style (*word*), keeping trailing punctuation
 * inside the accent: "the very best." -> "the *very* *best.*". The CMS text stays plain.
 */
function accentPhrases(text: string, phrases: string[]) {
  return phrases.reduce(
    (t, phrase) => t.replace(new RegExp(`\\b${phrase}([.,;!?]?)`, "i"), (m, punct: string) => m.slice(0, m.length - punct.length).split(" ").map((w, i, all) => `*${w}${i === all.length - 1 ? punct : ""}*`).join(" ")),
    text,
  );
}

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
      <Hero storeCount={retail.length} />

      <CampaignRail items={campaigns} />

      <QuickActions flyers={flyers} stores={stores} />

      {/* ---------------- Mission + company ---------------- */}
      <section className="container-x py-[clamp(3rem,9svh,7rem)]">
        {/* lg+: the label heads a tall store photo that stretches to the text column's height
            (absolutely filled, so it never adds height); below lg the columns stack without it. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-12 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:gap-20">
          <div className="flex flex-col gap-6">
            <Reveal>
              <p className="eyebrow text-leaf">Mission statement</p>
            </Reveal>
            <Reveal y={40} className="relative hidden min-h-64 flex-1 lg:block">
              <ZoomSettle className="absolute inset-0 rounded-[var(--radius-card)]">
                <Image src={photos.produceFloor.src} alt={photos.produceFloor.alt} fill sizes="(min-width: 1024px) 34vw, 1px" className="object-cover" />
              </ZoomSettle>
            </Reveal>
          </div>
          <div>
            <SplitHeading
              as="h2"
              text={settings.mission.replace("the taste of home", "*the* *taste* *of* *home*")}
              className="font-display text-[clamp(1.55rem,min(0.9rem+1.9vw,4.5svh),2.75rem)] leading-[1.14] tracking-[-0.02em] text-forest"
              accentClassName="italic text-chili"
            />
            {/* Three facts and one way on: kept deliberately sparse */}
            <div className="mt-[clamp(1.75rem,5svh,3rem)] grid grid-cols-3 items-start gap-x-3 gap-y-6 border-t border-ink/10 pt-[clamp(1.25rem,4svh,2.25rem)] sm:flex sm:flex-wrap sm:items-end sm:gap-x-14">
              {[
                { value: <Counter to={settings.founded} format={false} />, label: "Founded in Surrey" },
                { value: <Counter to={retail.length} />, label: "Stores in BC & Alberta" },
                { value: <Counter to={settings.warehouseSqFt / 1000} suffix="k" />, label: "Sq. ft warehouse" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="font-display text-[clamp(2.1rem,min(1.2rem+2.4vw,7svh),3.75rem)] leading-none tracking-tight whitespace-nowrap text-leaf">{s.value}</p>
                  <p className="mt-2 text-[0.8rem] leading-snug text-muted sm:text-sm">{s.label}</p>
                </Reveal>
              ))}
              <Reveal delay={0.24} className="col-span-3 sm:ml-auto">
                <ButtonLink href="/our-company" variant="ghost">
                  Our company
                </ButtonLink>
              </Reveal>
            </div>
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

      {/* ---------------- President's message ----------------
          A dark editorial band: the founder's words, then the three things that keep the promise. */}
      <section className="grain relative isolate overflow-hidden bg-forest-deep py-12 text-cream sm:py-[clamp(3.5rem,11svh,7rem)]">
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(246_210_28/0.16),transparent_65%)] blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-48 -z-10 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(226_35_26/0.14),transparent_65%)] blur-2xl" />
        <div className="container-x grid items-center gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16 xl:gap-24">
          <figure className="relative">
            <p className="eyebrow text-turmeric">President’s message</p>
            <Reveal y={24} delay={0.05}>
              <span aria-hidden className="mt-3 block h-[0.5em] font-display text-[clamp(4rem,12svh,7.5rem)] leading-[0.95] text-turmeric sm:mt-4">“</span>
            </Reveal>
            <SplitHeading
              as="blockquote"
              text={accentPhrases(settings.presidentQuote, ["very best", "best price"])}
              className="mt-3 font-display text-[clamp(1.3rem,min(0.9rem+1.75vw,4.8svh),2.6rem)] leading-[1.2] tracking-[-0.015em] text-cream"
              accentClassName="italic text-turmeric"
            />
            <Reveal delay={0.2}>
              <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-cream/15 pt-5 sm:mt-8 sm:pt-6">
                <span className="flex items-center gap-4">
                  <Image src={photos.president.src} alt={photos.president.alt} width={64} height={64} className="size-14 rounded-full object-cover ring-2 ring-turmeric ring-offset-4 ring-offset-forest-deep" />
                  <span>
                    <span className="block font-display text-xl text-cream">{settings.presidentName}</span>
                    <span className="block text-sm text-cream/65">{settings.presidentTitle}, Fruiticana</span>
                  </span>
                </span>
                <Link href="/our-company" className="group/btn ml-auto inline-flex items-center gap-2 text-sm font-semibold text-turmeric">
                  Read our story <Arrow />
                </Link>
              </figcaption>
            </Reveal>
          </figure>

          <div>
            <p className="text-[0.75rem] font-semibold tracking-[0.18em] text-cream/60 uppercase">How we keep that promise</p>
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:block sm:space-y-3">
              {[
                { icon: "leaf" as const, title: "Fresh, every day", body: "Local farm produce on our shelves within 12-24 hours.", href: "/farm-to-table" },
                { icon: "truck" as const, title: "Direct from the source", body: "We deal directly with growers and packers, and run our own facilities in India.", href: "/commitment-to-quality" },
                { icon: "badge" as const, title: "Indican, since 1997", body: "Our own brand of premium spices, lentils and juices.", href: "/indican" },
              ].map((item, i) => (
                <Reveal as="li" key={item.href} delay={0.1 + i * 0.08}>
                  <Link href={item.href} className="group/btn flex h-full flex-col items-center gap-2 rounded-2xl bg-cream/[0.05] p-3 text-center ring-1 ring-cream/10 transition-colors hover:bg-cream/[0.09] hover:ring-turmeric/40 sm:flex-row sm:gap-4 sm:p-4 sm:text-left">
                    <Icon3D name={item.icon} className="size-10 transition-transform sm:size-12 duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-rotate-6 group-hover/btn:scale-110" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8rem] leading-tight font-semibold text-cream sm:text-base">{item.title}</span>
                      <span className="mt-0.5 hidden text-sm leading-snug text-cream/70 sm:block">{item.body}</span>
                    </span>
                    <Arrow className="hidden shrink-0 text-turmeric sm:inline-flex" />
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
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
        <div className="scrollbar-none -mx-5 mt-[calc(clamp(1.75rem,5svh,3rem)-0.25rem)] -mb-1 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 py-1 md:mx-0 md:mt-[clamp(1.75rem,5svh,3rem)] md:mb-0 md:py-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {posts.slice(0, 2).map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08} className="w-[82%] shrink-0 snap-start md:w-auto">
              <Link href={`/blog/${post.slug}`} className="group/btn flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
                {post.image && (
                  <div className={`relative aspect-[16/9] overflow-hidden lg:aspect-[2/1] ${post.image.width < 400 ? "bg-white" : "bg-paper"}`}>
                    {isSmallImage(post.image) ? (
                      <ProductShot image={post.image} />
                    ) : (
                      <Image src={post.image.src} alt={post.image.alt} fill sizes="(min-width: 768px) 30vw, 82vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/btn:scale-105" />
                    )}
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
