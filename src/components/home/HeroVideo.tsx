"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/I18nProvider";

type Poster = { srcSet?: string; src: string };

/**
 * Full-bleed hero loop.
 *  - The poster (first frame) is a real <picture> rendered on the server, so it
 *    paints immediately and is the page's LCP; the video fades in only once it
 *    is actually playing.
 *  - 1080p, 48fps (motion-interpolated from AI-upscaled 24fps frames), 10-bit
 *    so the warm gradients never band. The browser picks AV1 where supported,
 *    HEVC on Safari, H.264 otherwise; a vertical crop for phones.
 *  - Starts downloading only after the page has loaded and gone idle, so on a slow phone
 *    connection the 1 MB film never competes with the poster (the LCP) for bandwidth.
 *  - Never plays for reduced-motion or Save-Data users; pauses when scrolled
 *    away or the tab is hidden; a visible pause control satisfies WCAG 2.2.2.
 */
export function HeroVideo({ desktopPoster, mobilePoster, alt }: { desktopPoster: Poster; mobilePoster: Poster; alt: string }) {
  const { t } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.06]);

  // Only a real autoplay refusal (NotAllowedError, e.g. iOS Low Power Mode) counts as blocked;
  // an AbortError just means a pause() interrupted play() during a quick scroll, so it is ignored.
  const onPlayError = useCallback((err: unknown) => {
    if (err instanceof DOMException && err.name === "NotAllowedError") setBlocked(true);
  }, []);

  const tryPlay = useCallback(() => {
    const v = video.current;
    if (!v || userPaused) return;
    v.play().catch(onPlayError);
  }, [userPaused, onPlayError]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) {
      v.pause();
      return;
    }
    let visible = true;
    let io: IntersectionObserver | null = null;
    const onVis = () => (document.hidden || !visible ? v.pause() : tryPlay());
    const start = () => {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !document.hidden) tryPlay();
        else v.pause();
      });
      io.observe(v);
      document.addEventListener("visibilitychange", onVis);
    };
    // wait for the page's own resources, then an idle moment, before fetching the film
    let idle = 0;
    const schedule = () => {
      const w = window as Window & typeof globalThis;
      idle = typeof w.requestIdleCallback === "function" ? w.requestIdleCallback(start, { timeout: 1500 }) : w.setTimeout(start, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce, tryPlay]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(onPlayError);
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  const showControl = !reduce && !blocked;

  return (
    <div ref={wrap} data-qa="bleed" className="absolute inset-0 -z-10 overflow-hidden bg-forest-deep">
      <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
        <picture>
          <source media="(max-width: 767px)" srcSet={mobilePoster.srcSet} />
          <img
            src={desktopPoster.src}
            srcSet={desktopPoster.srcSet}
            sizes="100vw"
            alt={alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
        >
          <source media="(max-width: 767px)" src="/video/hero-loop-mobile.av1.mp4" type='video/mp4; codecs="av01.0.05M.10"' />
          <source media="(max-width: 767px)" src="/video/hero-loop-mobile.hevc.mp4" type='video/mp4; codecs="hvc1.2.4.L120.B0"' />
          <source media="(max-width: 767px)" src="/video/hero-loop-mobile.mp4" type='video/mp4; codecs="avc1.640028"' />
          <source src="/video/hero-loop.av1.mp4" type='video/mp4; codecs="av01.0.09M.10"' />
          <source src="/video/hero-loop.hevc.mp4" type='video/mp4; codecs="hvc1.2.4.L123.B0"' />
          <source src="/video/hero-loop.mp4" type='video/mp4; codecs="avc1.640020"' />
        </video>
      </motion.div>

      {/* Brand-tinted shade (not flat black): strongest behind the text, clear where the produce is */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_40_25/0.96)_0%,rgb(10_40_25/0.78)_30%,rgb(10_40_25/0.1)_50%,rgb(10_40_25/0.08)_58%,rgb(10_40_25/0.5)_76%,rgb(10_40_25/0.72)_100%)] md:bg-[linear-gradient(to_right,rgb(10_40_25/0.9)_0%,rgb(10_40_25/0.7)_42%,rgb(10_40_25/0.22)_74%,rgb(10_40_25/0.05)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgb(10_40_25/0.55)] to-transparent" />

      {showControl && (
        <button
          type="button"
          onClick={toggle}
          className="absolute top-[5.75rem] right-5 z-10 grid size-10 md:top-auto md:bottom-5 place-items-center rounded-full btn-glass btn-glass-dark text-cream sm:right-8 lg:right-12"
          aria-label={playing ? t.home.heroPause : t.home.heroPlay}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <rect x="6.5" y="5" width="4" height="14" rx="1" />
              <rect x="13.5" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <Icon name="play" className="ml-0.5 size-4" />
          )}
        </button>
      )}
    </div>
  );
}
