import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  articleTypeValidator as articleType,
  contentBlockValidator,
  corpusKeyValidator as corpusKey,
  mapCertaintyValidator,
  publicationStatusValidator as status,
  userRoleValidator as userRole,
} from "./validators";

export default defineSchema({
  ...authTables,

  userRoles: defineTable({
    role: userRole,
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  articleCorpora: defineTable({
    articleCreatedAt: v.number(),
    articleId: v.id("articles"),
    articleType,
    corpusKey,
    publishedAt: v.optional(v.number()),
    status,
    updatedAt: v.number(),
  })
    .index("by_corpus_type_status_created", [
      "corpusKey",
      "articleType",
      "status",
      "articleCreatedAt",
    ])
    .index("by_article_corpus", ["articleId", "corpusKey"]),

  articles: defineTable({
    blocks: v.array(contentBlockValidator),
    contentWarning: v.optional(v.string()),
    finding: v.optional(v.string()),
    importKey: v.string(),
    publishedAt: v.optional(v.number()),
    readingMinutes: v.number(),
    slug: v.string(),
    sources: v.array(
      v.object({ title: v.string(), publisher: v.string(), url: v.string() })
    ),
    status,
    summary: v.string(),
    tags: v.array(v.string()),
    title: v.string(),
    type: articleType,
    updatedAt: v.number(),
    version: v.number(),
  })
    .index("by_type_slug", ["type", "slug"])
    .index("by_import_key", ["importKey"]),

  contradictions: defineTable({
    claims: v.array(
      v.object({ label: v.string(), reference: v.string(), text: v.string() })
    ),
    corpusKey,
    importKey: v.string(),
    rank: v.number(),
    response: v.string(),
    searchText: v.string(),
    slug: v.string(),
    sources: v.array(v.object({ title: v.string(), url: v.string() })),
    status,
    summary: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_corpus_status_rank", ["corpusKey", "status", "rank"])
    .index("by_import_key", ["importKey"])
    .index("by_slug", ["slug"])
    .searchIndex("search_contradictions", {
      filterFields: ["corpusKey", "status"],
      searchField: "searchText",
    }),

  corpora: defineTable({
    description: v.string(),
    enabled: v.boolean(),
    key: corpusKey,
    name: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  mapEntries: defineTable({
    certainty: mapCertaintyValidator,
    comparison: v.string(),
    importKey: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    period: v.string(),
    slug: v.string(),
    status,
    summary: v.string(),
    title: v.string(),
    type: v.string(),
    updatedAt: v.number(),
    version: v.number(),
  })
    .index("by_import_key", ["importKey"])
    .index("by_slug", ["slug"]),

  mapEntryCorpora: defineTable({
    corpusKey,
    mapEntryId: v.id("mapEntries"),
    status,
    type: v.string(),
    updatedAt: v.number(),
  })
    .index("by_corpus_status", ["corpusKey", "status"])
    .index("by_entry_corpus", ["mapEntryId", "corpusKey"]),

  rateLimits: defineTable({
    count: v.number(),
    expiresAt: v.number(),
    key: v.string(),
    updatedAt: v.number(),
    windowStartedAt: v.number(),
  })
    .index("by_expires_at", ["expiresAt"])
    .index("by_key", ["key"]),

  searchDocuments: defineTable({
    articleId: v.id("articles"),
    contentType: articleType,
    corpusKey,
    searchText: v.string(),
    sourceCreatedAt: v.number(),
    status,
    summary: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_article_corpus", ["articleId", "corpusKey"])
    .searchIndex("search_articles", {
      filterFields: ["corpusKey", "contentType", "status"],
      searchField: "searchText",
    }),
});
