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

export const articleTypeValidator = v.union(
  v.literal("debunked"),
  v.literal("immoral"),
  v.literal("evidence"),
  v.literal("silly")
);

export const contentBlockValidator = v.union(
  v.object({
    id: v.string(),
    type: v.literal("paragraph"),
    text: v.string(),
  }),
  v.object({
    id: v.string(),
    type: v.literal("heading"),
    text: v.string(),
  }),
  v.object({
    id: v.string(),
    type: v.literal("callout"),
    title: v.string(),
    text: v.string(),
  }),
  v.object({
    id: v.string(),
    type: v.literal("quote"),
    reference: v.string(),
    edition: v.string(),
    text: v.string(),
  }),
  v.object({
    id: v.string(),
    type: v.literal("list"),
    items: v.array(v.string()),
  })
);

export const mapCertaintyValidator = v.union(
  v.literal("traditional"),
  v.literal("probable"),
  v.literal("disputed")
);
