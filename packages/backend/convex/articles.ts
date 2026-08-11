import { articleDocumentSchema } from "@apolog/shared";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import * as valibot from "valibot";

import { articleTagKey, projectArticle } from "../src/article-projection";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  getArticleTagLabels,
  toPublishedArticleListItem,
} from "./articleViews";
import {
  articleDocumentValidator,
  collectionKeyValidator,
  corpusKeyValidator,
  publicationStatusValidator,
} from "./validators";

const sourceValidator = v.object({
  publisher: v.string(),
  title: v.string(),
  url: v.string(),
});

const placementInputValidator = v.object({
  collectionKey: collectionKeyValidator,
  corpusKey: corpusKeyValidator,
  isPrimary: v.boolean(),
  position: v.number(),
});

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Sign in to manage articles.");
  }
  const role = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (index) => index.eq("userId", userId))
    .unique();
  if (role?.role !== "admin") {
    throw new ConvexError("Administrator access is required.");
  }
  return userId;
}

async function removeArticleRelations(
  ctx: MutationCtx,
  articleId: Id<"articles">
) {
  const relations = await Promise.all([
    ctx.db
      .query("articlePlacements")
      .withIndex("by_article", (index) => index.eq("articleId", articleId))
      .collect(),
    ctx.db
      .query("searchDocuments")
      .withIndex("by_article", (index) => index.eq("articleId", articleId))
      .collect(),
    ctx.db
      .query("articleTags")
      .withIndex("by_article", (index) => index.eq("articleId", articleId))
      .collect(),
  ]);
  for (const relation of relations.flat()) {
    await ctx.db.delete(relation._id);
  }
}

async function rebuildArticleRelations(
  ctx: MutationCtx,
  article: Doc<"articles">,
  placements: {
    collectionKey: Doc<"articlePlacements">["collectionKey"];
    corpusKey: Doc<"articlePlacements">["corpusKey"];
    isPrimary: boolean;
    position: number;
  }[],
  tags: string[]
) {
  await removeArticleRelations(ctx, article._id);
  const projection = projectArticle({
    document: article.document,
    summary: article.summary,
    tags,
    title: article.title,
  });

  for (const placement of placements) {
    const common = {
      articleId: article._id,
      collectionKey: placement.collectionKey,
      comparisonReferences: projection.comparisonReferences,
      corpusKey: placement.corpusKey,
      position: placement.position,
      publishedAt: article.publishedAt,
      status: article.status,
      tags,
      updatedAt: article.updatedAt,
    };
    await ctx.db.insert("articlePlacements", {
      ...common,
      articleCreatedAt: article._creationTime,
      isPrimary: placement.isPrimary,
    });
    await ctx.db.insert("searchDocuments", {
      ...common,
      searchText: projection.searchText,
      sourceCreatedAt: article._creationTime,
      summary: article.summary,
      title: article.title,
    });
  }

  for (const label of tags) {
    const key = articleTagKey(label);
    let tag = await ctx.db
      .query("tags")
      .withIndex("by_key", (index) => index.eq("key", key))
      .unique();
    if (tag === null) {
      const tagId = await ctx.db.insert("tags", {
        key,
        label,
        updatedAt: article.updatedAt,
      });
      tag = await ctx.db.get(tagId);
    } else if (tag.label !== label) {
      await ctx.db.patch(tag._id, { label, updatedAt: article.updatedAt });
    }
    if (tag !== null) {
      await ctx.db.insert("articleTags", {
        articleId: article._id,
        tagId: tag._id,
        tagKey: key,
        tagLabel: label,
        updatedAt: article.updatedAt,
      });
    }
  }
}

function validateEditorialInput(
  placements: {
    collectionKey: string;
    corpusKey: string;
    isPrimary: boolean;
    position: number;
  }[],
  slug: string,
  tags: string[]
) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new ConvexError(
      "Slug must contain lowercase words separated by hyphens."
    );
  }
  if (placements.length === 0) {
    throw new ConvexError("Add at least one article placement.");
  }
  const placementKeys = placements.map(
    (placement) => `${placement.corpusKey}:${placement.collectionKey}`
  );
  if (new Set(placementKeys).size !== placementKeys.length) {
    throw new ConvexError("Article placements must be unique.");
  }
  for (const corpusKey of new Set(placements.map((item) => item.corpusKey))) {
    if (
      placements.filter(
        (item) => item.corpusKey === corpusKey && item.isPrimary
      ).length !== 1
    ) {
      throw new ConvexError("Each corpus needs exactly one primary placement.");
    }
  }
  if (
    placements.some((placement) =>
      placement.collectionKey === "contradictions"
        ? !Number.isInteger(placement.position) || placement.position < 1
        : placement.position !== 0
    )
  ) {
    throw new ConvexError(
      "Only contradiction placements can have a positive rank."
    );
  }
  if (new Set(tags.map((tag) => tag.toLowerCase())).size !== tags.length) {
    throw new ConvexError("Article tags must be unique.");
  }
}

