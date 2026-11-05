import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/Button";
import type { Promo } from "@/lib/content/types";
import { getT } from "@/i18n/server";

/*
 * A festival promotion drawn in code: night sky, a string of lights, a lit diya over a slowly
 * turning rangoli and embers drifting up. Everything is text and SVG, so it is sharp on any
 * screen, reads in Punjabi, and costs no image download. Motion is CSS only (no JavaScript)
 * and stops for visitors who ask for reduced motion.
 */

const THEMES = {
  diwali: { bg: "bg-[#150a1c]", glowA: "rgb(246 166 28 / 0.38)", glowB: "rgb(226 35 26 / 0.22)", ink: "text-turmeric" },
  harvest: { bg: "bg-forest-deep", glowA: "rgb(246 210 28 / 0.3)", glowB: "rgb(24 161 79 / 0.25)", ink: "text-turmeric" },
} as const;

/* Fixed positions (not random) so the server and the browser draw the same picture. */
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: (i * 0.83) % 7,
  duration: 6 + (i % 5),
  size: 2 + (i % 3),
}));
const BULBS = 29;
const SWAGS = 4;

function Lights() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-12">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d={Array.from({ length: SWAGS }, (_, s) => `${s === 0 ? "M0 2" : ""} Q ${(s + 0.5) * (100 / SWAGS)} 34 ${(s + 1) * (100 / SWAGS)} 2`).join(" ")}
          fill="none"
          stroke="rgb(250 245 234 / 0.18)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {Array.from({ length: BULBS }, (_, i) => {
        const x = i / (BULBS - 1);
        const t = (x * SWAGS) % 1;
        // the swag is a quadratic from y=2 through control y=34 (viewBox units, 30 = 48px tall): y(t) = 2 + 64t(1-t)
        const y = (2 + 64 * t * (1 - t)) * 1.6 - 3;
        return (
          <span
            key={i}
            className="festival-bulb absolute size-1.5 -translate-x-1/2 rounded-full"
            style={{ left: `${x * 100}%`, top: `${y}px`, animationDelay: `${(i % 7) * 0.35}s`, background: i % 3 === 0 ? "#ffd27a" : i % 3 === 1 ? "#ffb347" : "#fff1c1" }}
          />
        );
      })}
    </div>
  );
}

function Rangoli({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="-100 -100 200 200" className={className} fill="none" stroke="currentColor">
      <circle r="96" strokeWidth="0.6" strokeDasharray="1 4" />
      <circle r="84" strokeWidth="0.5" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={`a${i}`} cx="0" cy="-62" rx="9" ry="22" strokeWidth="0.7" transform={`rotate(${i * 22.5})`} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`b${i}`} d="M0 -40 C 12 -30 12 -14 0 -6 C -12 -14 -12 -30 0 -40 Z" strokeWidth="0.8" transform={`rotate(${i * 45})`} />
      ))}
      {Array.from({ length: 32 }, (_, i) => (
        <circle key={`c${i}`} cx="0" cy="-90" r="1.4" fill="currentColor" stroke="none" transform={`rotate(${i * 11.25})`} />
      ))}
      <circle r="5" strokeWidth="0.8" />
    </svg>
  );
}

/* `uid` keeps gradient ids unique: two diyas are on the page (one hidden per breakpoint), and a
   url(#id) that resolves into a display:none copy paints nothing. */
function Diya({ uid }: { uid: string }) {
  return (
    <svg aria-hidden viewBox="0 0 240 200" className="relative w-full">
      <defs>
        <radialGradient id={`ff-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#f6a61c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f6a61c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ff-flame-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="45%" stopColor="#ffc93c" />
          <stop offset="100%" stopColor="#f0641e" />
        </linearGradient>
        <linearGradient id={`ff-clay-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8682a" />
          <stop offset="100%" stopColor="#7c2b0d" />
        </linearGradient>
        <linearGradient id={`ff-rim-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6d21c" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#f6d21c" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle className="festival-glow" cx="120" cy="78" r="78" fill={`url(#ff-glow-${uid})`} />
      <g className="festival-flame">
        <path d="M120 22 C 140 52 148 78 133 98 C 127 106 113 106 107 98 C 92 78 100 52 120 22 Z" fill={`url(#ff-flame-${uid})`} />
        <path d="M120 58 C 128 72 130 86 124 95 C 121 99 119 99 116 95 C 110 86 112 72 120 58 Z" fill="#fffdf2" opacity="0.9" />
      </g>
      <path d="M120 99 v9" stroke="#3a1606" strokeWidth="3" strokeLinecap="round" />
      {/* bowl with its pouring lip on the right */}
      <path d="M34 112 Q 120 124 196 112 Q 214 108 226 98 Q 214 122 200 128 Q 184 168 120 172 Q 56 168 40 128 Q 34 122 34 112 Z" fill={`url(#ff-clay-${uid})`} />
      <ellipse cx="116" cy="113" rx="82" ry="8" fill="#3d1405" />
      <path d="M34 112 Q 120 124 196 112 Q 214 108 226 98" stroke={`url(#ff-rim-${uid})`} strokeWidth="2" fill="none" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={64 + i * 14} cy={142 + Math.sin((i / 8) * Math.PI) * 6} r="2.4" fill="#f6d21c" opacity="0.85" />
      ))}
      <path d="M70 160 Q 120 176 170 160" stroke="#f6d21c" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
      <ellipse cx="120" cy="184" rx="58" ry="5" fill="#000" opacity="0.35" />
    </svg>
  );
}

