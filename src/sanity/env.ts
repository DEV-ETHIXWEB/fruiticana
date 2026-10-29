export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** The site runs on bundled seed content until a Sanity project is connected. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId);
