import { describe, expect, test } from "bun:test";

import type { DemoContent } from "./content";
import { validateDemoContent } from "./content";
import { contentFixtures } from "./demo-content";

function first<T>(items: T[]): T {
  const item = items[0];
  if (!item) {
    throw new Error("Expected fixture data");
  }
  return item;
}

describe("representative content fixtures", () => {
  test("cover both corpora and every public content category", () => {
    expect(validateDemoContent(contentFixtures)).toEqual({ success: true });
    expect(new Set(contentFixtures.articles.map((item) => item.type))).toEqual(
      new Set(["debunked", "immoral", "evidence", "silly"])
    );
    expect(new Set(contentFixtures.corpora.map((item) => item.key))).toEqual(
      new Set(["bible", "quran"])
    );
  });

  test("includes a silly article for each corpus", () => {
    const coveredCorpora = contentFixtures.articles
      .filter((item) => item.type === "silly")
      .flatMap((item) => item.corpusKeys);
    expect(new Set(coveredCorpora)).toEqual(new Set(["bible", "quran"]));
  });

  test("never publishes an article without an explicit corpus link", () => {
    expect(
      contentFixtures.articles.every((item) => item.corpusKeys.length > 0)
    ).toBe(true);
  });

  test.each([
    [
      "unknown content blocks",
      (value: DemoContent) => {
        first(value.articles).blocks[0] = { type: "video", url: 42 } as never;
      },
    ],
    [
      "invalid source URLs",
      (value: DemoContent) => {
        first(first(value.articles).sources).url = "not-a-url";
      },
    ],
    [
      "duplicate block IDs",
      (value: DemoContent) => {
        const blocks = first(value.articles).blocks;
        const firstBlock = first(blocks);
        const secondBlock = blocks[1];
        if (!secondBlock) {
          throw new Error("Expected a second content block");
        }
        secondBlock.id = firstBlock.id;
      },
    ],
    [
      "malformed contradictions",
      (value: DemoContent) => {
        first(value.contradictions).claims = [null] as never;
      },
    ],
  ])("rejects %s at the content boundary", (_label, corrupt) => {
    const input = structuredClone(contentFixtures);
    corrupt(input);
    expect(validateDemoContent(input).success).toBe(false);
  });
});
