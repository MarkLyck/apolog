import { type ArticleContent, articleContentSchema } from "@apolog/shared";
import { ConvexError, v } from "convex/values";
import * as valibot from "valibot";

import { projectArticle } from "../src/article-projection";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { articleDocumentValidator, articleSourceValidator } from "./validators";

async function loadArticles(ctx: QueryCtx) {
  const [articles, placements] = await Promise.all([
    ctx.db.query("articles").collect(),
    ctx.db.query("articlePlacements").collect(),
  ]);
  const ids = new Set(
    placements
      .filter((placement) => placement.collectionKey === "contradictions")
      .map((placement) => placement.articleId)
  );
  return {
    articles,
    placements,
    contradictions: articles.filter((article) => ids.has(article._id)),
  };
}

export const snapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const current = await loadArticles(ctx);
    const allTags = await ctx.db.query("articleTags").collect();
    return current.contradictions.map((article) => {
      const placements = current.placements.filter(
        (placement) => placement.articleId === article._id
      );
      const tags = allTags.filter((tag) => tag.articleId === article._id);
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
    });
  },
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

async function insertArticle(
  ctx: MutationCtx,
  article: ArticleContent,
  digest: string,
  tagIds: Map<string, Id<"tags">>
) {
  const { placements, tags, ...content } = article;
  const id = await ctx.db.insert("articles", {
    ...content,
    importKey: `contradictions:v2:${digest}:${article.slug}`,
    status: "published",
    version: 1,
  });
  const inserted = await ctx.db.get(id);
  if (!inserted) {
    throw new ConvexError("Could not read inserted article.");
  }
  const projection = projectArticle(article);
  for (const placement of placements) {
    const common = {
      articleId: id,
      collectionKey: placement.collectionKey,
      corpusKey: placement.corpusKey,
      comparisonReferences: projection.comparisonReferences,
      position: placement.position,
      status: inserted.status,
      tags,
      updatedAt: article.updatedAt,
    };
    await ctx.db.insert("articlePlacements", {
      ...common,
      articleCreatedAt: inserted._creationTime,
      isPrimary: placement.isPrimary,
      publishedAt: article.publishedAt,
    });
    await ctx.db.insert("searchDocuments", {
      ...common,
      sourceCreatedAt: inserted._creationTime,
      searchText: projection.searchText,
      title: article.title,
      summary: article.summary,
    });
  }
  for (const tag of projection.tagKeys) {
    let tagId = tagIds.get(tag.key);
    if (!tagId) {
      tagId = await ctx.db.insert("tags", {
        ...tag,
        updatedAt: article.updatedAt,
      });
      tagIds.set(tag.key, tagId);
    }
    await ctx.db.insert("articleTags", {
      articleId: id,
      tagId,
      tagKey: tag.key,
      tagLabel: tag.label,
      updatedAt: article.updatedAt,
    });
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
    const current = await loadArticles(ctx);
    const existing = current.contradictions;
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
    const bySlug = new Map(
      current.articles.map((article) => [article.slug, article])
    );
    for (const article of articles) {
      const collision = bySlug.get(article.slug);
      if (collision && !existingIds.has(collision._id)) {
        throw new ConvexError(
          `Slug belongs to an unrelated article: ${article.slug}`
        );
      }
    }
    const [searches, articleTags, storedTags] = await Promise.all([
      ctx.db.query("searchDocuments").collect(),
      ctx.db.query("articleTags").collect(),
      ctx.db.query("tags").collect(),
    ]);
    for (const relation of [
      ...current.placements,
      ...searches,
      ...articleTags,
    ]) {
      if (existingIds.has(relation.articleId)) {
        await ctx.db.delete(relation._id);
      }
    }
    for (const article of existing) {
      await ctx.db.delete(article._id);
    }
    const tagIds = new Map(storedTags.map((tag) => [tag.key, tag._id]));
    for (const article of articles) {
      await insertArticle(ctx, article, args.digest, tagIds);
    }
    return {
      deleted: existing.length,
      inserted: articles.length,
      unchanged: 0,
    };
  },
});
