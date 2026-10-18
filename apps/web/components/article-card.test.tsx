import { describe, expect, test } from "bun:test";

import {
  articleWordCount,
  estimateReadingMinutes,
} from "@apolog/shared/article-text";
import { contentFixtures } from "@apolog/shared/demo-content";
import { renderToStaticMarkup } from "react-dom/server";

import { ArticleCard } from "./article-card";

describe("ArticleCard", () => {
  test("renders useful context and preserves the active corpus in its link", () => {
    const article = contentFixtures.articles[0];
    if (!article) {
      throw new Error("Fixture missing");
    }
    const html = renderToStaticMarkup(
      <ArticleCard
        article={{
          collectionKey: "debunked",
          comparisonReferences: [],
          finding: article.finding,
          id: "article-id",
          position: 0,
          publishedAt: article.publishedAt,
          readingMinutes: estimateReadingMinutes(
            articleWordCount(article.document.blocks)
          ),
          slug: article.slug,
          summary: article.summary,
          tags: article.tags,
          title: article.title,
        }}
        corpusKey="quran"
      />
    );
    expect(html).toContain(article.title);
    expect(html).not.toContain("aria-label");
    expect(html).toContain("1 min read");
    expect(html).toContain(
      "/articles/global-flood-evidence?from=debunked&amp;text=quran"
    );
  });
});
