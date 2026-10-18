import { describe, expect, test } from "bun:test";

import { articleMarkdown } from "./article-markdown";
import type { MarkdownArticle } from "./article-markdown";

const url = "https://apolog.example/articles/talking-donkey";

const article: MarkdownArticle = {
  contentWarning: "Animal cruelty",
  document: {
    blocks: [
      {
        content: [
          { id: "a", text: "Balaam's donkey ", type: "text" },
          { id: "b", marks: ["bold"], text: "speaks ", type: "text" },
          { href: "/evidence", id: "c", text: "see methods", type: "link" },
        ],
        id: "p1",
        type: "paragraph",
      },
      {
        content: [{ id: "h", text: "The account", type: "text" }],
        id: "h1",
        level: 2,
        type: "heading",
      },
      {
        content: [
          { id: "q", text: "What have I done unto thee?", type: "text" },
        ],
        edition: "King James Version",
        id: "q1",
        reference: "Numbers 22:28",
        type: "quote",
      },
      {
        content: [
          { id: "c1", text: "Donkeys lack a larynx for speech.", type: "text" },
        ],
        id: "c1",
        title: "Finding",
        type: "callout",
      },
      {
        id: "l1",
        items: [
          {
            content: [{ id: "i1", text: "The angel", type: "text" }],
            id: "i1",
          },
          {
            content: [{ id: "i2", marks: ["code"], text: "a`b", type: "text" }],
            id: "i2",
          },
        ],
        type: "list",
      },
      {
        claims: [
          {
            content: [{ id: "x", text: "The donkey speaks.", type: "text" }],
            id: "x",
            label: "Claim A",
            reference: "Numbers 22:28",
          },
          {
            content: [{ id: "y", text: "Animals do not speak.", type: "text" }],
            id: "y",
            label: "Claim B",
            reference: "Observation",
          },
        ],
        id: "cc",
        type: "claimComparison",
      },
    ],
  },
  publishedAt: Date.UTC(2026, 0, 2),
  sources: [
    {
      publisher: "Oxford",
      title: "Animal vocal anatomy",
      url: "https://example.org/larynx",
    },
  ],
  summary: "Why a talking donkey is implausible.",
  tags: ["Animals"],
  title: "The talking donkey",
  updatedAt: Date.UTC(2026, 0, 3),
};

describe("article markdown", () => {
  test("renders frontmatter, every block type, and sources in reading order", () => {
    expect(articleMarkdown(article, url)).toBe(`---
title: "The talking donkey"
url: "https://apolog.example/articles/talking-donkey"
published: "2026-01-02T00:00:00.000Z"
updated: "2026-01-03T00:00:00.000Z"
tags:
  - "Animals"
sources:
  - title: "Animal vocal anatomy"
    publisher: "Oxford"
    url: "https://example.org/larynx"
---

# The talking donkey

Why a talking donkey is implausible.

> **Content notice:** Animal cruelty

Balaam's donkey **speaks** [see methods](https://apolog.example/evidence)

## The account

> What have I done unto thee?
>
> Numbers 22:28 (King James Version)

> **Finding**
>
> Donkeys lack a larynx for speech.

- The angel
- \`\`a\`b\`\`

- **Claim A** (Numbers 22:28): The donkey speaks.
- **Claim B** (Observation): Animals do not speak.

## Sources

1. [Animal vocal anatomy](https://example.org/larynx), Oxford
`);
  });

  test("escapes text that would otherwise become Markdown syntax", () => {
    const markdown = articleMarkdown(
      {
        ...article,
        contentWarning: undefined,
        document: {
          blocks: [
            {
              content: [
                { id: "t", text: "# 1. not *a* heading [x]", type: "text" },
              ],
              id: "p",
              type: "paragraph",
            },
          ],
        },
        publishedAt: undefined,
        sources: [],
        tags: [],
      },
      url
    );
    expect(markdown).toContain("\n\\# 1. not \\*a\\* heading \\[x\\]\n");
    expect(markdown).not.toContain("published:");
    expect(markdown).not.toContain("## Sources");
  });
});
