import { v } from "convex/values";

export const corpusKeyValidator = v.union(
  v.literal("bible"),
  v.literal("quran")
);

export const publicationStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

export const userRoleValidator = v.union(v.literal("user"), v.literal("admin"));

export const collectionKeyValidator = v.union(
  v.literal("debunked"),
  v.literal("immoral"),
  v.literal("evidence"),
  v.literal("silly"),
  v.literal("contradictions")
);

export const inlineContentValidator = v.array(
  v.union(
    v.object({
      id: v.string(),
      marks: v.optional(
        v.array(
          v.union(
            v.literal("bold"),
            v.literal("italic"),
            v.literal("strikethrough"),
            v.literal("code")
          )
        )
      ),
      text: v.string(),
      type: v.literal("text"),
    }),
    v.object({
      href: v.string(),
      id: v.string(),
      text: v.string(),
      type: v.literal("link"),
    })
  )
);

export const contentBlockValidator = v.union(
  v.object({
    content: inlineContentValidator,
    id: v.string(),
    type: v.literal("paragraph"),
  }),
  v.object({
    content: inlineContentValidator,
    id: v.string(),
    level: v.union(v.literal(2), v.literal(3)),
    type: v.literal("heading"),
  }),
  v.object({
    content: inlineContentValidator,
    id: v.string(),
    title: v.string(),
    type: v.literal("callout"),
  }),
  v.object({
    content: inlineContentValidator,
    edition: v.string(),
    id: v.string(),
    reference: v.string(),
    type: v.literal("quote"),
  }),
  v.object({
    id: v.string(),
    items: v.array(
      v.object({ content: inlineContentValidator, id: v.string() })
    ),
    type: v.literal("list"),
  }),
  v.object({
    claims: v.array(
      v.object({
        content: inlineContentValidator,
        id: v.string(),
        label: v.string(),
        reference: v.string(),
      })
    ),
    id: v.string(),
    type: v.literal("claimComparison"),
  })
);

export const articleDocumentValidator = v.object({
  blocks: v.array(contentBlockValidator),
  schemaVersion: v.literal(1),
});
