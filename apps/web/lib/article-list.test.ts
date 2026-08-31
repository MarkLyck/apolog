import { describe, expect, test } from "bun:test";

import {
  ARTICLE_LIST_PAGE_SIZE,
  browseListStatus,
  parseArticleListBrowseSort,
  searchListStatus,
  searchReachedCap,
} from "./article-list";

const noun = {
  plural: "ranked comparisons",
  singular: "ranked comparison",
};

describe("article list pagination copy", () => {
  test("parses only browse sorts", () => {
    expect(parseArticleListBrowseSort("ranked")).toBe("ranked");
    expect(parseArticleListBrowseSort("newest")).toBe("newest");
    expect(parseArticleListBrowseSort("oldest")).toBe("oldest");
    expect(parseArticleListBrowseSort("relevance")).toBeNull();
  });

  test("says showing while more pages remain", () => {
    expect(
      browseListStatus({ isDone: false, noun, shown: ARTICLE_LIST_PAGE_SIZE })
    ).toBe("Showing 24 ranked comparisons");
  });

  test("drops showing once the last page is loaded", () => {
    expect(browseListStatus({ isDone: true, noun, shown: 562 })).toBe(
      "562 ranked comparisons"
    );
    expect(browseListStatus({ isDone: true, noun, shown: 1 })).toBe(
      "1 ranked comparison"
    );
  });

  test("keeps search results bounded and asks for a narrower query at the cap", () => {
    expect(
      searchListStatus({ noun, query: "heaven", shown: ARTICLE_LIST_PAGE_SIZE })
    ).toBe("24 ranked comparisons for “heaven”");
    expect(searchReachedCap(ARTICLE_LIST_PAGE_SIZE)).toBe(true);
    expect(searchReachedCap(ARTICLE_LIST_PAGE_SIZE - 1)).toBe(false);
  });
});
