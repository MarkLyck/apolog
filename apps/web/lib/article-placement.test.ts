import { describe, expect, test } from "bun:test";

import { resolveArticlePlacement } from "./article-placement";

const placements = [
  {
    collectionKey: "evidence" as const,
    corpusKey: "bible" as const,
    isPrimary: true,
    position: 0,
  },
  {
    collectionKey: "debunked" as const,
    corpusKey: "bible" as const,
    isPrimary: false,
    position: 0,
  },
];

describe("article placement resolution", () => {
  test("preserves a valid originating collection", () => {
    expect(resolveArticlePlacement(placements, "bible", "debunked")).toEqual({
      placement: {
        collectionKey: "debunked",
        corpusKey: "bible",
        isPrimary: false,
        position: 0,
      },
      redirect: null,
    });
  });

  test("uses the explicit primary placement without collection context", () => {
    expect(resolveArticlePlacement(placements, "bible", null)).toEqual({
      placement: {
        collectionKey: "evidence",
        corpusKey: "bible",
        isPrimary: true,
        position: 0,
      },
      redirect: null,
    });
  });

  test("redirects a corpus mismatch through the article's collection", () => {
    expect(resolveArticlePlacement(placements, "quran", "debunked")).toEqual({
      placement: null,
      redirect: "/debunked?text=quran",
    });
  });

  test("redirects to the Bible without naming it in the URL", () => {
    const quranPlacements = placements.map((placement) => ({
      ...placement,
      corpusKey: "quran" as const,
    }));
    expect(resolveArticlePlacement(quranPlacements, "bible", null)).toEqual({
      placement: null,
      redirect: "/evidence",
    });
  });
});
