import { query } from "./_generated/server";

export const sitemapEntries = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .filter((filter) => filter.eq(filter.field("status"), "published"))
      .collect();
    return {
      articles: articles.map(({ slug, updatedAt }) => ({ slug, updatedAt })),
    };
  },
});
