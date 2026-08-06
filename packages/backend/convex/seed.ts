/* oxlint-disable unicorn/prefer-ternary -- Explicit branches keep reconciliation auditable. */
import { contentFixtures } from "@apolog/shared/demo-content";

import { buildSeedDocuments } from "../src/seed-data";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

type PreparedArticle = ReturnType<
  typeof buildSeedDocuments
>["articles"][number];

async function reconcileArticleRelations(
  ctx: MutationCtx,
  article: Doc<"articles">,
  fixture: PreparedArticle,
  seededAt: number
) {
  const currentPlacements = await ctx.db
    .query("articlePlacements")
    .withIndex("by_article", (index) => index.eq("articleId", article._id))
    .collect();
  const currentSearches = await ctx.db
    .query("searchDocuments")
    .withIndex("by_article", (index) => index.eq("articleId", article._id))
    .collect();
  const currentTags = await ctx.db
    .query("articleTags")
    .withIndex("by_article", (index) => index.eq("articleId", article._id))
    .collect();

  for (const relation of [
    ...currentPlacements,
    ...currentSearches,
    ...currentTags,
  ]) {
    await ctx.db.delete(relation._id);
  }

  for (const placement of fixture.placements) {
    await ctx.db.insert("articlePlacements", {
      ...placement,
      articleCreatedAt: article._creationTime,
      articleId: article._id,
    });
  }
  for (const search of fixture.searches) {
    await ctx.db.insert("searchDocuments", {
      ...search,
      articleId: article._id,
      sourceCreatedAt: article._creationTime,
    });
  }
  for (const tag of fixture.tagKeys) {
    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_key", (index) => index.eq("key", tag.key))
      .unique();
    const tagId = existingTag
      ? existingTag._id
      : await ctx.db.insert("tags", { ...tag, updatedAt: seededAt });
    if (existingTag && existingTag.label !== tag.label) {
      await ctx.db.patch(existingTag._id, {
        label: tag.label,
        updatedAt: seededAt,
      });
    }
    await ctx.db.insert("articleTags", {
      articleId: article._id,
      tagId,
      tagKey: tag.key,
      tagLabel: tag.label,
      updatedAt: seededAt,
    });
  }
}

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const prepared = buildSeedDocuments(contentFixtures);
    const seededAt = Date.now();

    for (const corpus of prepared.corpora) {
      const existing = await ctx.db
        .query("corpora")
        .withIndex("by_key", (index) => index.eq("key", corpus.key))
        .unique();
      const value = { ...corpus, updatedAt: seededAt };
      if (existing) {
        await ctx.db.patch(existing._id, value);
      } else {
        await ctx.db.insert("corpora", value);
      }
    }

    for (const fixture of prepared.articles) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_import_key", (index) =>
          index.eq("importKey", fixture.document.importKey)
        )
        .unique();
      let articleId: Id<"articles">;
      if (existing) {
        await ctx.db.patch(existing._id, fixture.document);
        articleId = existing._id;
      } else {
        articleId = await ctx.db.insert("articles", fixture.document);
      }
      const article = await ctx.db.get(articleId);
      if (!article) {
        throw new Error(`Could not read seeded article ${articleId}`);
      }
      await reconcileArticleRelations(ctx, article, fixture, seededAt);
    }

    return { articles: prepared.articles.length };
  },
});
