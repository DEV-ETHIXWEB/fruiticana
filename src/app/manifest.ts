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
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
