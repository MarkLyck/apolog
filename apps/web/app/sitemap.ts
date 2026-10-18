import { api } from "@apolog/backend/api";
import { corpusKeys } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";

import { absoluteUrl, canonicalUrl } from "@/lib/metadata";
import { corpusIndependentRoutes, sitemapRoutes } from "@/lib/public-routes";

interface SitemapContent {
  articles: { slug: string; updatedAt: number }[];
}

export function buildSitemap(content: SitemapContent): MetadataRoute.Sitemap {
  const corpusRoutes = sitemapRoutes.flatMap((route) =>
    (corpusIndependentRoutes.has(route) ? [undefined] : corpusKeys).map(
      (corpus) => ({
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
        url: canonicalUrl(route || "/", corpus),
      })
    )
  );
  const articleRoutes = content.articles.map((article) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(article.updatedAt),
    priority: 0.7,
    url: absoluteUrl(`/articles/${article.slug}`),
  }));
  return [...corpusRoutes, ...articleRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await fetchQuery(api.seo.sitemapEntries, {}));
}
