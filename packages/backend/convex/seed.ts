/* oxlint-disable unicorn/prefer-ternary -- Explicit branches make database writes and returned IDs auditable. */
import { contentFixtures } from "@apolog/shared/demo-content";

import { buildSeedDocuments } from "../src/seed-data";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

type PreparedArticle = ReturnType<
  typeof buildSeedDocuments
>["articles"][number];

async function reconcileArticleProjections(
  ctx: MutationCtx,
  article: Doc<"articles">,
  fixture: PreparedArticle
) {
  const corpusKeys = fixture.projections.map(
    (projection) => projection.corpusKey
  );
  const desired = new Set(corpusKeys);
  const currentLinks = await ctx.db
    .query("articleCorpora")
    .withIndex("by_article_corpus", (index) =>
      index.eq("articleId", article._id)
    )
    .collect();
  const currentSearch = await ctx.db
    .query("searchDocuments")
    .withIndex("by_article_corpus", (index) =>
      index.eq("articleId", article._id)
    )
    .collect();

  for (const link of currentLinks) {
    if (!desired.has(link.corpusKey)) {
      await ctx.db.delete(link._id);
    }
  }
  for (const document of currentSearch) {
    if (!desired.has(document.corpusKey)) {
      await ctx.db.delete(document._id);
    }
  }

  for (const projection of fixture.projections) {
    const { corpusKey } = projection;
    const existingLink = currentLinks.find(
      (item) => item.corpusKey === corpusKey
    );
    const linkValue = {
      articleCreatedAt: article._creationTime,
      articleId: article._id,
      ...projection.link,
    };
    if (existingLink) {
      await ctx.db.patch(existingLink._id, linkValue);
    } else {
      await ctx.db.insert("articleCorpora", linkValue);
    }

    const existingSearch = currentSearch.find(
      (item) => item.corpusKey === corpusKey
    );
    const documentValue = {
      ...projection.search,
      articleId: article._id,
      sourceCreatedAt: article._creationTime,
    };
    if (existingSearch) {
      await ctx.db.patch(existingSearch._id, documentValue);
    } else {
      await ctx.db.insert("searchDocuments", documentValue);
    }
  }
}

async function reconcileMapLinks(
  ctx: MutationCtx,
  mapEntryId: Id<"mapEntries">,
  type: string,
  updatedAt: number,
  corpusKeys: ("bible" | "quran")[]
) {
  const desired = new Set(corpusKeys);
  const current = await ctx.db
    .query("mapEntryCorpora")
    .withIndex("by_entry_corpus", (index) => index.eq("mapEntryId", mapEntryId))
    .collect();
  for (const link of current) {
    if (!desired.has(link.corpusKey)) {
      await ctx.db.delete(link._id);
    }
  }
  for (const corpusKey of corpusKeys) {
    const value = {
      corpusKey,
      mapEntryId,
      status: "published" as const,
      type,
      updatedAt,
    };
    const existing = current.find((item) => item.corpusKey === corpusKey);
    if (existing) {
      await ctx.db.patch(existing._id, value);
    } else {
      await ctx.db.insert("mapEntryCorpora", value);
    }
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
      await reconcileArticleProjections(ctx, article, fixture);
    }

    for (const item of prepared.contradictions) {
      const existing = await ctx.db
        .query("contradictions")
        .withIndex("by_import_key", (index) =>
          index.eq("importKey", item.importKey)
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, item);
      } else {
        await ctx.db.insert("contradictions", item);
      }
    }

    for (const fixture of prepared.mapEntries) {
      const existing = await ctx.db
        .query("mapEntries")
        .withIndex("by_import_key", (index) =>
          index.eq("importKey", fixture.document.importKey)
        )
        .unique();
      let mapEntryId: Id<"mapEntries">;
      if (existing) {
        await ctx.db.patch(existing._id, fixture.document);
        mapEntryId = existing._id;
      } else {
        mapEntryId = await ctx.db.insert("mapEntries", fixture.document);
      }
      await reconcileMapLinks(
        ctx,
        mapEntryId,
        fixture.document.type,
        fixture.document.updatedAt,
        fixture.corpusKeys
      );
    }

    return {
      articles: prepared.articles.length,
      contradictions: prepared.contradictions.length,
      mapEntries: prepared.mapEntries.length,
    };
  },
});
