import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fruiticana",
    short_name: "Fruiticana",
    description: "Fresh fruits, vegetables and spices. 25 grocery stores across BC and Alberta since 1994.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf5ea",
    theme_color: "#0f3b26",
    // Install icons live in /public and are only fetched when the site is installed,
    // so they never compete with page content the way a large favicon would.
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
