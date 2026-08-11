import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  articleDocumentValidator,
  articleSourceValidator,
  collectionKeyValidator as collectionKey,
  corpusKeyValidator as corpusKey,
  publicationStatusValidator as status,
  userRoleValidator as userRole,
} from "./validators";

export default defineSchema({
  ...authTables,

  userRoles: defineTable({
    role: userRole,
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  articles: defineTable({
    contentWarning: v.optional(v.string()),
    document: articleDocumentValidator,
    finding: v.optional(v.string()),
    importKey: v.string(),
    publishedAt: v.optional(v.number()),
    readingMinutes: v.number(),
    slug: v.string(),
    sources: v.array(articleSourceValidator),
    status,
    summary: v.string(),
    title: v.string(),
    updatedAt: v.number(),
    version: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_import_key", ["importKey"]),

  articlePlacements: defineTable({
    articleCreatedAt: v.number(),
    articleId: v.id("articles"),
    collectionKey,
    corpusKey,
    comparisonReferences: v.array(v.string()),
    isPrimary: v.boolean(),
    position: v.number(),
    publishedAt: v.optional(v.number()),
    status,
    tags: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_corpus_collection_status_created", [
      "corpusKey",
      "collectionKey",
      "status",
      "articleCreatedAt",
    ])
    .index("by_corpus_collection_status_position", [
      "corpusKey",
      "collectionKey",
      "status",
      "position",
    ])
    .index("by_article", ["articleId"])
    .index("by_article_placement", ["articleId", "corpusKey", "collectionKey"]),

  tags: defineTable({
    description: v.optional(v.string()),
    key: v.string(),
    label: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  articleTags: defineTable({
    articleId: v.id("articles"),
    tagId: v.id("tags"),
    tagKey: v.string(),
    tagLabel: v.string(),
    updatedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_tag_article", ["tagId", "articleId"]),

  corpora: defineTable({
    description: v.string(),
    enabled: v.boolean(),
    key: corpusKey,
    name: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

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
    collectionKey,
    comparisonReferences: v.array(v.string()),
    corpusKey,
    position: v.number(),
    searchText: v.string(),
    sourceCreatedAt: v.number(),
    status,
    summary: v.string(),
    tags: v.array(v.string()),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_article_placement", ["articleId", "corpusKey", "collectionKey"])
    .searchIndex("search_articles", {
      filterFields: ["corpusKey", "collectionKey", "status"],
      searchField: "searchText",
    }),
});
