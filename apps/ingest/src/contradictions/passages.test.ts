import { describe, expect, test } from "bun:test";

import type { Bible } from "./acquire";
import { resolvePassages } from "./passages";

const bible: Bible = {
  translation: "Test translation",
  books: [
    {
      name: "Genesis",
      edition: "Test edition",
      chapters: [
        {
          chapter: 1,
          verses: [
            { verse: 1, text: "First chapter begins." },
            { verse: 2, text: "First chapter continues." },
            { verse: 3, text: "First chapter ends." },
          ],
        },
        {
          chapter: 2,
          verses: [
            { verse: 1, text: "Second chapter begins." },
            { verse: 2, text: "Second chapter continues." },
            { verse: 3, text: "Second chapter ends." },
          ],
        },
      ],
    },
    {
      name: "Jude",
      edition: "Another edition",
      chapters: [
        {
          chapter: 1,
          verses: [
            { verse: 1, text: "Jude begins." },
            { verse: 2, text: "Jude continues." },
            { verse: 3, text: "Jude ends." },
          ],
        },
      ],
    },
  ],
};

describe("passage references", () => {
  test("inherits the chapter across separated verses and changes it at an explicit chapter", () => {
    expect(
      resolvePassages(bible, {
        text: "Genesis 1:1, 3; 2:2 and 3",
        href: "../gen/1.html#1",
      })
    ).toEqual([
      {
        reference: "Genesis 1:1",
        text: "First chapter begins.",
        edition: "Test edition",
      },
      {
        reference: "Genesis 1:3",
        text: "First chapter ends.",
        edition: "Test edition",
      },
      {
        reference: "Genesis 2:2",
        text: "Second chapter continues.",
        edition: "Test edition",
      },
      {
        reference: "Genesis 2:3",
        text: "Second chapter ends.",
        edition: "Test edition",
      },
    ]);
  });

  test("expands a chapter range into complete passages", () => {
    expect(
      resolvePassages(bible, { text: "Genesis 1-2", href: "../gen/1.html" })
    ).toEqual([
      {
        reference: "Genesis 1:1-3",
        text: "First chapter begins. First chapter continues. First chapter ends.",
        edition: "Test edition",
      },
      {
        reference: "Genesis 2:1-3",
        text: "Second chapter begins. Second chapter continues. Second chapter ends.",
        edition: "Test edition",
      },
    ]);
  });

  test("keeps references to multiple books in order and treats single-chapter numbers as verses", () => {
    expect(
      resolvePassages(bible, {
        text: "Genesis 2:3; Jude 1-2",
        href: "../gen/2.html#3",
      })
    ).toEqual([
      {
        reference: "Genesis 2:3",
        text: "Second chapter ends.",
        edition: "Test edition",
      },
      {
        reference: "Jude 1:1-2",
        text: "Jude begins. Jude continues.",
        edition: "Another edition",
      },
    ]);
  });

  test("accepts dotted citations, typographic ranges, and verse-part suffixes", () => {
    expect(
      resolvePassages(bible, {
        text: "Genesis.1.1a–2b",
        href: "../gen/1.html#1",
      })
    ).toEqual([
      {
        reference: "Genesis 1:1-2",
        text: "First chapter begins. First chapter continues.",
        edition: "Test edition",
      },
    ]);
  });

  test("uses the citation URL when the link text does not identify a book", () => {
    expect(
      resolvePassages(bible, {
        text: "Read the passage",
        href: "../gen/2.html#2a-3b",
      })
    ).toEqual([
      {
        reference: "Genesis 2:2-3",
        text: "Second chapter continues. Second chapter ends.",
        edition: "Test edition",
      },
    ]);
  });

  test("rejects a reversed range instead of substituting the URL's first verse", () => {
    expect(() =>
      resolvePassages(bible, {
        text: "Genesis 1:3-1",
        href: "../gen/1.html#3",
      })
    ).toThrow("Reversed range");
  });
});
