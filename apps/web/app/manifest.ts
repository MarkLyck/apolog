import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f2efe7",
    description: siteConfig.description,
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "/icon-192.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/icon-512.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icon-maskable-512.png",
        type: "image/png",
      },
    ],
    id: "/",
    name: siteConfig.name,
    scope: "/",
    short_name: siteConfig.name,
    start_url: "/",
    theme_color: "#db3f27",
  };
}
