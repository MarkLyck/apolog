import { describe, expect, test } from "bun:test";

import { getArticleCorpusRedirect } from "./article-visibility";

describe("article corpus visibility", () => {
  const bibleOnlyArticle = { corpusKeys: ["bible"] as const };

  test("keeps an article visible in its linked corpus", () => {
    expect(
      getArticleCorpusRedirect(bibleOnlyArticle, "bible", "silly")
    ).toBeNull();
  });

  test("returns a mismatched reader to the category list", () => {
    expect(getArticleCorpusRedirect(bibleOnlyArticle, "quran", "silly")).toBe(
      "/silly?text=quran"
    );
  });
});
