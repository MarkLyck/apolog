import { api } from "@apolog/backend/api";
import { corpusKeys } from "@apolog/shared";
import type { ArticleType } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

interface SitemapContent {
  articles: { slug: string; type: ArticleType; updatedAt: number }[];
  contradictions: { slug: string; updatedAt: number }[];
}

export function buildSitemap(content: SitemapContent): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/contradictions",
    "/debunked",
    "/immoral",
    "/evidence",
    "/silly",
    "/debate",
    "/map",
  ];
  const corpusRoutes = staticRoutes.flatMap((route) =>
    corpusKeys.map((corpus) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(),
      priority: route === "" ? 1 : 0.8,
      url: `${siteConfig.url}${route}?text=${corpus}`,
    }))
  );
  const articleRoutes = content.articles.map((article) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(article.updatedAt),
    priority: 0.7,
    url: `${siteConfig.url}/${article.type}/${article.slug}`,
  }));
  const contradictionRoutes = content.contradictions.map((item) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(item.updatedAt),
    priority: 0.7,
    url: `${siteConfig.url}/contradictions/${item.slug}`,
  }));
  return [...corpusRoutes, ...articleRoutes, ...contradictionRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await fetchQuery(api.seo.sitemapEntries, {}));
}
