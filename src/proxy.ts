import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, punjabiLive } from "@/i18n/config";

/**
 * Language routing.
 *  - English keeps today's URLs: "/flyers" is served (rewritten, not redirected) from the
 *    /en tree, so links, bookmarks and search rankings are untouched.
 *  - Punjabi lives under "/pa/...".
 *  - "/en/..." is never public: it 308s to the clean English URL (one URL per page).
 *  - Only the bare homepage honours a visitor's remembered choice ("/" -> "/pa"), so an
 *    English link someone shares always opens in English.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/pa" || pathname.startsWith("/pa/")) {
    // not released yet: Punjabi URLs behave like any unknown page
    if (!punjabiLive) return NextResponse.rewrite(new URL("/en/__punjabi-not-live", request.url));
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    // Share images Next generates for English pages are addressed by their internal /en path
    // (og:image); serve them directly instead of bouncing social-media scrapers through a redirect.
    if (/\/(opengraph-image|twitter-image)(\/|$)/.test(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL(`${pathname.slice(3) || "/"}${search}`, request.url), 308);
  }

  if (punjabiLive && pathname === "/" && request.cookies.get(LANG_COOKIE)?.value === "pa") {
    return NextResponse.redirect(new URL(`/pa${search}`, request.url), 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals, API routes, the CMS studio and files with an extension
  // (robots.txt, sitemap.xml, favicon.ico, images, PDFs, videos).
  matcher: ["/((?!_next/|api/|studio(?:/|$)|.*\\.[a-zA-Z0-9]+$).*)"],
};
