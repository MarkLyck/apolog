import * as v from "valibot";

export const collectionKeys = [
  "debunked",
  "immoral",
  "evidence",
  "silly",
  "contradictions",
] as const;
export type CollectionKey = (typeof collectionKeys)[number];

export const collectionRegistry = {
  contradictions: {
    cardLabel: "Contradiction",
    description: "Structured claim-against-claim comparisons.",
    href: "/contradictions",
    label: "Contradictions",
  },
  debunked: {
    cardLabel: "Claim review",
    description: "Historical and factual claims tested against evidence.",
    href: "/debunked",
    label: "Debunked",
    page: {
      description:
        "Historical and factual claims examined with explicit findings: contradicted, unsupported, anachronistic, or physically implausible.",
      eyebrow: "Claims under review",
      title: "What would the evidence look like?",
    },
  },
  evidence: {
    cardLabel: "Evidence guide",
    description: "Guides to evidence, methods, uncertainty, and limitations.",
    href: "/evidence",
    label: "Evidence",
    page: {
      description:
        "Accessible guides to evidence, uncertainty, cross-checks, and limitations across science, history, and archaeology.",
      eyebrow: "Methods and findings",
      title: "Understand how we know.",
    },
  },
  immoral: {
    cardLabel: "Moral analysis",
    description: "Moral analysis using transparent ethical standards.",
    href: "/immoral",
    label: "Immoral",
    page: {
      description:
        "Moral analysis that distinguishes narration, command, approval, punishment, and attributed speech before applying a transparent ethical framework.",
      eyebrow: "Ethics in context",
      title: "Name the standard. Read the whole passage.",
    },
  },
  silly: {
    cardLabel: "Silly story",
    description: "Critical readings of strange and fanciful stories.",
    href: "/silly",
    label: "Silly",
    page: {
      description:
        "Talking animals, impossible logistics, strange miracles, and narrative turns that can be examined critically without mocking the people who believe them.",
      eyebrow: "The strange and silly",
      title: "Some stories are hard to read with a straight face.",
    },
  },
} as const satisfies Record<
  CollectionKey,
  {
    cardLabel: string;
    description: string;
    href: `/${CollectionKey}`;
    label: string;
    page?: { description: string; eyebrow: string; title: string };
  }
>;

export function parseCollection(
  value: string | null | undefined
): CollectionKey | null {
  return collectionKeys.find((key) => key === value) ?? null;
}

