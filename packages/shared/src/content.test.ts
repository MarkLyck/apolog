import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import type { DemoContent } from "./content";
import { inlineContentSchema, validateDemoContent } from "./content";
import { contentFixtures } from "./demo-content";

function first<T>(items: T[]): T {
  const item = items[0];
  if (!item) {
    throw new Error("Expected fixture data");
  }
  return item;
}

describe("representative content fixtures", () => {
  test("covers both corpora and every public collection", () => {
    expect(validateDemoContent(contentFixtures)).toEqual({ success: true });
    expect(
      new Set(
        contentFixtures.articles.flatMap((article) =>
          article.placements.map((placement) => placement.collectionKey)
        )
      )
    ).toEqual(
      new Set(["debunked", "immoral", "evidence", "silly", "contradictions"])
    );
    expect(new Set(contentFixtures.corpora.map((item) => item.key))).toEqual(
      new Set(["bible", "quran"])
    );
  });

  test("allows one article to appear in multiple collections", () => {
    expect(
      contentFixtures.articles.some(
        (article) =>
          new Set(
            article.placements.map((placement) => placement.collectionKey)
          ).size > 1
      )
    ).toBe(true);
  });

  test("models contradictions as articles with comparison blocks", () => {
    const contradictions = contentFixtures.articles.filter((article) =>
      article.placements.some(
        (placement) => placement.collectionKey === "contradictions"
      )
    );
    expect(contradictions.length).toBeGreaterThan(0);
    expect(
      contradictions.every((article) =>
        article.document.blocks.some(
          (block) => block.type === "claimComparison"
        )
      )
    ).toBe(true);
  });

  test("preserves whitespace between rich text nodes", () => {
    const content = v.parse(inlineContentSchema, [
      { id: "hello", text: "hello ", type: "text" },
      { id: "world", marks: ["bold"], text: "world", type: "text" },
    ]);
    expect(content.map((node) => node.text).join("")).toBe("hello world");
  });

  test.each([
    [
      "unknown content blocks",
      (value: DemoContent) => {
        // SAFETY: This fixture deliberately violates the block union to test boundary rejection.
        first(value.articles).document.blocks[0] = {
          type: "video",
          url: 42,
        } as never;
      },
    ],
    [
      "invalid source URLs",
      (value: DemoContent) => {
        first(first(value.articles).sources).url = "not-a-url";
      },
    ],
    [
      "non-HTTP source URLs",
      (value: DemoContent) => {
        first(first(value.articles).sources).url = "ftp://example.com/source";
      },
    ],
    [
      "duplicate block IDs",
      (value: DemoContent) => {
        const blocks = first(value.articles).document.blocks;
        const secondBlock = blocks[1];
        if (!secondBlock) {
          throw new Error("Expected a second content block");
        }
        secondBlock.id = first(blocks).id;
      },
    ],
    [
      "duplicate placements",
      (value: DemoContent) => {
        const placements = first(value.articles).placements;
        placements.push(first(placements));
      },
    ],
    [
      "multiple primary placements for one corpus",
      (value: DemoContent) => {
        const article = value.articles.find(
          (item) =>
            new Set(item.placements.map((placement) => placement.collectionKey))
              .size > 1
        );
        if (!article) {
          throw new Error("Expected a multi-collection fixture");
        }
        const secondaryPlacement = article.placements[1];
        if (!secondaryPlacement) {
          throw new Error("Expected a secondary placement");
        }
        secondaryPlacement.isPrimary = true;
      },
    ],
    [
      "malformed comparisons",
      (value: DemoContent) => {
        const article = value.articles.find((item) =>
          item.placements.some(
            (placement) => placement.collectionKey === "contradictions"
          )
        );
        const comparison = article?.document.blocks.find(
          (block) => block.type === "claimComparison"
        );
        if (comparison?.type !== "claimComparison") {
          throw new Error("Expected comparison fixture");
        }
        // SAFETY: This fixture deliberately violates the claim schema to test boundary rejection.
        comparison.claims = [null] as never;
      },
    ],
  ])("rejects %s at the content boundary", (_label, corrupt) => {
    const input: DemoContent = structuredClone(contentFixtures);
    corrupt(input);
    expect(validateDemoContent(input).success).toBe(false);
  });
});
