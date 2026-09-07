import { describe, expect, test } from "bun:test";

import type { ArticleListItem } from "@apolog/shared";
import { renderToStaticMarkup } from "react-dom/server";

import { mergeArticlePage } from "@/lib/article-pagination";

import { ContradictionCard } from "./contradiction-card";
import { ContradictionList } from "./contradiction-list";

const article = (position: number): ArticleListItem => ({
  collectionKey: "contradictions",
  comparisonReferences: ["Genesis 1:1", "Genesis 1:1", "Genesis 2:1"],
  id: `article-${position}`,
  position,
  publishedAt: 1,
  readingMinutes: 2,
  slug: `comparison-${position}`,
  summary: "Compare the accounts.",
  tags: [],
  title: `Comparison ${position}`,
});

describe("contradiction pagination", () => {
  test("appends beyond 24 while preserving order and advancing the cursor", () => {
    const first = {
      page: Array.from({ length: 24 }, (_, index) => article(index + 1)),
      continueCursor: "page-2",
      isDone: false,
    };
    const next = {
      page: [article(24), article(25), article(26)],
      continueCursor: "page-3",
      isDone: false,
    };
    const merged = mergeArticlePage(first, next);
    expect(merged.page.map((item) => item.position)).toEqual(
      Array.from({ length: 26 }, (_, index) => index + 1)
    );
    expect(merged.continueCursor).toBe("page-3");
    expect(merged.isDone).toBe(false);
    expect(first.page).toHaveLength(24);
    expect(next.page).toHaveLength(3);
  });

  test("preserves loaded cards when the final page is empty", () => {
    const merged = mergeArticlePage(
      { page: [article(1)], continueCursor: "next", isDone: false },
      { page: [], continueCursor: "end", isDone: true }
    );
    expect(merged).toEqual({
      page: [article(1)],
      continueCursor: "end",
      isDone: true,
    });
  });

  test("offers more comparisons when the server returns a continuation", () => {
    const html = renderToStaticMarkup(
      <ContradictionList
        corpusKey="quran"
        initialPage={{
          page: Array.from({ length: 24 }, (_, index) => article(index + 1)),
          continueCursor: "next",
          isDone: false,
        }}
      />
    );
    expect(html).toContain("24 ranked comparisons loaded");
    expect(html).toContain("Load more comparisons");
    expect(html).toContain("Ranked contradiction 24");
    expect(html).toContain("from=contradictions&amp;text=quran");
  });

  test("removes the load control when the server says the list is complete", () => {
    const html = renderToStaticMarkup(
      <ContradictionList
        corpusKey="bible"
        initialPage={{
          page: [article(1)],
          continueCursor: "end",
          isDone: true,
        }}
      />
    );
    expect(html).toContain("1 ranked comparison");
    expect(html).not.toContain("Load more comparisons");
    expect(html).not.toContain("comparisons loaded");
  });

  test("renders repeated passage references only once per card", () => {
    const html = renderToStaticMarkup(
      <ContradictionCard article={article(1)} corpusKey="bible" />
    );
    expect(html.match(/Genesis 1:1/gu)).toHaveLength(1);
    expect(html.match(/Genesis 2:1/gu)).toHaveLength(1);
  });
});
