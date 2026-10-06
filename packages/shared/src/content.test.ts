import { describe, expect, test } from "bun:test";

import * as Schema from "effect/Schema";

import type { ContentBlock, DemoContent, InlineContent } from "./content";
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

describe("article image content", () => {
  const image = {
    alt: "A square Earth blueprint beside a globe",
    caption: "Creation needs a geometry lesson",
    id: "meme",
    src: "https://example.com/meme.png",
    type: "image",
  } satisfies ContentBlock;

  test("normalizes image fields and allows an omitted caption", () => {
    expect(
      Schema.decodeUnknownSync(contentBlockSchema)({
        ...image,
        alt: ` ${image.alt} `,
        caption: ` ${image.caption} `,
        src: ` ${image.src} `,
      })
    ).toEqual(image);
    expect(
      Schema.decodeUnknownSync(contentBlockSchema)({
        ...image,
        caption: undefined,
      })
    ).toEqual({ ...image, caption: undefined });
  });

  test.each([
    "http://example.com/meme.png",
    ["javascript", "alert(1)"].join(":"),
    "data:image/png;base64,test",
    "//example.com/meme.png",
    "https:example.com/meme.png",
    "https:///example.com/meme.png",
    "https://user:password@example.com/meme.png",
    "https://example.com/\\meme.png",
    "https://example.com/\tmeme.png",
    "https://example.com/\u007Fmeme.png",
    "https://",
  ])("rejects unsafe image URL %j", (src) => {
    expect(() =>
      Schema.decodeUnknownSync(contentBlockSchema)({ ...image, src })
    ).toThrow();
  });

  test.each(["", " "])("requires visible alt text %j", (alt) => {
    expect(() =>
      Schema.decodeUnknownSync(contentBlockSchema)({ ...image, alt })
    ).toThrow();
  });

  test("rejects an explicitly empty caption", () => {
    expect(() =>
      Schema.decodeUnknownSync(contentBlockSchema)({ ...image, caption: " " })
    ).toThrow();
  });
});
