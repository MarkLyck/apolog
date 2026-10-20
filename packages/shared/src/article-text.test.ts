import { describe, expect, test } from "bun:test";

import { articleWordCount, estimateReadingMinutes } from "./article-text";
import type { ContentBlock } from "./content";

const blocks: ContentBlock[] = [
  {
    id: "paragraph",
    type: "paragraph",
    content: [
      { id: "start", type: "text", text: "  Trans", marks: ["bold"] },
      { id: "end", type: "link", text: "lation matters ", href: "/" },
    ],
  },
  {
    id: "quote",
    type: "quote",
    reference: "Genesis 1:1",
    edition: "King James Version",
    content: [{ id: "quote-text", type: "text", text: "In the beginning" }],
  },
];

describe("article reading time", () => {
  test("counts every visible word once, including words split by formatting", () => {
    expect(articleWordCount(blocks)).toBe(10);
  });

  test("counts an image caption as prose and ignores its alt text", () => {
    const image = {
      alt: "Alt text is announced, not read inline",
      height: 600,
      id: "image",
      src: "https://store.public.blob.vercel-storage.com/articles/a.webp",
      type: "image",
      width: 800,
    } as const;
    expect(articleWordCount([image])).toBe(0);
    expect(
      articleWordCount([{ ...image, caption: "Three caption words" }])
    ).toBe(3);
  });

  test("counts an empty body as no words", () => {
    expect(articleWordCount([])).toBe(0);
  });

  test.each([
    [0, 1],
    [40, 1],
    [200, 1],
    [201, 2],
    [1000, 5],
  ])("estimates %i words as %i minutes", (words, minutes) => {
    expect(estimateReadingMinutes(words)).toBe(minutes);
  });
});
