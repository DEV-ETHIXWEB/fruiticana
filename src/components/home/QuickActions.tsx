import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/primitives";
import { NearestStore } from "@/components/stores/NearestStore";
import { Arrow } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Flyer, Store } from "@/lib/content/types";

/** The two signature boxes from the legacy homepage, green “Weekly Specials”, yellow “Find a location”. */
export function QuickActions({ flyers, stores }: { flyers: Flyer[]; stores: Store[] }) {
  const lead = flyers[0];
  const retail = stores.filter((s) => !s.isHeadOffice);
  return (
    <section className="container-x grid gap-5 pb-6 lg:grid-cols-2">
      <Reveal className="h-full">
        <div className="grain group/card relative isolate flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-leaf p-7 text-white sm:min-h-[24rem] sm:p-10 lg:min-h-[clamp(22rem,calc(100svh-22rem),27rem)]">
          <div aria-hidden className="absolute -right-16 -bottom-24 -z-10 font-display text-[18rem] leading-none text-white/[0.07] italic">99¢</div>
          <div className="relative z-10 max-w-[19rem] sm:max-w-[56%] lg:max-w-[19rem] xl:max-w-[56%]">
            <span className="hidden size-12 place-items-center rounded-full bg-white/15 sm:grid">
              <Icon name="flyer" className="size-6" />
            </span>
            <h2 className="font-display text-[clamp(2.1rem,1.5rem+1.6vw,2.6rem)] leading-[1] tracking-tight sm:mt-6">Weekly Specials</h2>
            <p className="mt-3 text-white/80">Fresh deals every week. Pick your region and browse this week’s flyer.</p>
          </div>
          <ul className="relative z-10 mt-auto flex flex-wrap gap-2 pt-6 sm:max-w-[60%] sm:pt-8 lg:max-w-none xl:max-w-[60%]">
            {flyers.map((f) => (
              <li key={f.region}>
                <Link href={`/flyers?region=${f.region}`} className="group/btn inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur transition hover:bg-white hover:text-leaf">
                  {f.label} <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          {lead && (
            <Link
              href={`/flyers?region=${lead.region}`}
              aria-label={`Open the ${lead.label} flyer`}
              className="absolute top-8 right-7 hidden w-[clamp(10rem,30%,14rem)] rotate-[6deg] overflow-hidden rounded-xl shadow-[0_30px_60px_-15px_rgb(0_0_0/0.45)] ring-4 ring-white transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-2 group-hover/card:rotate-[3deg] sm:block lg:hidden xl:block"
            >
              <Image src={lead.image.src} alt="" width={lead.image.width} height={lead.image.height} sizes="15rem" className="h-auto w-full" />
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-turmeric p-7 text-forest sm:min-h-[24rem] sm:p-10 lg:min-h-[clamp(22rem,calc(100svh-22rem),27rem)]">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[19rem]">
              <span className="hidden size-12 place-items-center rounded-full bg-forest/10 sm:grid">
                <Icon name="pin" className="size-6" />
              </span>
              <h2 className="font-display text-[clamp(2.1rem,1.5rem+1.6vw,2.6rem)] leading-[1] tracking-tight sm:mt-6">Find a location near you</h2>
              <p className="mt-3 text-forest/75">{retail.length} stores across BC and Alberta. There’s sure to be a Fruiticana near you.</p>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute -right-6 -bottom-20 font-display text-[18rem] leading-none text-forest/[0.07] italic">{retail.length}</div>
          <div className="mt-auto space-y-4 pt-6 sm:pt-8">
            <NearestStore stores={retail} tone="dark" />
            <Link href="/storefinder" className="group/btn inline-flex items-center gap-2 text-sm font-semibold underline decoration-forest/30 underline-offset-4 hover:decoration-forest">
              Browse all locations <Arrow />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