function cleanSources(
  sources: { publisher: string; title: string; url: string }[]
) {
  const cleaned = sources.map((source) => ({
    publisher: source.publisher.trim(),
    title: source.title.trim(),
    url: source.url.trim(),
  }));
  const invalid = cleaned.some((source) => {
    if (!source.title || !source.publisher) {
      return true;
    }
    try {
      return !["http:", "https:"].includes(new URL(source.url).protocol);
    } catch {
      return true;
    }
  });
  if (invalid) {
    throw new ConvexError(
      "Every source needs a title, publisher, and valid URL."
    );
  }
  return cleaned;
}

function cleanEditorialFields(args: {
  placements: {
    collectionKey: string;
    corpusKey: string;
    isPrimary: boolean;
    position: number;
  }[];
  readingMinutes: number;
  slug: string;
  sources: { publisher: string; title: string; url: string }[];
  summary: string;
  tags: string[];
  title: string;
}) {
  const title = args.title.trim();
  const summary = args.summary.trim();
  const slug = args.slug.trim();
  const tags = args.tags.map((tag) => tag.trim()).filter(Boolean);
  if (!title || !summary) {
    throw new ConvexError("Title and summary are required.");
  }
  if (!Number.isInteger(args.readingMinutes) || args.readingMinutes < 1) {
    throw new ConvexError("Reading time must be at least one minute.");
  }
  validateEditorialInput(args.placements, slug, tags);
  return { slug, sources: cleanSources(args.sources), summary, tags, title };
}

function parseArticleDocument(document: Doc<"articles">["document"]) {
  const result = valibot.safeParse(articleDocumentSchema, document);
  if (!result.success) {
    throw new ConvexError(
      `Article content is invalid: ${result.issues[0]?.message ?? "unknown content error"}`
    );
  }
  return result.output;
}

async function assertSlugAvailable(
  ctx: MutationCtx,
  slug: string,
  articleId: Id<"articles"> | undefined
) {
  const conflicting = await ctx.db
    .query("articles")
    .withIndex("by_slug", (index) => index.eq("slug", slug))
    .unique();
  if (conflicting !== null && conflicting._id !== articleId) {
    throw new ConvexError("That article slug is already in use.");
  }
}

async function getExistingArticleForSave(
  ctx: MutationCtx,
  articleId: Id<"articles"> | undefined,
  expectedVersion: number | undefined
) {
  if (!articleId) {
    if (expectedVersion !== undefined) {
      throw new ConvexError("A new article cannot have an existing version.");
    }
    return null;
  }
  const existing = await ctx.db.get(articleId);
  if (existing === null) {
    throw new ConvexError("The article no longer exists.");
  }
  if (expectedVersion !== existing.version) {
    throw new ConvexError(
      "This article changed after you opened it. Reload before saving so you do not overwrite newer work."
    );
  }
  return existing;
}

export const list = query({
  args: {
    collectionKey: collectionKeyValidator,
    corpusKey: corpusKeyValidator,
    paginationOpts: paginationOptsValidator,
    sort: v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("ranked")
    ),
  },
  handler: async (ctx, args) => {
    const base =
      args.sort === "ranked"
        ? ctx.db
            .query("articlePlacements")
            .withIndex("by_corpus_collection_status_position", (index) =>
              index
                .eq("corpusKey", args.corpusKey)
                .eq("collectionKey", args.collectionKey)
                .eq("status", "published")
            )
        : ctx.db
            .query("articlePlacements")
            .withIndex("by_corpus_collection_status_created", (index) =>
              index
                .eq("corpusKey", args.corpusKey)
                .eq("collectionKey", args.collectionKey)
                .eq("status", "published")
            );
    const projections = await base
      .order(
        args.sort === "oldest" ? "asc" : args.sort === "newest" ? "desc" : "asc"
      )
      .paginate(args.paginationOpts);
    const page = await Promise.all(
      projections.page.map(async (placement) =>
        toPublishedArticleListItem(
          await ctx.db.get(placement.articleId),
          placement
        )
      )
    );
    return {
      ...projections,
      page: page.filter((article) => article !== null),
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    if (!article || article.status !== "published") {
      return null;
    }
    const placements = (
      await ctx.db
        .query("articlePlacements")
        .withIndex("by_article", (index) => index.eq("articleId", article._id))
        .collect()
    )
      .filter((placement) => placement.status === "published")
      .sort(
        (left, right) =>
          left.corpusKey.localeCompare(right.corpusKey) ||
          Number(right.isPrimary) - Number(left.isPrimary) ||
          left.collectionKey.localeCompare(right.collectionKey)
      );
    if (placements.length === 0) {
      return null;
    }
    return {
      ...article,
      corpusKeys: [...new Set(placements.map((item) => item.corpusKey))],
      placements: placements.map(
        ({ collectionKey, corpusKey, isPrimary, position }) => ({
          collectionKey,
          corpusKey,
          isPrimary,
          position,
        })
      ),
      tags: await getArticleTagLabels(ctx, article._id),
    };
  },
});

