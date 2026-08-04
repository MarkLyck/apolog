import { describe, expect, test } from "bun:test";

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
      <ArticleCard article={article} corpusKey="quran" />
    );
    expect(html).toContain(article.title);
    expect(html).toContain("8 min read");
    expect(html).toContain("/debunked/global-flood-evidence?text=quran");
  });
});
