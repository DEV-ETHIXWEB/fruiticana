"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Video } from "@/lib/content/types";

type Mode = "ambient" | "sound";

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
export function VideoGallery({ videos, nonEmbeddable }: { videos: Video[]; nonEmbeddable: string[] }) {
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
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div ref={frame} className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-forest-deep ring-1 ring-cream/10">
        {/* Poster always underneath: instant paint, and the fallback while the iframe boots */}
        <AnimatePresence mode="wait">
          <motion.div key={`p-${v.youtubeId}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <Image src={v.poster.src} alt={v.poster.alt} fill sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>

        {showFrame && (
          <iframe
            key={`${v.youtubeId}-${mode}`}
            className={`absolute inset-0 size-full ${mode === "ambient" ? "pointer-events-none scale-[1.02]" : ""}`}
            src={embedUrl(v.youtubeId, mode)}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
              <div>
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] text-turmeric uppercase">
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

      <ul className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1" aria-label="More commercials">
        {videos.map((item, i) => (
          <li key={item.youtubeId}>
            <button
              type="button"
              onClick={() => {
                setActive(i);
                setMode("ambient");
              }}
              aria-current={i === active}
              className={`group flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors ${i === active ? "bg-cream/10 ring-1 ring-cream/20" : "hover:bg-cream/5"}`}
            >
              <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.poster.src} alt="" fill sizes="7rem" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                {i === active && <span className="absolute inset-0 ring-2 ring-turmeric ring-inset" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.68rem] font-semibold tracking-[0.18em] text-cream/45 uppercase">
                  0{i + 1}
                  {nonEmbeddable.includes(item.youtubeId) ? " · YouTube" : ""}
                </span>
                <span className="mt-0.5 line-clamp-2 text-[0.92rem] leading-snug font-medium text-cream/90">{item.title}</span>
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