const requiredText = v.pipe(v.string(), v.trim(), v.minLength(1));
const inlineText = v.pipe(v.string(), v.minLength(1));
const timestamp = v.pipe(v.number(), v.integer(), v.minValue(0));
const corpusKeySchema = v.picklist(["bible", "quran"]);
const url = v.pipe(v.string(), v.url());
const httpUrl = v.pipe(
  v.string(),
  v.trim(),
  v.url(),
  v.regex(/^https?:\/\//iu, "Source URL must use HTTP or HTTPS")
);
const href = v.union([url, v.pipe(v.string(), v.regex(/^\/(?!\/)/u))]);

export const articleSourceSchema = v.object({
  publisher: requiredText,
  title: requiredText,
  url: httpUrl,
});

export const inlineContentSchema = v.pipe(
  v.array(
    v.variant("type", [
      v.object({
        id: requiredText,
        marks: v.optional(
          v.pipe(
            v.array(v.picklist(["bold", "italic", "strikethrough", "code"])),
            v.check(
              (marks) => new Set(marks).size === marks.length,
              "Inline marks must be unique"
            )
          )
        ),
        text: inlineText,
        type: v.literal("text"),
      }),
      v.object({
        href,
        id: requiredText,
        text: inlineText,
        type: v.literal("link"),
      }),
    ])
  ),
  v.minLength(1),
  v.check(
    (nodes) => nodes.some((node) => node.text.trim().length > 0),
    "Inline content must contain visible text"
  ),
  v.check(
    (nodes) => new Set(nodes.map((node) => node.id)).size === nodes.length,
    "Inline content IDs must be unique"
  )
);

const listItemSchema = v.object({
  content: inlineContentSchema,
  id: requiredText,
});

const comparisonClaimSchema = v.object({
  content: inlineContentSchema,
  id: requiredText,
  label: requiredText,
  reference: requiredText,
});

export const contentBlockSchema = v.variant("type", [
  v.object({
    content: inlineContentSchema,
    id: requiredText,
    type: v.literal("paragraph"),
  }),
  v.object({
    content: inlineContentSchema,
    id: requiredText,
    level: v.picklist([2, 3]),
    type: v.literal("heading"),
  }),
  v.object({
    content: inlineContentSchema,
    id: requiredText,
    title: requiredText,
    type: v.literal("callout"),
  }),
  v.object({
    content: inlineContentSchema,
    edition: requiredText,
    id: requiredText,
    reference: requiredText,
    type: v.literal("quote"),
  }),
  v.object({
    id: requiredText,
    items: v.pipe(
      v.array(listItemSchema),
      v.minLength(1),
      v.check(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
        "List item IDs must be unique"
      )
    ),
    type: v.literal("list"),
  }),
  v.object({
    claims: v.pipe(
      v.array(comparisonClaimSchema),
      v.minLength(2),
      v.check(
        (claims) =>
          new Set(claims.map((claim) => claim.id)).size === claims.length,
        "Comparison claim IDs must be unique"
      )
    ),
    id: requiredText,
    type: v.literal("claimComparison"),
  }),
]);

export const articleDocumentSchema = v.object({
  blocks: v.pipe(
    v.array(contentBlockSchema),
    v.minLength(1),
    v.check(
      (blocks) =>
        new Set(blocks.map((block) => block.id)).size === blocks.length,
      "Article content block IDs must be unique"
    )
  ),
  schemaVersion: v.literal(1),
});

const articlePlacementSchema = v.object({
  collectionKey: v.picklist(collectionKeys),
  corpusKey: corpusKeySchema,
  isPrimary: v.boolean(),
  position: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

const articlePlacementsSchema = v.pipe(
  v.array(articlePlacementSchema),
  v.minLength(1),
  v.check(
    (placements) =>
      new Set(
        placements.map(
          (placement) => `${placement.corpusKey}:${placement.collectionKey}`
        )
      ).size === placements.length,
    "Article placements must be unique"
  ),
  v.check(
    (placements) =>
      [...new Set(placements.map((placement) => placement.corpusKey))].every(
        (corpusKey) =>
          placements.filter(
            (placement) =>
              placement.corpusKey === corpusKey && placement.isPrimary
          ).length === 1
      ),
    "Each article corpus must have exactly one primary placement"
  ),
  v.check(
    (placements) =>
      placements.every((placement) =>
        placement.collectionKey === "contradictions"
          ? placement.position > 0
          : placement.position === 0
      ),
    "Only contradiction placements may have a ranked position"
  )
);

export const articleContentSchema = v.object({
  contentWarning: v.optional(requiredText),
  document: articleDocumentSchema,
  finding: v.optional(requiredText),
  placements: articlePlacementsSchema,
  publishedAt: timestamp,
  readingMinutes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  slug: requiredText,
  sources: v.array(articleSourceSchema),
  summary: requiredText,
  tags: v.pipe(
    v.array(requiredText),
    v.check(
      (tags) => new Set(tags).size === tags.length,
      "Article tags must be unique"
    )
  ),
  title: requiredText,
  updatedAt: timestamp,
});

export const demoContentSchema = v.object({
  articles: v.pipe(
    v.array(articleContentSchema),
    v.check(
      (articles) =>
        new Set(articles.map((article) => article.slug)).size ===
        articles.length,
      "Article slugs must be unique"
    )
  ),
  corpora: v.array(
    v.object({
      description: requiredText,
      key: corpusKeySchema,
      name: requiredText,
    })
  ),
});

export const articleListItemSchema = v.object({
  collectionKey: v.picklist(collectionKeys),
  comparisonReferences: v.array(requiredText),
  finding: v.optional(requiredText),
  id: requiredText,
  position: v.pipe(v.number(), v.integer(), v.minValue(0)),
  publishedAt: timestamp,
  readingMinutes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  slug: requiredText,
  summary: requiredText,
  tags: v.array(requiredText),
  title: requiredText,
});

const articleListResponseSchema = v.object({
  results: v.array(articleListItemSchema),
});

export type InlineContent = v.InferOutput<typeof inlineContentSchema>;
export type ContentBlock = v.InferOutput<typeof contentBlockSchema>;
export type ArticleDocument = v.InferOutput<typeof articleDocumentSchema>;
export type ArticlePlacement = v.InferOutput<typeof articlePlacementSchema>;
export type ArticleSource = v.InferOutput<typeof articleSourceSchema>;
export type ArticleContent = v.InferOutput<typeof articleContentSchema>;
export type ArticleListItem = v.InferOutput<typeof articleListItemSchema>;
export type DemoContent = v.InferOutput<typeof demoContentSchema>;

export function validateDemoContent(input: unknown): { success: boolean } {
  return { success: v.safeParse(demoContentSchema, input).success };
}

export function parseArticleListResponse(
  input: unknown
): ArticleListItem[] | null {
  const parsed = v.safeParse(articleListResponseSchema, input);
  return parsed.success ? parsed.output.results : null;
}