export async function FestivalFeature({ promo, daysLeft }: { promo: Promo; daysLeft: number | null }) {
  const t = await getT();
  const theme = THEMES[promo.theme] ?? THEMES.diwali;

  return (
    <section aria-label={promo.kicker} className="container-x pt-[clamp(1.5rem,5svh,4.5rem)] max-sm:pt-10">
      <div className={`grain relative isolate overflow-hidden rounded-[var(--radius-card)] ${theme.bg} text-cream shadow-[0_40px_100px_-50px_rgb(21_10_28/0.9)]`}>
        {/* light */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-40 -z-10 size-[42rem] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${theme.glowA}, transparent 62%)` }} />
        <div aria-hidden className="pointer-events-none absolute -top-48 -left-40 -z-10 size-[36rem] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${theme.glowB}, transparent 65%)` }} />
        <Lights />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="festival-ember absolute bottom-0 rounded-full bg-[#ffcf6b]"
              style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s` }}
            />
          ))}
        </div>

        {/* phones and tablets: the diya is a small accent in the corner; desktop gives it a column */}
        <div aria-hidden className="absolute top-12 right-4 w-[5.5rem] sm:top-14 sm:right-8 sm:w-32 lg:hidden">
          <Diya uid="sm" />
        </div>

        <div className="grid px-6 pt-14 pb-8 sm:px-10 sm:pt-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)] lg:items-center lg:gap-10 lg:px-14 lg:pt-[clamp(2.75rem,6.5svh,5rem)] lg:pb-[clamp(1.25rem,3.5svh,2rem)] xl:px-20">
          <div>
            <Reveal className="flex flex-wrap items-center gap-x-3 gap-y-2.5 pr-20 sm:pr-36 lg:pr-0">
              <span className="eyebrow text-turmeric max-sm:gap-2 max-sm:tracking-[0.14em] max-sm:before:w-4">{promo.kicker}</span>
              {daysLeft !== null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-chili/90 px-3 py-1 text-[0.75rem] font-semibold tracking-wide text-white">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-white text-white" />
                  {t.home.promoDaysLeft(daysLeft)}
                </span>
              )}
            </Reveal>
            <SplitHeading
              as="h2"
              text={promo.title}
              className="mt-5 max-w-[14ch] font-display text-[clamp(2.4rem,min(1.2rem+4.2vw,7.2svh),5.25rem)] lg:mt-[clamp(0.75rem,2.5svh,1.25rem)] leading-[0.98] tracking-[-0.035em] text-cream"
              accentClassName="festival-gold italic"
            />
            <Reveal delay={0.1}>
              <p className={`mt-4 font-display text-[clamp(1.15rem,0.95rem+0.8vw,1.55rem)] italic ${theme.ink}`}>{promo.dates}</p>
              <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed text-cream/75 sm:text-[1.05rem] lg:text-[1rem] xl:text-[1.05rem]">{promo.body}</p>
              <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                <ButtonLink href={promo.ctaHref} variant="light" size="fluid" magnetic={false} data-track="Festival feature" data-track-cta="primary">
                  {promo.ctaLabel}
                </ButtonLink>
                <ButtonLink href="/flyers" variant="outline-light" size="fluid" magnetic={false} arrow={false} data-track="Festival feature" data-track-cta="flyers">
                  {t.home.promoFlyers}
                </ButtonLink>
              </div>
            </Reveal>
            {promo.steps.length > 0 && (
              <Reveal delay={0.18}>
                <p className="mt-7 text-[0.7rem] font-semibold max-sm:sr-only lg:mt-[clamp(1.25rem,3.5svh,2rem)] tracking-[0.22em] text-cream/55 uppercase">{t.home.promoHow}</p>
                <ol className="mt-3 grid grid-cols-3 max-sm:mt-6 gap-px overflow-hidden rounded-2xl bg-cream/10">
                  {promo.steps.map((s, i) => (
                    <li key={i} className="flex flex-col gap-1.5 bg-[#1b0f22] px-3 py-3 sm:flex-row sm:gap-3.5 sm:px-5 sm:py-4">
                      <span className="festival-gold font-display text-[1.35rem] leading-none italic sm:text-[1.7rem]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[0.8rem] leading-snug font-medium text-cream/90 sm:text-[0.92rem]">{s}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}
          </div>

          <Reveal y={40} delay={0.15} className="relative mx-auto hidden w-full max-w-[24rem] lg:block">
            <Rangoli className="festival-rangoli absolute top-1/2 left-1/2 -z-10 w-[125%] -translate-x-1/2 -translate-y-1/2 text-turmeric/[0.16]" />
            <Diya uid="lg" />
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 border-t border-cream/10 px-6 py-4 sm:py-5 lg:py-[clamp(0.9rem,2.5svh,1.25rem)] text-sm sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14 xl:px-20">
          {promo.sponsors.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-cream/55">{t.home.promoSponsors}</span>
              {promo.sponsors.map((s, i) => (
                <span key={s} className="inline-flex items-center gap-3 font-display text-[1.05rem] tracking-wide text-cream">
                  {i > 0 && <span aria-hidden className="size-1 rotate-45 bg-turmeric/70" />}
                  {s}
                </span>
              ))}
            </p>
          )}
          {promo.finePrint && <p className="text-[0.8rem] text-cream/50">{promo.finePrint}</p>}
        </div>
      </div>
    </section>
  );
}
