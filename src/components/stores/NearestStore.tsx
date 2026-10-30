"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Icon3D } from "@/components/ui/Icon3D";
import type { Store } from "@/lib/content/types";
import { distanceKm, formatKm } from "@/lib/geo";
import { openState } from "@/lib/hours";

type State = { kind: "idle" } | { kind: "locating" } | { kind: "found"; store: Store; km: number } | { kind: "error"; message: string };

/** One-tap "closest Fruiticana to me", with open/closed status in that store's time zone. */
export function NearestStore({ stores, tone = "dark" }: { stores: Store[]; tone?: "dark" | "light" }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [, force] = useState(0);

  // Re-evaluate open/closed each minute while showing a result.
  useEffect(() => {
    if (state.kind !== "found") return;
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, [state.kind]);

  const locate = () => {
    if (!("geolocation" in navigator)) return setState({ kind: "error", message: "Location isn’t available in this browser." });
    setState({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const me = { lat: coords.latitude, lng: coords.longitude };
        const ranked = stores.map((s) => ({ s, km: distanceKm(me, s) })).sort((a, b) => a.km - b.km);
        setState({ kind: "found", store: ranked[0].s, km: ranked[0].km });
      },
      (err) => setState({ kind: "error", message: err.code === 1 ? "Location permission was declined. Browse all stores instead." : "We couldn’t get your location. Try the store locator." }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const dark = tone === "dark";

  return (
    <div className="min-h-[4.5rem]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {state.kind === "found" ? (
          <motion.div key="found" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Link
              href={`/storefinder/${state.store.slug}`}
              className={`group flex items-center gap-4 rounded-2xl p-4 transition-colors ${dark ? "bg-forest text-cream hover:bg-forest-deep" : "bg-white hover:bg-cream"}`}
            >
              <Icon3D name="pin" className="size-11" />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.75rem] font-semibold tracking-[0.18em] uppercase opacity-60">Closest to you · {formatKm(state.km)}</span>
                <span className="block truncate font-display text-xl">Fruiticana {state.store.name}</span>
                <OpenBadge store={state.store} />
              </span>
              <Icon name="chevron" className="size-5 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </Link>
          </motion.div>
        ) : (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={locate}
              disabled={state.kind === "locating"}
              className={`inline-flex items-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-semibold transition-colors ${dark ? "bg-forest text-cream hover:bg-forest-deep" : "bg-white text-forest hover:bg-cream"}`}
            >
              {state.kind === "locating" ? <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /> : <Icon name="locate" className="size-4" strokeWidth={2} />}
              {state.kind === "locating" ? "Finding the closest store…" : "Use my location"}
            </button>
            {state.kind === "error" && <p className="text-sm opacity-75">{state.message}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OpenBadge({ store, className = "" }: { store: Pick<Store, "opens" | "closes" | "province">; className?: string }) {
  const [state, setState] = useState<ReturnType<typeof openState> | null>(null);
  useEffect(() => {
    const update = () => setState(openState(store));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [store]);
  // Rendered client-side only: server time ≠ shopper's "now".
  if (!state) return <span className={`mt-1 block h-4 ${className}`} />;
  return (
    <span className={`mt-1 inline-flex items-center gap-1.5 text-[0.8rem] font-medium ${className}`}>
      <span className={`size-2 rounded-full ${state.open ? (state.soon ? "bg-mango text-mango" : "animate-pulse-dot bg-leaf-bright text-leaf-bright") : "bg-chili/80"}`} />
      {state.label}
    </span>
  );
}
