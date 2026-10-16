import type { ArticleDocument } from "@apolog/shared";
import { blockText } from "@apolog/shared/article-text";

export function articleTagKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

export function projectArticle({
  document,
  summary,
  tags,
  title,
}: {
  document: ArticleDocument;
  summary: string;
  tags: string[];
  title: string;
}) {
  return {
    comparisonReferences: [
      ...new Set(
        document.blocks.flatMap((block, index) =>
          block.type === "claimComparison"
            ? block.claims.map((claim) => claim.reference)
            : block.type === "quote" &&
                document.blocks[index - 1]?.type !== "quote"
              ? [block.reference]
              : []
        )
      ),
    ],
    searchText: [
      title,
      summary,
      tags.join(" "),
      document.blocks.flatMap(blockText).join(" "),
    ]
      .join(" ")
      .toLowerCase(),
    tagKeys: tags.map((label) => ({ key: articleTagKey(label), label })),
  };
}