export const listForAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const articles = await ctx.db
      .query("articles")
      .order("desc")
      .paginate({
        ...args.paginationOpts,
        numItems: Math.min(args.paginationOpts.numItems, 50),
      });
    return {
      ...articles,
      page: await Promise.all(
        articles.page.map(async (article) => ({
          _id: article._id,
          publishedAt: article.publishedAt,
          slug: article.slug,
          status: article.status,
          summary: article.summary,
          title: article.title,
          updatedAt: article.updatedAt,
          placements: await ctx.db
            .query("articlePlacements")
            .withIndex("by_article", (index) =>
              index.eq("articleId", article._id)
            )
            .collect(),
        }))
      ),
    };
  },
});

export const canManage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { authenticated: false, authorized: false };
    }
    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (index) => index.eq("userId", userId))
      .unique();
    return { authenticated: true, authorized: role?.role === "admin" };
  },
});

export const getForAdmin = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const article = await ctx.db.get(args.id);
    if (article === null) {
      return null;
    }
    const [placements, tags] = await Promise.all([
      ctx.db
        .query("articlePlacements")
        .withIndex("by_article", (index) => index.eq("articleId", article._id))
        .collect(),
      getArticleTagLabels(ctx, article._id),
    ]);
    return {
      ...article,
      placements: placements.map(
        ({ collectionKey, corpusKey, isPrimary, position }) => ({
          collectionKey,
          corpusKey,
          isPrimary,
          position,
        })
      ),
      tags,
    };
  },
});

export const save = mutation({
  args: {
    contentWarning: v.optional(v.string()),
    document: articleDocumentValidator,
    finding: v.optional(v.string()),
    id: v.optional(v.id("articles")),
    expectedVersion: v.optional(v.number()),
    placements: v.array(placementInputValidator),
    readingMinutes: v.number(),
    slug: v.string(),
    sources: v.array(sourceValidator),
    status: publicationStatusValidator,
    summary: v.string(),
    tags: v.array(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const document = parseArticleDocument(args.document);
    const now = Date.now();
    const { slug, sources, summary, tags, title } = cleanEditorialFields(args);
    await assertSlugAvailable(ctx, slug, args.id);
    const existing = await getExistingArticleForSave(
      ctx,
      args.id,
      args.expectedVersion
    );
    const publishedAt =
      args.status === "published" ? (existing?.publishedAt ?? now) : undefined;
    const value = {
      contentWarning: args.contentWarning?.trim() || undefined,
      document,
      finding: args.finding?.trim() || undefined,
      importKey: existing?.importKey ?? `editor:${slug}:${now}`,
      publishedAt,
      readingMinutes: args.readingMinutes,
      slug,
      sources,
      status: args.status,
      summary,
      title,
      updatedAt: now,
      version: (existing?.version ?? 0) + 1,
    };
    const articleId = existing
      ? (await ctx.db.patch(existing._id, value), existing._id)
      : await ctx.db.insert("articles", value);
    const article = await ctx.db.get(articleId);
    if (article === null) {
      throw new ConvexError("Could not read the saved article.");
    }
    await rebuildArticleRelations(ctx, article, args.placements, tags);
    return {
      id: articleId,
      slug,
      status: args.status,
      updatedAt: now,
      version: value.version,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const article = await ctx.db.get(args.id);
    if (article === null) {
      return { deleted: false };
    }
    await removeArticleRelations(ctx, article._id);
    await ctx.db.delete(article._id);
    return { deleted: true };
  },
});
