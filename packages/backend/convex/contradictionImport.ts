import { type ArticleContent, articleContentSchema } from "@apolog/shared";
import { ConvexError, v } from "convex/values";
import * as valibot from "valibot";

import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { rebuildArticleRelations, removeArticleRelations } from "./articles";
import { articleDocumentValidator, articleSourceValidator } from "./validators";

async function contradictionArticles(ctx: QueryCtx) {
  const placements = await ctx.db
    .query("articlePlacements")
    .filter((q) => q.eq(q.field("collectionKey"), "contradictions"))
    .collect();
  const articles = await Promise.all(
    [...new Set(placements.map((placement) => placement.articleId))].map((id) =>
      ctx.db.get(id)
    )
  );
  return articles.filter((article) => article !== null);
}

export const snapshot = internalQuery({
  args: {},
  handler: async (ctx) =>
    Promise.all(
      (await contradictionArticles(ctx)).map(async (article) => {
        const placements = await ctx.db
          .query("articlePlacements")
          .withIndex("by_article", (q) => q.eq("articleId", article._id))
          .collect();
        const tags = await ctx.db
          .query("articleTags")
          .withIndex("by_article", (q) => q.eq("articleId", article._id))
          .collect();
        return {
          id: article._id,
          version: article.version,
          importKey: article.importKey,
          status: article.status,
          content: {
            title: article.title,
            summary: article.summary,
            slug: article.slug,
            document: article.document,
            sources: article.sources,
            readingMinutes: article.readingMinutes,
            publishedAt: article.publishedAt ?? article._creationTime,
            updatedAt: article.updatedAt,
            contentWarning: article.contentWarning,
            finding: article.finding,
            tags: tags.map((tag) => tag.tagLabel),
            placements: placements.map(
              ({ collectionKey, corpusKey, isPrimary, position }) => ({
                collectionKey,
                corpusKey,
                isPrimary,
                position,
              })
            ),
          },
        };
      })
    ),
});

function validateArticles(articles: ArticleContent[]) {
  for (const article of articles) {
    if (
      article.placements.length !== 1 ||
      article.sources.length !== 0 ||
      /\bsab\b|skeptic['’]?s annotated|skepticsannotatedbible/iu.test(
        JSON.stringify(article)
      )
    ) {
      throw new ConvexError("Unexpected placement or source branding.");
    }
    const quotes = article.document.blocks.filter(
      (block) => block.type === "quote"
    );
    if (
      quotes.length < 2 ||
      quotes.some(
        (quote) =>
          quote.content
            .map((node) => node.text)
            .join("")
            .split(/\s+/u).length < 3
      )
    ) {
      throw new ConvexError(
        "Every article must contain full passage quotations."
      );
    }
  }
}

export const replace = internalMutation({
  args: {
    digest: v.string(),
    expected: v.array(v.object({ id: v.id("articles"), version: v.number() })),
    articles: v.array(
      v.object({
        title: v.string(),
        summary: v.string(),
        slug: v.string(),
        document: articleDocumentValidator,
        sources: v.array(articleSourceValidator),
        readingMinutes: v.number(),
        publishedAt: v.number(),
        updatedAt: v.number(),
        tags: v.array(v.string()),
        placements: v.array(
          v.object({
            collectionKey: v.literal("contradictions"),
            corpusKey: v.literal("bible"),
            isPrimary: v.literal(true),
            position: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const articles = valibot.parse(
      valibot.array(articleContentSchema),
      args.articles
    );
    if (
      articles.length < 500 ||
      articles.length > 1000 ||
      !/^[a-f0-9]{64}$/u.test(args.digest)
    ) {
      throw new ConvexError(
        "Expected a complete, hashed contradiction import."
      );
    }
    if (
      new Set(articles.map((article) => article.slug)).size !==
        articles.length ||
      new Set(articles.map((article) => article.placements[0]?.position))
        .size !== articles.length
    ) {
      throw new ConvexError("Duplicate article slugs or ranks.");
    }
    validateArticles(articles);
    const existing = await contradictionArticles(ctx);
    const expectedKeys = new Set(
      articles.map(
        (article) => `contradictions:v2:${args.digest}:${article.slug}`
      )
    );
    if (
      existing.length === articles.length &&
      existing.every(
        (article) =>
          article.version === 1 && expectedKeys.has(article.importKey)
      )
    ) {
      return { deleted: 0, inserted: 0, unchanged: existing.length };
    }
    const expectedVersions = new Map(
      args.expected.map((article) => [article.id, article.version])
    );
    if (
      existing.length !== args.expected.length ||
      existing.some(
        (article) => expectedVersions.get(article._id) !== article.version
      )
    ) {
      throw new ConvexError(
        "Contradictions changed after the backup. Take a new snapshot before retrying."
      );
    }
    const existingIds = new Set(existing.map((article) => article._id));
    for (const article of articles) {
      const collision = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", article.slug))
        .unique();
      if (collision && !existingIds.has(collision._id)) {
        throw new ConvexError(
          `Slug belongs to an unrelated article: ${article.slug}`
        );
      }
    }
    for (const article of existing) {
      await removeArticleRelations(ctx, article._id);
      await ctx.db.delete(article._id);
    }
    for (const article of articles) {
      const { placements, tags, ...content } = article;
      const id = await ctx.db.insert("articles", {
        ...content,
        importKey: `contradictions:v2:${args.digest}:${article.slug}`,
        status: "published",
        version: 1,
      });
      const inserted = await ctx.db.get(id);
      if (!inserted) {
        throw new ConvexError("Could not read inserted article.");
      }
      await rebuildArticleRelations(ctx, inserted, placements, tags);
    }
    return {
      deleted: existing.length,
      inserted: articles.length,
      unchanged: 0,
    };
  },
});
