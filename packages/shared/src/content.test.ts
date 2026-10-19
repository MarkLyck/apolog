import { describe, expect, test } from "bun:test";

import * as Schema from "effect/Schema";

import type { DemoContent, InlineContent } from "./content";
import {
  articleContentSchema,
  contentBlockSchema,
  inlineContentSchema,
  validateDemoContent,
} from "./content";
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
    const input: DemoContent = structuredClone(contentFixtures);
    first(input.articles).placements.push({
      collectionKey: "evidence",
      corpusKey: "bible",
      isPrimary: false,
      position: 0,
    });
    expect(validateDemoContent(input)).toEqual({ success: true });
  });

  test("files the radiometric dating explainer under evidence only", () => {
    const article = contentFixtures.articles.find(
      (item) => item.slug === "how-radiometric-dating-cross-checks-itself"
    );
    expect(
      new Set(article?.placements.map((placement) => placement.collectionKey))
    ).toEqual(new Set(["evidence"]));
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
    const content = Schema.decodeUnknownSync(inlineContentSchema)([
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
        first(value.articles).placements.push({
          collectionKey: "evidence",
          corpusKey: "bible",
          isPrimary: true,
          position: 0,
        });
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

describe("Effect content decoding", () => {
  test.each([
    "https://example.com/article?text=bible#reference",
    "http://example.com/article",
    "HTTPS://example.com/article",
    "mailto:editor@example.com",
    "tel:+15551234567",
    "/articles/example?text=bible#reference",
    "/",
  ])("preserves supported inline link %s", (href) => {
    const nodes: InlineContent = [
      { id: "link", type: "link", text: " link text ", href },
    ];
    expect(Schema.decodeUnknownSync(inlineContentSchema)(nodes)).toEqual(nodes);
  });

  test.each([
    ["javascript", "alert(1)"].join(":"),
    ["JaVaScRiPt", "alert(1)"].join(":"),
    "data:text/html,test",
    "vbscript:msgbox(1)",
    "ftp://example.com/file",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/articles/\u0000example",
    "/articles/\u007Fexample",
    "https://example.com/\tarticle",
    "https://example.com/\\article",
    "https://",
    "article",
  ])("rejects unsafe inline link %j", (href) => {
    expect(() =>
      Schema.decodeUnknownSync(inlineContentSchema)([
        { id: "link", type: "link", text: "link text", href },
      ])
    ).toThrow();
  });

  test("normalizes editorial fields while preserving rich-text spacing and optional undefined", () => {
    const article = first(contentFixtures.articles);
    const parsed = Schema.decodeUnknownSync(articleContentSchema)({
      ...article,
      readingMinutes: 1,
      contentWarning: undefined,
      finding: undefined,
      title: `  ${article.title}  `,
      document: {
        schemaVersion: 1,
        blocks: [
          {
            id: " paragraph ",
            type: "paragraph",
            content: [
              { id: " text ", type: "text", text: " keep my spacing " },
            ],
          },
        ],
      },
      extra: "ignored input field",
    });
    expect(parsed.title).toBe(article.title);
    expect(parsed.contentWarning).toBeUndefined();
    expect(parsed.finding).toBeUndefined();
    expect(parsed.document.blocks).toEqual([
      {
        id: "paragraph",
        type: "paragraph",
        content: [{ id: "text", type: "text", text: " keep my spacing " }],
      },
    ]);
    expect(Object.hasOwn(parsed, "extra")).toBe(false);
  });

  test.each(
    [
      [{ id: "one", type: "text", text: " " }],
      [{ id: "one", type: "text", text: "a", marks: ["bold", "bold"] }],
      [
        { id: "one", type: "text", text: "a" },
        { id: " one ", type: "text", text: "b" },
      ],
      [{ id: "one", type: "link", text: "a", href: "//example.com" }],
    ].map((nodes) => ({ nodes }))
  )("rejects invalid inline input %j", ({ nodes }) => {
    expect(() =>
      Schema.decodeUnknownSync(inlineContentSchema)(nodes)
    ).toThrow();
  });
});

describe("image blocks", () => {
  const image = {
    alt: "A clay tablet with cuneiform script",
    height: 800,
    id: "image",
    src: "https://h10hqun98rmndyjq.public.blob.vercel-storage.com/articles/tablet-Xy12.webp",
    type: "image",
    width: 1200,
  } as const;

  test("accepts a public Vercel Blob image with and without a caption", () => {
    expect(Schema.decodeUnknownSync(contentBlockSchema)(image)).toEqual(image);
    expect(
      Schema.decodeUnknownSync(contentBlockSchema)({
        ...image,
        caption: "The Gilgamesh flood tablet.",
      })
    ).toEqual({ ...image, caption: "The Gilgamesh flood tablet." });
  });

  test.each([
    ["an HTTP URL", { src: image.src.replace("https:", "http:") }],
    ["a non-Blob host", { src: "https://example.com/articles/tablet.webp" }],
    [
      "a host that only mentions Blob storage",
      { src: "https://public.blob.vercel-storage.com.example.com/a.webp" },
    ],
    ["a query string", { src: `${image.src}?download=1` }],
    ["an empty alt", { alt: "   " }],
    ["an empty caption", { caption: " " }],
    ["a fractional width", { width: 1.5 }],
    ["a zero height", { height: 0 }],
  ])("rejects %s", (_label, override) => {
    expect(() =>
      Schema.decodeUnknownSync(contentBlockSchema)({ ...image, ...override })
    ).toThrow();
  });
});
