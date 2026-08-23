import { describe, expect, test } from "bun:test";

import { validateDemoContent } from "./content";
import {
  buildSabContradictionArticle,
  parseSabContradictionCatalog,
  sabArticleSlug,
} from "./sab-contradictions";

const sample = parseSabContradictionCatalog([
  {
    book: "Genesis",
    claims: [
      { label: "In the beginning.", references: ["Genesis 1:1"] },
      {
        label: "On the second day of creation.",
        references: ["Genesis 1:6-8"],
      },
    ],
    firstReference: "Genesis 1:1",
    path: "/contra/heaven.html",
    position: 1,
    title: "When was heaven created?",
    url: "https://www.skepticsannotatedbible.com/contra/heaven.html",
  },
]);

describe("SAB contradiction articles", () => {
  test("builds a valid ranked Bible contradiction article", () => {
    const entry = sample[0];
    if (!entry) {
      throw new Error("Expected a catalog entry");
    }
    const article = buildSabContradictionArticle(entry);
    expect(sabArticleSlug("/contra/who_created.html")).toBe("sab-who-created");
    expect(article.slug).toBe("sab-heaven");
    expect(article.placements).toEqual([
      {
        collectionKey: "contradictions",
        corpusKey: "bible",
        isPrimary: true,
        position: 1,
      },
    ]);
    expect(article.document.blocks[0]).toMatchObject({
      type: "claimComparison",
    });
    expect(
      validateDemoContent({
        articles: [article],
        corpora: [{ description: "Bible", key: "bible", name: "Bible" }],
      })
    ).toEqual({ success: true });
  });
});
