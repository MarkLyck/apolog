import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

const privatePaths = ["/api/", "/preview/"];

const retrievalCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { allow: "/", disallow: privatePaths, userAgent: retrievalCrawlers },
      { disallow: "/", userAgent: trainingCrawlers },
      { allow: "/", disallow: privatePaths, userAgent: "*" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
