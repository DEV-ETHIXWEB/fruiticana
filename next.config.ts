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
  { source: "/tempwg", destination: "/" },
  { source: "/index.php", destination: "/" },
  { source: "/uploads/content/ForcedandChildLabourReport202425.pdf", destination: "/docs/forced-and-child-labour-report-2024-25.pdf" },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
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
