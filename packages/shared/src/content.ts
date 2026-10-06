import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as Struct from "effect/Struct";

import { collectionKeys } from "./collection";
import { contradictionAssessmentSchema } from "./contradiction-assessment";

const requiredText = Schema.Trim.check(Schema.isMinLength(1));
const inlineText = Schema.String.check(Schema.isMinLength(1));
const timestamp = Schema.Number.check(
  Schema.isInt(),
  Schema.isGreaterThanOrEqualTo(0)
);
const corpusKeySchema = Schema.Literals(["bible", "quran"]);
function isUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

const inlineUrl = Schema.String.check(
  Schema.makeFilter(isUrl, { message: "Invalid URL" }),
  Schema.isPattern(/^(?:https?:\/\/|mailto:|tel:)/iu, {
    message: "Inline links must use HTTP, HTTPS, mailto, or tel",
  })
);
const httpUrl = Schema.Trim.check(
  Schema.makeFilter(isUrl, { message: "Invalid URL" }),
  Schema.isPattern(/^https?:\/\//iu, {
    message: "Source URL must use HTTP or HTTPS",
  })
);
const href = Schema.Union([
  inlineUrl,
  Schema.String.check(Schema.isPattern(/^\/(?!\/)/u)),
]).check(
  Schema.makeFilter(
    (value) =>
      [...value].every(
        (character) =>
          character >= " " && character !== "\u007F" && character !== "\\"
      ),
    {
      message:
        "Inline links must not contain control characters or backslashes",
    }
  )
);

export const articleSourceSchema = Schema.Struct({
  publisher: requiredText,
  title: requiredText,
  url: httpUrl,
}).mapFields(Struct.map(Schema.mutableKey));

export const inlineContentSchema = Schema.mutable(
  Schema.Array(
    Schema.Union([
      Schema.Struct({
        id: requiredText,
        marks: Schema.optional(
          Schema.mutable(
            Schema.Array(
              Schema.Literals(["bold", "italic", "strikethrough", "code"])
            )
          ).check(
            Schema.makeFilter((marks) => new Set(marks).size === marks.length, {
              message: "Inline marks must be unique",
            })
          )
        ),
        text: inlineText,
        type: Schema.Literal("text"),
      }).mapFields(Struct.map(Schema.mutableKey)),
      Schema.Struct({
        href,
        id: requiredText,
        text: inlineText,
        type: Schema.Literal("link"),
      }).mapFields(Struct.map(Schema.mutableKey)),
    ])
  )
).check(
  Schema.isMinLength(1),
  Schema.makeFilter(
    (nodes) => nodes.some((node) => node.text.trim().length > 0),
    { message: "Inline content must contain visible text" }
  ),
  Schema.makeFilter(
    (nodes) => new Set(nodes.map((node) => node.id)).size === nodes.length,
    { message: "Inline content IDs must be unique" }
  )
);

const listItemSchema = Schema.Struct({
  content: inlineContentSchema,
  id: requiredText,
}).mapFields(Struct.map(Schema.mutableKey));

const comparisonClaimSchema = Schema.Struct({
  content: inlineContentSchema,
  id: requiredText,
  label: requiredText,
  reference: requiredText,
}).mapFields(Struct.map(Schema.mutableKey));

