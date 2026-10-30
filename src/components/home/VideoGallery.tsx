"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Video } from "@/lib/content/types";

type Mode = "ambient" | "sound";

/** YouTube hq/sd thumbnails are 4:3 with black bars baked in; zoom them to 16:9. */
const letterbox = (p: Video["poster"]) => (p.width / p.height < 1.5 ? "scale-[1.34]" : "");

/** YouTube only loops a single video when it is also passed as its own playlist. */
const embedUrl = (id: string, mode: Mode) => {
  const q = new URLSearchParams({
    autoplay: "1",
    loop: "1",
    playlist: id,
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    mute: mode === "ambient" ? "1" : "0",
    controls: mode === "ambient" ? "0" : "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${q}`;
};

/**
 * Commercials play on a muted loop as soon as the player scrolls into view
 * (ambient mode), and keep looping with sound once a shopper presses play.
 * Nothing from YouTube loads until the player is on screen. Videos whose
 * owners block embedding open on YouTube instead of showing a broken frame.
 */
export function VideoGallery({ videos, nonEmbeddable, intro }: { videos: Video[]; nonEmbeddable: string[]; intro?: ReactNode }) {
  const firstEmbeddable = Math.max(0, videos.findIndex((v) => !nonEmbeddable.includes(v.youtubeId)));
  const [active, setActive] = useState(firstEmbeddable);
  const [mode, setMode] = useState<Mode>("ambient");
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, { margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();

  const v = videos[active];
  if (!v) return null;
  const external = nonEmbeddable.includes(v.youtubeId);
  const watchUrl = `https://www.youtube.com/watch?v=${v.youtubeId}`;
  // Ambient loop only while visible (and never for reduced-motion users); sound mode stays on once chosen.
  const showFrame = !external && (mode === "sound" || (inView && !reduce));

  return (
    // Phones: intro, player, title, swipe list. lg+: player left (width capped by viewport
    // height so the whole section fits one screen), intro + list in a sidebar.
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6">
      {intro && <div className="lg:col-start-2 lg:row-start-1">{intro}</div>}
      <div
        ref={frame}
        className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] bg-forest-deep ring-1 ring-cream/10 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-w-[calc((100svh-10rem)*16/9)] lg:self-center"
      >
        {/* Poster always underneath: instant paint, and the fallback while the iframe boots */}
        <AnimatePresence mode="wait">
          <motion.div key={`p-${v.youtubeId}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <Image src={v.poster.src} alt={v.poster.alt} fill sizes="(min-width: 1024px) 62vw, 100vw" className={`object-cover ${letterbox(v.poster)}`} />
          </motion.div>
        </AnimatePresence>

        {showFrame && (
          <iframe
            key={`${v.youtubeId}-${mode}`}
            className={`absolute inset-0 size-full ${mode === "ambient" ? "pointer-events-none scale-[1.02]" : ""}`}
            src={embedUrl(v.youtubeId, mode)}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            tabIndex={mode === "ambient" ? -1 : 0}
            aria-hidden={mode === "ambient"}
          />
        )}

        {mode === "ambient" && (
          <div className="absolute inset-0">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/10 to-transparent" />
            {external ? (
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="group absolute inset-0 grid place-items-center">
                <PlayDisc icon="external" />
                <span className="sr-only">Watch {v.title} on YouTube</span>
              </a>
            ) : (
              <button type="button" onClick={() => setMode("sound")} className="group absolute inset-0 grid place-items-center">
                {!showFrame && <PlayDisc icon="play" />}
                <span className="sr-only">Play {v.title} with sound</span>
              </button>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between gap-4 p-8 xl:flex">
              <div>
                <p className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.2em] text-turmeric uppercase">
                  {showFrame && <span className="size-1.5 animate-pulse-dot rounded-full bg-chili text-chili" />}
                  {external ? "Watch on YouTube" : showFrame ? "Playing on loop · muted" : "Now showing"}
                </p>
                <p className="mt-2 max-w-2xl font-display text-2xl leading-tight text-cream sm:text-3xl">{v.title}</p>
              </div>
              {!external && <span className="hidden shrink-0 rounded-full bg-cream/15 px-4 py-2 text-xs font-semibold text-cream backdrop-blur sm:inline">Tap for sound</span>}
            </div>
          </div>
        )}
      </div>

      <p className="-mt-1 font-display text-lg leading-snug text-cream sm:hidden">{v.title}</p>

      <ul
        className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:col-start-2 lg:row-start-2 lg:grid-cols-1 lg:content-start"
        aria-label="More commercials"
      >
        {videos.map((item, i) => (
          <li key={item.youtubeId} className="w-[16.5rem] shrink-0 snap-start sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActive(i);
                setMode("ambient");
              }}
              aria-current={i === active}
              className={`group flex h-full w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors lg:gap-4 ${i === active ? "bg-cream/10 ring-1 ring-cream/20" : "hover:bg-cream/5"}`}
            >
              <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.poster.src} alt="" fill sizes="7rem" className={`object-cover ${letterbox(item.poster)}`} />
                {i === active && <span className="absolute inset-0 ring-2 ring-turmeric ring-inset" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.75rem] font-semibold tracking-[0.18em] text-cream/45 uppercase">
                  0{i + 1}
                  {nonEmbeddable.includes(item.youtubeId) ? " · YouTube" : ""}
                </span>
                <span className="mt-0.5 block text-[0.92rem] leading-snug font-medium text-cream/90">{item.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayDisc({ icon }: { icon: "play" | "external" }) {
  return (
    <span className="relative grid size-20 place-items-center rounded-full bg-cream/95 text-forest shadow-2xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 sm:size-24">
      <span className="absolute inset-0 animate-ping rounded-full bg-cream/40 [animation-duration:2.4s]" />
      <Icon name={icon} className="relative ml-1 size-7" strokeWidth={2} />
    </span>
  );
}
