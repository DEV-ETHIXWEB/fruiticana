"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { AnimatePresence, m, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Flyer, FlyerRegion } from "@/lib/content/types";

const STORAGE_KEY = "fruiticana:flyer-region";

export function FlyerViewer({ flyers }: { flyers: Flyer[] }) {
  const { t, lang } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const valid = (r: string | null): r is FlyerRegion => Boolean(r) && flyers.some((f) => f.region === r);
  const fromUrl = params.get("region");
  // Last region the shopper picked, read without a hydration mismatch.
  const saved = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem(STORAGE_KEY),
    () => null,
  );
  const [picked, setPicked] = useState<FlyerRegion | null>(null);
  const region: FlyerRegion = picked ?? (valid(fromUrl) ? fromUrl : valid(saved) ? saved : flyers[0].region);
  const [zoomed, setZoomed] = useState(false);

  const choose = (r: FlyerRegion) => {
    setPicked(r);
    localStorage.setItem(STORAGE_KEY, r);
    router.replace(`${pathname}?region=${r}`, { scroll: false });
  };

  const flyer = flyers.find((f) => f.region === region) ?? flyers[0];
  const dFmt = new Intl.DateTimeFormat(lang === "pa" ? "pa-IN" : "en-CA", { month: "short", day: "numeric", timeZone: "UTC" });
  const from = flyer.validFrom && dFmt.format(new Date(flyer.validFrom));
  const to = flyer.validTo && dFmt.format(new Date(flyer.validTo));
  const validity = from && to ? (lang === "pa" ? `${from} ਤੋਂ ${to} ਤੱਕ` : `${from} - ${to}`) : null;

  return (
    <div className="min-w-0">
      <div className="min-w-0">
        <div role="tablist" aria-label={t.flyers.chooseRegion} className="scrollbar-none -mx-5 -my-4 flex min-w-0 gap-2 overflow-x-auto px-5 py-4 sm:-mx-2 sm:px-2">
          {flyers.map((f) => {
            const active = f.region === region;
            return (
              <button
                key={f.region}
                role="tab"
                id={`tab-${f.region}`}
                aria-selected={active}
                aria-controls="flyer-panel"
                onClick={() => choose(f.region)}
                data-track="Flyer region"
                data-track-region={f.region}
                className={`relative shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${active ? "text-white" : "btn-glass text-ink/70 hover:text-ink"}`}
              >
                {active && <m.span layoutId="flyer-tab" className="btn-3d btn-leaf absolute inset-0 rounded-full bg-leaf" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="flyer-panel" role="tabpanel" aria-labelledby={`tab-${region}`} className="mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl text-forest">{t.flyers.flyerOf(flyer.label)}</p>
            <p className="text-sm text-muted">{validity ?? t.stores.thisWeeksSpecials}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setZoomed(true)} data-track="Flyer zoom" data-track-region={flyer.region} className="inline-flex items-center btn-3d btn-forest gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-forest-deep">
              <Icon name="zoomIn" className="size-4" /> {t.flyers.zoom}
            </button>
            <a href={flyer.image.src} download data-track="Flyer save" data-track-region={flyer.region} className="inline-flex items-center btn-glass gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              <Icon name="download" className="size-4" /> {t.flyers.save}
            </a>
          </div>
        </div>
        {/* initial={false}: the first flyer is the page's LCP, so it renders visible immediately; region switches still animate */}
        <AnimatePresence mode="wait" initial={false}>
          <m.button
            key={flyer.region}
            type="button"
            onClick={() => setZoomed(true)}
            initial={{ opacity: 0, y: 24, rotate: -0.6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative mx-auto block w-full max-w-[calc((100svh-21.5rem)*0.77)] cursor-zoom-in overflow-hidden rounded-[var(--radius-card)] bg-white p-2 shadow-[0_40px_90px_-40px_rgb(15_59_38/0.5)] ring-1 ring-ink/[0.06] sm:p-3"
            aria-label={t.flyers.openFull(flyer.label)}
          >
            <Image
              src={flyer.image.src}
              alt={flyer.image.alt}
              width={flyer.image.width}
              height={flyer.image.height}
              preload
              sizes="(min-width: 1024px) 56rem, 100vw"
              quality={90}
              className="h-auto w-full rounded-[1.35rem]"
            />
            <span className="pointer-events-none absolute right-6 bottom-6 inline-flex items-center gap-2 rounded-full bg-forest/90 px-4 py-2.5 text-sm font-semibold text-cream opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Icon name="zoomIn" className="size-4" /> {t.flyers.tapToZoom}
            </span>
          </m.button>
        </AnimatePresence>
      </div>

      <AnimatePresence>{zoomed && <Lightbox flyer={flyer} onClose={() => setZoomed(false)} />}</AnimatePresence>
    </div>
  );
}

/** Full-screen pan & zoom: wheel / pinch-style buttons / drag, keyboard accessible. */
function Lightbox({ flyer, onClose }: { flyer: Flyer; onClose: () => void }) {
  const { t } = useI18n();
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = useSpring(1, { stiffness: 260, damping: 30 });
  const closeRef = useRef<HTMLButtonElement>(null);

  const zoomTo = useCallback(
    (next: number) => {
      const v = Math.min(4, Math.max(1, next));
      setScale(v);
      s.set(v);
      if (v === 1) {
        x.set(0);
        y.set(0);
      }
    },
    [s, x, y],
  );

  useEffect(() => {
    closeRef.current?.focus();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomTo(scale + 0.5);
      if (e.key === "-") zoomTo(scale - 0.5);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, scale, zoomTo]);

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={t.flyers.flyerOf(flyer.label)}
      className="fixed inset-0 z-[60] bg-forest-deep/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-lenis-prevent
      onWheel={(e) => zoomTo(scale + (e.deltaY < 0 ? 0.25 : -0.25))}
    >
      <div className="absolute inset-0 overflow-hidden" onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.2)}>
        <m.div
          className="flex h-full w-full items-center justify-center p-4 sm:p-10"
          style={{ x, y, scale: s }}
          drag={scale > 1}
          dragMomentum
          dragElastic={0.08}
        >
          <Image src={flyer.image.src} alt={flyer.image.alt} width={flyer.image.width} height={flyer.image.height} quality={90} sizes="100vw" className="pointer-events-none h-full w-auto max-w-full rounded-lg object-contain select-none" draggable={false} />
        </m.div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <span className="hidden items-center rounded-full bg-cream/10 px-4 text-sm text-cream/80 sm:inline-flex">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => zoomTo(scale - 0.5)} className="grid size-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label={t.flyers.zoomOut}>
          <Icon name="zoomOut" />
        </button>
        <button type="button" onClick={() => zoomTo(scale + 0.5)} className="grid size-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label={t.flyers.zoomIn}>
          <Icon name="zoomIn" />
        </button>
        <button ref={closeRef} type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-cream text-forest" aria-label={t.flyers.close}>
          <Icon name="close" strokeWidth={2} />
        </button>
      </div>
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-cream/10 px-4 py-2 text-xs text-cream/70">{t.flyers.hint}</p>
    </m.div>
  );
}