export const contentBlockSchema = Schema.Union([
  Schema.Struct({
    content: inlineContentSchema,
    id: requiredText,
    type: Schema.Literal("paragraph"),
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({
    content: inlineContentSchema,
    id: requiredText,
    level: Schema.Literals([2, 3]),
    type: Schema.Literal("heading"),
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({
    content: inlineContentSchema,
    id: requiredText,
    title: requiredText,
    type: Schema.Literal("callout"),
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({
    content: inlineContentSchema,
    edition: requiredText,
    id: requiredText,
    reference: requiredText,
    type: Schema.Literal("quote"),
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({
    id: requiredText,
    items: Schema.mutable(Schema.Array(listItemSchema)).check(
      Schema.isMinLength(1),
      Schema.makeFilter(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
        { message: "List item IDs must be unique" }
      )
    ),
    type: Schema.Literal("list"),
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({
    claims: Schema.mutable(Schema.Array(comparisonClaimSchema)).check(
      Schema.isMinLength(2),
      Schema.makeFilter(
        (claims) =>
          new Set(claims.map((claim) => claim.id)).size === claims.length,
        { message: "Comparison claim IDs must be unique" }
      )
    ),
    id: requiredText,
    type: Schema.Literal("claimComparison"),
  }).mapFields(Struct.map(Schema.mutableKey)),
]);

export const articleDocumentSchema = Schema.Struct({
  blocks: Schema.mutable(Schema.Array(contentBlockSchema)).check(
    Schema.isMinLength(1),
    Schema.makeFilter(
      (blocks) =>
        new Set(blocks.map((block) => block.id)).size === blocks.length,
      { message: "Article content block IDs must be unique" }
    )
  ),
  schemaVersion: Schema.Literal(1),
}).mapFields(Struct.map(Schema.mutableKey));

const articlePlacementSchema = Schema.Struct({
  collectionKey: Schema.Literals(collectionKeys),
  corpusKey: corpusKeySchema,
  isPrimary: Schema.Boolean,
  position: Schema.Number.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(0)
  ),
}).mapFields(Struct.map(Schema.mutableKey));

const articlePlacementsSchema = Schema.mutable(
  Schema.Array(articlePlacementSchema)
).check(
  Schema.isMinLength(1),
  Schema.makeFilter(
    (placements) =>
      new Set(
        placements.map(
          (placement) => `${placement.corpusKey}:${placement.collectionKey}`
        )
      ).size === placements.length,
    { message: "Article placements must be unique" }
  ),
  Schema.makeFilter(
    (placements) =>
      [...new Set(placements.map((placement) => placement.corpusKey))].every(
        (corpusKey) =>
          placements.filter(
            (placement) =>
              placement.corpusKey === corpusKey && placement.isPrimary
          ).length === 1
      ),
    { message: "Each article corpus must have exactly one primary placement" }
  ),
  Schema.makeFilter(
    (placements) =>
      placements.every((placement) =>
        placement.collectionKey === "contradictions"
          ? placement.position > 0
          : placement.position === 0
      ),
    { message: "Only contradiction placements may have a ranked position" }
  )
);

export const articleContentSchema = Schema.Struct({
  contentWarning: Schema.optional(requiredText),
  document: articleDocumentSchema,
  finding: Schema.optional(requiredText),
  placements: articlePlacementsSchema,
  publishedAt: timestamp,
  readingMinutes: Schema.Number.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(1)
  ),
  slug: requiredText,
  sources: Schema.mutable(Schema.Array(articleSourceSchema)),
  summary: requiredText,
  tags: Schema.mutable(Schema.Array(requiredText)).check(
    Schema.makeFilter((tags) => new Set(tags).size === tags.length, {
      message: "Article tags must be unique",
    })
  ),
  title: requiredText,
  updatedAt: timestamp,
}).mapFields(Struct.map(Schema.mutableKey));

export const demoContentSchema = Schema.Struct({
  articles: Schema.mutable(Schema.Array(articleContentSchema)).check(
    Schema.makeFilter(
      (articles) =>
        new Set(articles.map((article) => article.slug)).size ===
        articles.length,
      { message: "Article slugs must be unique" }
    )
  ),
  corpora: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        description: requiredText,
        key: corpusKeySchema,
        name: requiredText,
      }).mapFields(Struct.map(Schema.mutableKey))
    )
  ),
}).mapFields(Struct.map(Schema.mutableKey));

export const articleListItemSchema = Schema.Struct({
  assessment: Schema.optional(contradictionAssessmentSchema),
  collectionKey: Schema.Literals(collectionKeys),
  comparisonReferences: Schema.mutable(Schema.Array(requiredText)),
  finding: Schema.optional(requiredText),
  id: requiredText,
  position: Schema.Number.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(0)
  ),
  publishedAt: timestamp,
  readingMinutes: Schema.Number.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(1)
  ),
  slug: requiredText,
  summary: requiredText,
  tags: Schema.mutable(Schema.Array(requiredText)),
  title: requiredText,
}).mapFields(Struct.map(Schema.mutableKey));

const articleListResponseSchema = Schema.Struct({
  results: Schema.mutable(Schema.Array(articleListItemSchema)),
}).mapFields(Struct.map(Schema.mutableKey));

export type InlineContent = typeof inlineContentSchema.Type;
export type ContentBlock = typeof contentBlockSchema.Type;
export type ArticleDocument = typeof articleDocumentSchema.Type;
export type ArticlePlacement = typeof articlePlacementSchema.Type;
export type ArticleSource = typeof articleSourceSchema.Type;
export type ArticleContent = typeof articleContentSchema.Type;
export type ArticleListItem = typeof articleListItemSchema.Type;
export type DemoContent = typeof demoContentSchema.Type;

export type ContentValidationResult = { success: boolean };

export function validateDemoContent(input: unknown): ContentValidationResult {
  return {
    success: Result.isSuccess(
      Schema.decodeUnknownResult(demoContentSchema)(input)
    ),
  };
}

export function parseArticleListResponse(
  input: unknown
): ArticleListItem[] | null {
  const parsed = Schema.decodeUnknownResult(articleListResponseSchema)(input);
  return Result.isSuccess(parsed) ? parsed.success.results : null;
}
