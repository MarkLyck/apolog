import { describe, expect, test } from "bun:test";

import { rankRelatedArticles } from "./related-articles";

const candidate = (slug: string, publishedAt: number, tags: string[] = []) => ({
  publishedAt,
  slug,
  tags,
});
const slugs = (articles: readonly { slug: string }[]) =>
  articles.map((article) => article.slug);

describe("related article ranking", () => {
  const current = { slug: "flood", tags: ["Flood", "Geology"] };

  test("orders the collection by shared tags, then newest first, and never returns the current article", () => {
    const ranked = rankRelatedArticles(
      current,
      [
        candidate("flood", 9, ["Flood", "Geology"]),
        candidate("old-geology", 1, ["geology", "flood"]),
        candidate("new-unrelated", 8, ["Ethics"]),
        candidate("newer-one-tag", 5, ["Flood"]),
        candidate("older-one-tag", 2, ["Geology"]),
      ],
      []
    );
    expect(slugs(ranked)).toEqual([
      "old-geology",
      "newer-one-tag",
      "older-one-tag",
    ]);
  });

  test("fills remaining slots with topic matches in their given order, without repeats", () => {
    const ranked = rankRelatedArticles(
      current,
      [candidate("dating", 1, ["Geology"])],
      [
        candidate("flood", 9),
        candidate("dating", 1, ["Geology"]),
        candidate("noah", 2),
        candidate("ark", 7),
        candidate("rainbow", 8),
      ]
    );
    expect(slugs(ranked)).toEqual(["dating", "noah", "ark"]);
  });
});
