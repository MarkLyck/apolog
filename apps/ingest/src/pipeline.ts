import { createHash } from "node:crypto";

import { validateDemoContent } from "@apolog/shared";
import { contentFixtures } from "@apolog/shared/demo-content";

export function sourceHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createDryRunReport() {
  const validation = validateDemoContent(contentFixtures);
  return {
    counts: {
      articles: contentFixtures.articles.length,
      contradictions: contentFixtures.contradictions.length,
      corpora: contentFixtures.corpora.length,
      corpusLinks: contentFixtures.articles.reduce(
        (sum, article) => sum + article.corpusKeys.length,
        0
      ),
    },
    mode: "dry-run" as const,
    provenance: {
      adapter: "representative-fixtures",
      adapterVersion: "1.0.0",
      inputHash: sourceHash(JSON.stringify(contentFixtures)),
      promptVersion: "editorial-demo-v1",
    },
    valid: validation.success,
    warnings: [
      "Demo passage paraphrases must be replaced with verified licensed quotations before production publication.",
      "Source URLs are representative and require claim-level locator verification.",
    ],
  };
}
