import { api } from "@apolog/backend/api";
import { fetchQuery } from "convex/nextjs";
import * as Effect from "effect/Effect";

import { listArticlesByCollection } from "@/lib/data";
import { discoveryLinks } from "@/lib/discovery";
import { rssFeed } from "@/lib/rss-feed";
import { siteConfig } from "@/lib/site";

const feedSize = 50;

export async function GET() {
  const [collections, sitemap] = await Promise.all([
    Effect.runPromise(listArticlesByCollection(() => "newest")),
    fetchQuery(api.seo.sitemapEntries, {}),
  ]);
  const articles = [
    ...new Map(
      collections
        .flatMap((collection) => collection.articles)
        .map((article) => [article.slug, article])
    ).values(),
  ]
    .sort((left, right) => right.publishedAt - left.publishedAt)
    .slice(0, feedSize);
  const lastBuildDate = Math.max(
    0,
    ...articles.map((article) => article.publishedAt),
    ...sitemap.articles.map((article) => article.updatedAt)
  );
  return new Response(
    rssFeed({
      articles,
      description: siteConfig.description,
      feedPath: discoveryLinks.feed.href,
      lastBuildDate,
      siteUrl: siteConfig.url,
      title: discoveryLinks.feed.title,
    }),
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    }
  );
}
