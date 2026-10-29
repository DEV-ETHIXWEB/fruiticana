"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type NewsClip = {
  title: string;
  source: string;
  duration: string;
  /** Publisher's official embed player */
  embedUrl: string;
  /** Publisher's article page */
  pageUrl: string;
  /**
   * Optional licensed / self-hosted MP4. When present the clip plays muted on a
   * loop like the commercials; the publisher embed can't loop (autostart is
   * locked off by Global News).
   */
  loopSrc?: string;
  poster?: string;
};

/** Inline news clip: loops when a licensed file exists, otherwise the official player loads in place. */
export function NewsVideo({ clip }: { clip: NewsClip }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px" });
  const reduce = useReducedMotion();
  const [sound, setSound] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-forest text-cream">
      <div ref={ref} className="relative aspect-video overflow-hidden bg-forest-deep">
        {clip.poster && !clip.loopSrc && (
          <>
            <Image src={clip.poster} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="scale-110 object-cover opacity-50 blur-[3px]" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="size-8 animate-spin rounded-full border-2 border-cream/25 border-t-cream" />
            </span>
          </>
        )}
        {clip.loopSrc ? (
          <>
            <video
              className="absolute inset-0 size-full object-cover"
              src={clip.loopSrc}
              poster={clip.poster}
              autoPlay={!reduce}
              muted={!sound}
              loop
              playsInline
              preload="metadata"
              controls={sound}
              aria-label={clip.title}
            />
            {!sound && (
              <button type="button" onClick={() => setSound(true)} className="absolute right-3 bottom-3 rounded-full bg-forest-deep/80 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur">
                Tap for sound
              </button>
            )}
          </>
        ) : inView ? (
          <iframe
            className="absolute inset-0 size-full"
            src={clip.embedUrl}
            title={clip.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2 p-6">
        <p className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] text-turmeric uppercase">
          {clip.source} <span className="text-cream/50">· {clip.duration}</span>
        </p>
        <h3 className="font-display text-xl leading-snug">{clip.title}</h3>
        <a href={clip.pageUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-cream/75 hover:text-turmeric">
          Read the story on {clip.source} <Icon name="external" className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
