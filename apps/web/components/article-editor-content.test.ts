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

  test("preserves formatting around edits to contradiction claim text", () => {
    const content = document.blocks[0];
    if (content?.type !== "paragraph") {
      throw new Error("Expected paragraph fixture");
    }
    const updated = replaceInlineContentText(
      content.content,
      "A stronger claim with evidence"
    );

    expect(updated[0]).toMatchObject({ marks: ["bold"], text: "A " });
    expect(updated.at(-1)).toMatchObject({
      href: "https://example.com/source",
      text: "with evidence",
      type: "link",
    });
    expect(new Set(updated.map((node) => node.id)).size).toBe(updated.length);
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

    expect(tiptapToArticleDocument(json)).toEqual(
      tiptapToArticleDocument(json)
    );
  });
});
