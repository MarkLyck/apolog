import { describe, expect, test } from "bun:test";

import type { ArticleDocument } from "@apolog/shared";

import { projectArticle } from "./article-projection";

const document: ArticleDocument = {
  schemaVersion: 1,
  blocks: [
    {
      id: "heading",
      type: "heading",
      level: 2,
      content: [{ id: "heading-text", type: "text", text: "Context" }],
    },
    {
      id: "paragraph",
      type: "paragraph",
      content: [
        { id: "word-start", type: "text", text: "Trans", marks: ["bold"] },
        {
          id: "word-end",
          type: "link",
          text: "lation",
          href: "https://example.com/private-url",
        },
      ],
    },
    {
      id: "quote",
      type: "quote",
      reference: "Genesis 1:1",
      edition: "King James Version",
      content: [{ id: "quote-text", type: "text", text: "Beginning" }],
    },
    {
      id: "supporting-quote",
      type: "quote",
      reference: "Isaiah 44:24",
      edition: "King James Version",
      content: [{ id: "supporting-text", type: "text", text: "Alone" }],
    },
    {
      id: "callout",
      type: "callout",
      title: "Caution",
      content: [{ id: "callout-text", type: "text", text: "Check editions" }],
    },
    {
      id: "next-group",
      type: "quote",
      reference: "John 1:3",
      edition: "King James Version",
      content: [{ id: "next-group-text", type: "text", text: "Through him" }],
    },
    {
      id: "list",
      type: "list",
      items: [
        {
          id: "list-first",
          content: [{ id: "first-text", type: "text", text: "Chronology" }],
        },
        {
          id: "list-second",
          content: [{ id: "second-text", type: "text", text: "Authorship" }],
        },
      ],
    },
    {
      id: "comparison",
      type: "claimComparison",
      claims: [
        {
          id: "first-claim",
          label: "Creator",
          reference: "Genesis 1:1",
          content: [{ id: "creator-text", type: "text", text: "Created" }],
        },
        {
          id: "second-claim",
          label: "Agent",
          reference: "Colossians 1:16",
          content: [{ id: "agent-text", type: "text", text: "All things" }],
        },
      ],
    },
  ],
};

describe("article projection", () => {
  test("indexes visible text from every block, including words split by formatting", () => {
    const { searchText } = projectArticle({
      document,
      title: "Creation accounts",
      summary: "Compare the evidence",
      tags: ["Origins"],
    });

    for (const term of [
      "creation accounts",
      "compare the evidence",
      "origins",
      "context",
      "translation",
      "genesis 1:1",
      "king james version",
      "beginning",
      "isaiah 44:24",
      "alone",
      "caution",
      "check editions",
      "john 1:3",
      "through him",
      "chronology",
      "authorship",
      "creator",
      "created",
      "agent",
      "colossians 1:16",
      "all things",
    ]) {
      expect(searchText).toContain(term);
    }
    expect(searchText).not.toContain("private-url");
    expect(searchText).not.toContain("word-start");
  });

  test("lists each comparison reference once and uses the first quote in each passage group", () => {
    const projection = projectArticle({
      document,
      title: "Creation accounts",
      summary: "Compare the evidence",
      tags: [],
    });

    expect(projection.comparisonReferences).toEqual([
      "Genesis 1:1",
      "John 1:3",
      "Colossians 1:16",
    ]);
  });

  test("normalizes tag keys while preserving their display labels", () => {
    const projection = projectArticle({
      document,
      title: "Creation accounts",
      summary: "Compare the evidence",
      tags: ["  Text & Translation  ", "Old---Testament", "Genesis"],
    });

    expect(projection.tagKeys).toEqual([
      { key: "text-translation", label: "  Text & Translation  " },
      { key: "old-testament", label: "Old---Testament" },
      { key: "genesis", label: "Genesis" },
    ]);
  });
});
