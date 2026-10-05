import { describe, expect, test } from "bun:test";

import type { ArticleDocument } from "@apolog/shared";

import {
  articleDocumentToTiptap,
  editorWordCount,
  replaceInlineContentText,
  tiptapToArticleDocument,
} from "./article-editor-content";

const document: ArticleDocument = {
  blocks: [
    {
      content: [
        { id: "text-1", marks: ["bold"], text: "A claim ", type: "text" },
        {
          href: "https://example.com/source",
          id: "link-1",
          text: "with evidence",
          type: "link",
        },
      ],
      id: "paragraph-1",
      type: "paragraph",
    },
    {
      content: [{ id: "quote-text", text: "In the beginning", type: "text" }],
      edition: "NRSVUE",
      id: "quote-1",
      reference: "Genesis 1:1",
      type: "quote",
    },
    {
      claims: [
        {
          content: [
            { id: "claim-text-1", text: "First account", type: "text" },
          ],
          id: "claim-1",
          label: "Account A",
          reference: "Genesis 1",
        },
        {
          content: [
            { id: "claim-text-2", text: "Second account", type: "text" },
          ],
          id: "claim-2",
          label: "Account B",
          reference: "Genesis 2",
        },
      ],
      id: "comparison-1",
      type: "claimComparison",
    },
  ],
  schemaVersion: 1,
};

describe("article editor content", () => {
  test("round-trips standard and custom article blocks", () => {
    const editorJson = articleDocumentToTiptap(document);
    const roundTrip = tiptapToArticleDocument(editorJson);

    expect(roundTrip).toEqual(document);
  });

  test("counts words inside custom contradiction nodes", () => {
    expect(editorWordCount(articleDocumentToTiptap(document))).toBe(11);
  });

  test("preserves heading levels, list items, callout titles, and inline formatting on save", () => {
    const saved = tiptapToArticleDocument({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { contentId: "heading", level: 3 },
          content: [
            {
              type: "text",
              text: "Earlier claim",
              marks: [
                { type: "contentId", attrs: { contentId: "heading-text" } },
                { type: "strike" },
              ],
            },
          ],
        },
        {
          type: "bulletList",
          attrs: { contentId: "list" },
          content: [
            {
              type: "listItem",
              attrs: { contentId: "item" },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Read the source",
                      marks: [
                        {
                          type: "link",
                          attrs: {
                            contentId: "source-link",
                            href: "https://example.com/source",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          attrs: { contentId: "callout", title: "Check the context" },
          content: [
            {
              type: "text",
              text: "Compare translations.",
              marks: [
                { type: "contentId", attrs: { contentId: "callout-text" } },
                { type: "italic" },
              ],
            },
          ],
        },
      ],
    });

    expect(saved).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          id: "heading",
          type: "heading",
          level: 3,
          content: [
            {
              id: "heading-text",
              type: "text",
              text: "Earlier claim",
              marks: ["strikethrough"],
            },
          ],
        },
        {
          id: "list",
          type: "list",
          items: [
            {
              id: "item",
              content: [
                {
                  id: "source-link",
                  type: "link",
                  text: "Read the source",
                  href: "https://example.com/source",
                },
              ],
            },
          ],
        },
        {
          id: "callout",
          type: "callout",
          title: "Check the context",
          content: [
            {
              id: "callout-text",
              type: "text",
              text: "Compare translations.",
              marks: ["italic"],
            },
          ],
        },
      ],
    });
    expect(tiptapToArticleDocument(articleDocumentToTiptap(saved))).toEqual(
      saved
    );
  });

  test("preserves formatting around edits to contradiction claim text", () => {
    const content = document.blocks[0];
    if (content?.type !== "paragraph") {
      throw new Error("Expected paragraph fixture");
    }
    const updated = replaceInlineContentText(
      content.content,
      "A stronger claim with evidence"
    );

    expect(updated.map(({ id: _id, ...node }) => node)).toEqual([
      { marks: ["bold"], text: "A ", type: "text" },
      { text: "stronger ", type: "text" },
      { marks: ["bold"], text: "claim ", type: "text" },
      {
        href: "https://example.com/source",
        text: "with evidence",
        type: "link",
      },
    ]);
    expect(new Set(updated.map((node) => node.id)).size).toBe(updated.length);
  });

  test("deletes across formatted text and a link without losing surviving metadata", () => {
    expect(
      replaceInlineContentText(
        [
          { id: "text", marks: ["bold"], text: "A claim ", type: "text" },
          {
            id: "link",
            href: "https://example.com/source",
            text: "with evidence",
            type: "link",
          },
        ],
        "A evidence"
      )
    ).toEqual([
      { id: "text", marks: ["bold"], text: "A ", type: "text" },
      {
        id: "link",
        href: "https://example.com/source",
        text: "evidence",
        type: "link",
      },
    ]);
  });

  test("uses stable fallback IDs for newly inserted Tiptap blocks", () => {
    const json = {
      content: [
        {
          content: [{ text: "New paragraph", type: "text" }],
          type: "paragraph",
        },
      ],
      type: "doc",
    };

    const firstSave = tiptapToArticleDocument(json);
    expect(firstSave).toMatchObject({
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "New paragraph" }],
        },
      ],
    });
    expect(tiptapToArticleDocument(json)).toEqual(firstSave);
  });
});
