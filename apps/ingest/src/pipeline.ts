import { createHash } from "node:crypto";

import { validateDemoContent } from "@apolog/shared";
import { contentFixtures } from "@apolog/shared/demo-content";
import { sabContradictionCatalog } from "@apolog/shared/sab-contradiction-catalog";
import { buildSabContradictionArticles } from "@apolog/shared/sab-contradictions";

export function sourceHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createDryRunReport() {
  const sabArticles = buildSabContradictionArticles(sabContradictionCatalog);
  const validation = validateDemoContent({
    articles: [...contentFixtures.articles, ...sabArticles],
    corpora: contentFixtures.corpora,
  });
  return {
    counts: {
      articles: contentFixtures.articles.length + sabArticles.length,
      corpora: contentFixtures.corpora.length,
      placements:
        contentFixtures.articles.reduce(
          (sum, article) => sum + article.placements.length,
          0
        ) + sabArticles.length,
      sabContradictions: sabArticles.length,
    },
    mode: "dry-run" as const,
    provenance: {
      adapter: "representative-fixtures+sab-first-occurrence",
      adapterVersion: "1.1.0",
      inputHash: sourceHash(
        JSON.stringify({
          fixtures: contentFixtures,
          sab: sabContradictionCatalog,
        })
      ),
      promptVersion: "editorial-demo-v1",
    },
    valid: validation.success,
    warnings: [
      "Demo passage paraphrases must be replaced with verified licensed quotations before production publication.",
      "Source URLs are representative and require claim-level locator verification.",
      "SAB imports store titles, verse locators, and Apolog catalog copy. They do not republish SAB commentary or verse excerpts.",
    ],
  };
}
