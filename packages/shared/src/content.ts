import * as v from "valibot";

import type { CorpusKey } from "./corpus";

export const articleTypes = [
  "debunked",
  "immoral",
  "evidence",
  "silly",
] as const;
export type ArticleType = (typeof articleTypes)[number];

const requiredText = v.pipe(v.string(), v.trim(), v.minLength(1));
const timestamp = v.pipe(v.number(), v.integer(), v.minValue(0));
const corpusKeySchema = v.picklist(["bible", "quran"]);
const url = v.pipe(v.string(), v.url());

export const contentBlockSchema = v.variant("type", [
  v.object({
    id: requiredText,
    type: v.literal("paragraph"),
    text: requiredText,
  }),
  v.object({
    id: requiredText,
    type: v.literal("heading"),
    text: requiredText,
  }),
  v.object({
    id: requiredText,
    type: v.literal("callout"),
    title: requiredText,
    text: requiredText,
  }),
  v.object({
    id: requiredText,
    type: v.literal("quote"),
    reference: requiredText,
    edition: requiredText,
    text: requiredText,
  }),
  v.object({
    id: requiredText,
    type: v.literal("list"),
    items: v.pipe(v.array(requiredText), v.minLength(1)),
  }),
]);

export const articleContentSchema = v.object({
  slug: requiredText,
  type: v.picklist(articleTypes),
  title: requiredText,
  summary: requiredText,
  finding: v.optional(requiredText),
  tags: v.array(requiredText),
  corpusKeys: v.pipe(v.array(corpusKeySchema), v.minLength(1)),
  publishedAt: timestamp,
  updatedAt: timestamp,
  readingMinutes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  contentWarning: v.optional(requiredText),
  blocks: v.pipe(
    v.array(contentBlockSchema),
    v.minLength(1),
    v.check(
      (blocks) =>
        new Set(blocks.map((block) => block.id)).size === blocks.length,
      "Article content block IDs must be unique"
    )
  ),
  sources: v.array(
    v.object({ title: requiredText, publisher: requiredText, url })
  ),
});

export const contradictionContentSchema = v.object({
  slug: requiredText,
  corpusKey: corpusKeySchema,
  rank: v.pipe(v.number(), v.integer(), v.minValue(1)),
  title: requiredText,
  summary: requiredText,
  claims: v.pipe(
    v.array(
      v.object({
        label: requiredText,
        reference: requiredText,
        text: requiredText,
      })
    ),
    v.minLength(2)
  ),
  response: requiredText,
  sources: v.array(v.object({ title: requiredText, url })),
  updatedAt: timestamp,
});

export const mapEntryContentSchema = v.object({
  slug: requiredText,
  title: requiredText,
  summary: requiredText,
  corpusKeys: v.pipe(v.array(corpusKeySchema), v.minLength(1)),
  type: requiredText,
  period: requiredText,
  certainty: v.picklist(["traditional", "probable", "disputed"]),
  longitude: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
  latitude: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
  comparison: requiredText,
  updatedAt: timestamp,
});

export const demoContentSchema = v.object({
  corpora: v.array(
    v.object({
      key: corpusKeySchema,
      name: requiredText,
      description: requiredText,
    })
  ),
  articles: v.array(articleContentSchema),
  contradictions: v.array(contradictionContentSchema),
  mapEntries: v.array(mapEntryContentSchema),
});

export const articleSearchResultSchema = v.object({
  finding: v.optional(requiredText),
  id: requiredText,
  publishedAt: timestamp,
  readingMinutes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  slug: requiredText,
  summary: requiredText,
  tags: v.array(requiredText),
  title: requiredText,
  type: v.picklist(articleTypes),
});

const articleSearchResponseSchema = v.object({
  results: v.array(articleSearchResultSchema),
});

export type ContentBlock = v.InferOutput<typeof contentBlockSchema>;
export type ArticleContent = v.InferOutput<typeof articleContentSchema>;
export type ArticleSearchResult = v.InferOutput<
  typeof articleSearchResultSchema
>;
export type ContradictionContent = v.InferOutput<
  typeof contradictionContentSchema
>;
export type MapEntryContent = v.InferOutput<typeof mapEntryContentSchema>;
export interface DemoContent {
  corpora: { key: CorpusKey; name: string; description: string }[];
  articles: ArticleContent[];
  contradictions: ContradictionContent[];
  mapEntries: MapEntryContent[];
}

export function validateDemoContent(input: unknown): { success: boolean } {
  return { success: v.safeParse(demoContentSchema, input).success };
}

export function parseArticleSearchResponse(
  input: unknown
): ArticleSearchResult[] | null {
  const parsed = v.safeParse(articleSearchResponseSchema, input);
  return parsed.success ? parsed.output.results : null;
}
