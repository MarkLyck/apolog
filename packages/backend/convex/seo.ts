import { query } from "./_generated/server";

export const sitemapEntries = query({
  args: {},
  handler: async (ctx) => {
    const [articles, contradictions] = await Promise.all([
      ctx.db
        .query("articles")
        .filter((filter) => filter.eq(filter.field("status"), "published"))
        .collect(),
      ctx.db
        .query("contradictions")
        .filter((filter) => filter.eq(filter.field("status"), "published"))
        .collect(),
    ]);
    return {
      articles: articles.map(({ slug, type, updatedAt }) => ({
        slug,
        type,
        updatedAt,
      })),
      contradictions: contradictions.map(({ slug, updatedAt }) => ({
        slug,
        updatedAt,
      })),
    };
  },
});
