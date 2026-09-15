import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { scriptureNotes } from "../lib/scripture-notes";
import { fullChapterLinks } from "../lib/scripture-reference";
import { QuoteBlock } from "./content-block-renderers";

const kjv = "King James Version";

describe("quote context", () => {
  test("links every chapter in a crossing passage, in the quoted edition", () => {
    expect(fullChapterLinks("Genesis 1:26-2:3", kjv)).toEqual([
      {
        label: "Genesis 1",
        href: "https://www.biblegateway.com/passage/?search=Genesis+1&version=KJV",
      },
      {
        label: "Genesis 2",
        href: "https://www.biblegateway.com/passage/?search=Genesis+2&version=KJV",
      },
    ]);
    expect(fullChapterLinks("1 Corinthians 8:6", kjv)[0]?.label).toBe(
      "1 Corinthians 8"
    );
    expect(fullChapterLinks("Psalm 23", kjv)[0]?.label).toBe("Psalms 23");
    expect(
      fullChapterLinks("Genesis 1–3", kjv).map((link) => link.label)
    ).toEqual(["Genesis 1", "Genesis 2", "Genesis 3"]);
  });

  test("keeps deuterocanonical books and the Book of Moses in their own editions", () => {
    expect(
      fullChapterLinks(
        "Ecclesiasticus 44:17",
        "Douay-Rheims, Challoner revision"
      )
    ).toEqual([
      {
        label: "Ecclesiasticus 44",
        href: "https://www.biblegateway.com/passage/?search=Ecclesiasticus+44&version=DRA",
      },
    ]);
    expect(
      fullChapterLinks("Moses 1:3", "Pearl of Great Price, Book of Moses")
    ).toEqual([
      {
        label: "Moses 1",
        href: "https://www.churchofjesuschrist.org/study/scriptures/pgp/moses/1?lang=eng",
      },
    ]);
    expect(fullChapterLinks("Wisdom 10:6", kjv)).toEqual([]);
  });

  test("does not guess sources for unidentified editions or unsupported references", () => {
    for (const reference of [
      "Genesis 0:1",
      "Genesis 1-2:3",
      "Genesis 2:7-3",
      "Genesis 2:7-1:8",
      "Genesis 1:1-999:9",
      "Unknown 1:1",
      "Quran 27:18",
      "Genesis 1:1; Exodus 2:1",
    ]) {
      expect(fullChapterLinks(reference, kjv)).toEqual([]);
    }
    expect(fullChapterLinks("1 Corinthians 8:6", "Supplied quotation")).toEqual(
      []
    );
    expect(
      fullChapterLinks("Genesis 2:19", "Unidentified translation")
    ).toEqual([]);
  });

  test("rejects nonexistent chapters using the quoted edition's book limits", () => {
    for (const reference of [
      "Jude 2:1",
      "Genesis 51:1",
      "Genesis 50-51",
      "Genesis 50:1-51:3",
      "Daniel 13:1",
      "Esther 11:1",
    ]) {
      expect(fullChapterLinks(reference, kjv)).toEqual([]);
    }
    const douay = "Douay-Rheims, Challoner revision";
    for (const reference of [
      "Daniel 15:1",
      "Esther 17:1",
      "Tobit 15:1",
      "Ecclesiasticus 52:1",
    ]) {
      expect(fullChapterLinks(reference, douay)).toEqual([]);
    }
    expect(fullChapterLinks("Genesis 50:1", kjv)[0]?.label).toBe("Genesis 50");
    expect(fullChapterLinks("Jude 1:1", kjv)[0]?.label).toBe("Jude 1");
    expect(fullChapterLinks("Daniel 14:1", douay)[0]?.label).toBe("Daniel 14");
    expect(fullChapterLinks("Esther 16:1", douay)[0]?.label).toBe("Esther 16");
    expect(
      fullChapterLinks("Moses 9:1", "Pearl of Great Price, Book of Moses")
    ).toEqual([]);
  });

  test("matches notes only where the cited verses overlap, including chapter crossings", () => {
    expect(
      scriptureNotes("Genesis 2:18-22", kjv).map((note) => note.kind)
    ).toEqual(["wording"]);
    expect(
      scriptureNotes("Genesis 1:26-2:5", kjv).map((note) => note.kind)
    ).toEqual(["context"]);
    expect(scriptureNotes("Genesis 1-2:3", kjv)).toEqual([]);
    expect(scriptureNotes("Genesis 2:20-25", kjv)).toEqual([]);
    expect(scriptureNotes("Genesis 2:19", "Supplied quotation")).toEqual([]);
    expect(scriptureNotes("Proverbs 26:4", kjv)[0]?.sources[0]?.label).toBe(
      "Proverbs 26:4-5 (KJV)"
    );
  });

  test("preserves complete quotation and marks while adding a labelled, expandable note", () => {
    const html = renderToStaticMarkup(
      <QuoteBlock
        block={{
          type: "quote",
          id: "creation",
          reference: "Genesis 2:19",
          edition: kjv,
          content: [
            {
              type: "text",
              id: "before",
              text: "And out of the ground the Lord God ",
            },
            { type: "text", id: "emphasis", text: "formed", marks: ["bold"] },
            { type: "text", id: "after", text: " every beast of the field." },
          ],
        }}
      />
    );
    expect(html).toContain("<strong>formed</strong>");
    expect(html).toContain(" every beast of the field.");
    expect(html).toContain("Translation / edition: King James Version (KJV)");
    expect(html).toContain("Read the full chapter:");
    expect(html).toContain("<summary");
    expect(html).toContain("Wording affects the comparison");
    expect(html).toContain("version=KJV%3BNIV");
    expect(html).not.toContain("<details open");
  });

  test("visibly distinguishes supplied or modified quotations from a verified translation", () => {
    const block = {
      type: "quote",
      id: "supplied",
      reference: "1 Corinthians 8:6",
      edition: "Supplied quotation",
      content: [{ type: "text", id: "text", text: "Supplied text." }],
    } satisfies Parameters<typeof QuoteBlock>[0]["block"];
    const html = renderToStaticMarkup(<QuoteBlock block={block} />);
    expect(html).toContain(
      "translation of this supplied quotation is not identified"
    );
    expect(html).not.toContain("href=");
    const clarified = renderToStaticMarkup(
      <QuoteBlock
        block={{
          ...block,
          edition: "King James Version, with supplied clarification",
        }}
      />
    );
    expect(clarified).toContain("unmodified KJV text");
    expect(clarified).toContain("search=1+Corinthians+8&amp;version=KJV");
  });
});
