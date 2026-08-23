import * as v from "valibot";

import type { ArticleContent, InlineContent } from "./content";
import { articleContentSchema } from "./content";

const publishedAt = Date.UTC(2026, 7, 23);

const sabClaimSchema = v.object({
  label: v.pipe(v.string(), v.trim(), v.minLength(1)),
  references: v.pipe(
    v.array(v.pipe(v.string(), v.trim(), v.minLength(1))),
    v.minLength(1)
  ),
});

export const sabContradictionEntrySchema = v.object({
  book: v.pipe(v.string(), v.trim(), v.minLength(1)),
  claims: v.pipe(v.array(sabClaimSchema), v.minLength(2)),
  firstReference: v.pipe(v.string(), v.trim(), v.minLength(1)),
  path: v.pipe(v.string(), v.trim(), v.minLength(1)),
  position: v.pipe(v.number(), v.integer(), v.minValue(1)),
  title: v.pipe(v.string(), v.trim(), v.minLength(1)),
  url: v.pipe(v.string(), v.url()),
});

export const sabContradictionCatalogSchema = v.pipe(
  v.array(sabContradictionEntrySchema),
  v.check(
    (entries) =>
      new Set(entries.map((entry) => entry.path)).size === entries.length,
    "SAB contradiction paths must be unique"
  ),
  v.check(
    (entries) =>
      new Set(entries.map((entry) => entry.position)).size === entries.length,
    "SAB contradiction positions must be unique"
  )
);

export type SabContradictionClaim = v.InferOutput<typeof sabClaimSchema>;
export type SabContradictionEntry = v.InferOutput<
  typeof sabContradictionEntrySchema
>;

const sensitiveTitle =
  /\b(?:adulter|homosexual|menstruat|sex|eunuch|castrat|raped|ripped apart|human sacrifice|whoredom)\b/iu;

function text(id: string, value: string): InlineContent {
  return [{ id, text: value, type: "text" }];
}

function sabPathStem(path: string): string {
  const file = path.split("/").at(-1) ?? path;
  return file.replace(/\.html$/u, "");
}

export function sabArticleSlug(path: string): string {
  return `sab-${sabPathStem(path)
    .replaceAll("_", "-")
    .replaceAll(/[^a-z0-9-]+/giu, "-")
    .replaceAll(/-+/gu, "-")
    .replaceAll(/^-|-$/gu, "")
    .toLowerCase()}`;
}

function claimCopy(label: string, references: string[]): string {
  const cited =
    references.length === 1
      ? references[0]
      : `${references.slice(0, -1).join(", ")}, and ${references.at(-1)}`;
  return `${label} Cited passage${references.length === 1 ? "" : "s"}: ${cited}.`;
}

export function buildSabContradictionArticle(
  entry: SabContradictionEntry
): ArticleContent {
  const slug = sabArticleSlug(entry.path);
  const claims = entry.claims.map((claim, index) => ({
    content: text(
      `${slug}-claim-${index}-text`,
      claimCopy(claim.label, claim.references)
    ),
    id: `${slug}-claim-${index}`,
    label: claim.label,
    reference: claim.references[0] ?? entry.firstReference,
  }));
  const summary = `SAB groups ${entry.claims.length} conflicting answers to “${entry.title}”, beginning at ${entry.firstReference}.`;
  const tags = ["contradiction", entry.book];
  const article: ArticleContent = {
    document: {
      blocks: [
        {
          claims,
          id: `${slug}-comparison`,
          type: "claimComparison",
        },
        {
          content: text(
            `${slug}-note-text`,
            "This comparison catalogs the passage groups the Skeptic's Annotated Bible places in conflict for this question. Claim labels name each grouped answer; the wording is Apolog's catalog of those groups, not a republication of SAB commentary."
          ),
          id: `${slug}-note`,
          type: "paragraph",
        },
      ],
      schemaVersion: 1,
    },
    finding: "contradicted",
    placements: [
      {
        collectionKey: "contradictions",
        corpusKey: "bible",
        isPrimary: true,
        position: entry.position,
      },
    ],
    publishedAt,
    readingMinutes: Math.min(8, Math.max(2, entry.claims.length)),
    slug,
    sources: [
      {
        publisher: "The Skeptic's Annotated Bible",
        title: entry.title,
        url: entry.url,
      },
    ],
    summary,
    tags,
    title: entry.title,
    updatedAt: publishedAt,
  };
  if (sensitiveTitle.test(entry.title)) {
    article.contentWarning =
      "Discussion of sexual ethics, violence, or bodily punishment.";
  }
  return v.parse(articleContentSchema, article);
}

export function parseSabContradictionCatalog(
  input: v.InferInput<typeof sabContradictionCatalogSchema>
): SabContradictionEntry[] {
  return v.parse(sabContradictionCatalogSchema, input);
}

export function buildSabContradictionArticles(
  catalog: readonly SabContradictionEntry[]
): ArticleContent[] {
  return catalog.map((entry) => buildSabContradictionArticle(entry));
}
