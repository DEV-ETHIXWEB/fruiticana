# Fruiticana website

The rebuild of [fruiticana.com](https://www.fruiticana.com): 25 South Asian grocery stores across BC and Alberta, since 1994.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Lenis · MapLibre · Sanity (headless CMS)

## Quick start

```bash
npm install          # also copies the MapLibre worker into public/vendor
npm run dev          # http://localhost:3000  (use -- -p 4317 if 3000 is taken)
```

The site runs with **no configuration**: every page, store, flyer and image from the legacy site is bundled as seed content in `src/lib/content/seed`. Connect Sanity when you're ready to edit content in a CMS.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run seed` | Imports all seed content and images into Sanity (idempotent) |
| `npm run qa -- /path out 1440` | Full-page screenshot + console/network errors for one route |
| `node scripts/qa-sweep.mjs / /flyers …` | Every route at 1440 + 390px: errors, overflow, h1, meta length, stray dashes |
| `node scripts/qa-footer.mjs <dir>` | Footer screenshots at 4 breakpoints + WCAG contrast + link check |
| `node scripts/qa-sections.mjs <route> [dir]` | Per-section audit at 5 viewports: section fits one screen, no text overlap, no clipping/ellipsis/clipped placeholders, no image over text, no oversized images, no overflow. Writes section screenshots |
| `node scripts/qa-pages.mjs <dir> <width> <routes…>` | Full-page captures + grid-edge alignment audit |
| `node scripts/qa-lcp.mjs <routes…>` | Real first-load LCP element per route (desktop + mobile) |

QA scripts use Playwright (`npx playwright install chromium` once).

## Content (headless)

`src/lib/content/index.ts` is the only data API the pages use. Each getter queries Sanity and **falls back to the seed** if Sanity isn't configured, returns nothing, or errors, so the site is never blank.

To enable the CMS:

1. Create a project at sanity.io/manage and copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, and `SANITY_API_WRITE_TOKEN` (Editor token).
3. `npm run seed` to import everything.
4. Edit at **/studio**: site settings, weekly flyers, homepage banners, stores, pages, community posts, events, commercials. Contact and newsletter submissions land in **Inbox** when the write token is set.
5. Add a Sanity webhook to `POST /api/revalidate` (projection `{_type, "slug": slug.current}`, secret `SANITY_REVALIDATE_SECRET`) so edits go live instantly.

Weekly flyer swap: Studio → Weekly flyers → replace the image for the region. Newest flyer per region wins.

## Forms

`src/app/actions.ts`: Zod validation, honeypot, minimum fill time, per-IP throttle. Delivery goes to Resend (`RESEND_API_KEY` + `CONTACT_TO_EMAIL`) and/or the Sanity inbox. In production with neither configured the form shows an honest error (with the phone/email) instead of silently dropping messages.

## SEO

- Legacy URLs kept (`/storefinder`, `/flyers`, `/blog`, `/our-company`, `/indican`, …); changed or dead legacy paths 301 in `next.config.ts`.
- Every store has its own page `/storefinder/[slug]` with `GroceryStore` JSON-LD (geo, hours, phone) for local search.
- Organization, WebSite, BreadcrumbList, ItemList, NewsArticle and Event structured data.
- `sitemap.xml`, `robots.txt`, generated Open Graph image, manifest, canonical URLs, titles ≤ 65 and descriptions ≤ 160 chars.

## Notes

- Store hours and open/closed status are computed in each store's own time zone (BC vs Alberta).
- Map tiles: OpenFreeMap (free, no key). Postal-code search geocodes via `/api/geocode` (validated Canadian postal codes only, cached 24h).
- Commercials play on a muted loop when in view; one YouTube video blocks embedding and links out. The Global News clip uses Global's official player, which can't loop; set `newsClip.loopSrc` to a licensed MP4 to loop it.
- Images are served as AVIF/WebP at quality 90 up to 3840px. Many legacy photos are under 1000px wide; upload original high-res files in the Studio for sharper results.
- Layout rule: on screens 1024px and up every homepage section fits one viewport (sizes use `svh` as well as `vw`); on phones, collections become swipe rows. `qa-sections.mjs` enforces it.
- Above-the-fold entrances are CSS animations (`.enter-*`, `.split-word` in `globals.css`), so the hero never waits for JavaScript and LCP stays fast. Scroll reveals use Motion.
- Fonts are self-hosted via `next/font` with only the axes in use (Fraunces SOFT, Instrument Sans default). Minimum text size is 12px; colour tokens are tuned for WCAG AA.
- `experimental.turbopackFileSystemCacheForBuild` is off: the persistent build cache shipped stale CSS after `@theme` token edits.
- Homepage hero video lives in `public/video/`: an 11s seamless loop of two clips (crossfaded, mirrored so the subject sits right of the headline). Desktop 1280x720 and phone 544x960 crops, each in AV1 (served first) and H.264 (fallback), plus first-frame posters that are the LCP image. `HeroVideo` never plays for reduced-motion or Save-Data users, pauses off-screen, and has a pause control (WCAG 2.2.2). To replace it, keep the same file names and sizes.
- House style: no em or en dashes in copy, code or comments.

## Structure

```
src/app/(site)/        pages (legacy URL structure)
src/app/api/           geocode, revalidate
src/app/studio/        embedded Sanity Studio
src/components/        layout, home, page, stores, flyers, forms, motion, ui
src/lib/content/       types, seed data, Sanity-backed getters
src/sanity/            client, env, schemas
scripts/               seed + QA tooling
```
