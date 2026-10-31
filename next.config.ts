import type { NextConfig } from "next";

/** Legacy URLs that changed or never resolved, 301 so existing rankings and bookmarks carry over. */
const legacyRedirects = [
  { source: "/blog/category/:slug*", destination: "/blog" },
  { source: "/blog/year/:year*", destination: "/blog" },
  { source: "/careers", destination: "/employment" },
  { source: "/store-locator", destination: "/storefinder" },
  { source: "/locations", destination: "/storefinder" },
  { source: "/weekly-specials", destination: "/flyers" },
  { source: "/in-the-community", destination: "/blog" },
  { source: "/community", destination: "/blog" },
  { source: "/home", destination: "/" },
  { source: "/tempwg", destination: "/" },
  { source: "/index.php", destination: "/" },
  { source: "/uploads/content/ForcedandChildLabourReport202425.pdf", destination: "/docs/forced-and-child-labour-report-2024-25.pdf" },
];

/*
 * Content-Security-Policy: built from the hosts the pages actually contact (audited with a
 * main-frame request log): the YouTube and Global News embeds, and OpenFreeMap tiles for
 * the store maps. Everything else (fonts, images, map worker) is self-hosted. Inline
 * scripts/styles stay allowed: Next's bootstrap needs them without per-request nonces,
 * which would force every page to render dynamically. Production only: dev needs eval.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://tiles.openfreemap.org",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://globalnews.ca",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  // Two years; subdomains are left out so any non-HTTPS subdomain of fruiticana.com isn't broken.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  experimental: {
    // The persistent build cache was observed shipping stale CSS after design-token
    // (@theme) edits in globals.css. Production builds always compile fresh.
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Single allowed quality: every image (default 75 included) is coerced to near-lossless 90.
    qualities: [90],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    return [
      { source: "/((?!studio).*)", headers: securityHeaders },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
