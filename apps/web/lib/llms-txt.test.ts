import { describe, expect, test } from "bun:test";

import { llmsTxt } from "./llms-txt";

const text = llmsTxt({
  collections: [
    {
      articles: [
        {
          slug: "flood",
          summary: "Sediment\nlayers [disagree].",
          title: "The [global] flood",
        },
      ],
      collectionKey: "debunked",
    },
    { articles: [], collectionKey: "silly" },
  ],
  description: "An evidence-first library.",
  name: "Apolog",
  siteUrl: "https://apolog.example",
});
const lines = text.split("\n");

describe("llms.txt", () => {
  test("opens with the site name and a blockquote summary", () => {
    expect(lines.slice(0, 3)).toEqual([
      "# Apolog",
      "",
      "> An evidence-first library.",
    ]);
  });

  test("lists collections and links each article to its Markdown source", () => {
    expect(text).toContain(
      "- [Debunked](https://apolog.example/debunked): Historical and factual claims tested against evidence."
    );
    expect(text).toContain("## Debunked\n");
    expect(text).toContain(
      "- [The \\[global\\] flood](https://apolog.example/articles/flood.md): Sediment layers [disagree]."
    );
  });

  test("skips the section of a collection with no articles", () => {
    expect(text).toContain("- [Silly](https://apolog.example/silly)");
    expect(text).not.toContain("## Silly");
  });
});
