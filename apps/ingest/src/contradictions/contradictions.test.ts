import { describe, expect, test } from "bun:test";

import { parseDetail } from "./acquire";
import { buildArticle } from "./build";
import bible from "./fixtures/creation-bible.json";
import { resolvePassages } from "./passages";

const html = await Bun.file(
  new URL("fixtures/creation.html", import.meta.url)
).text();

describe("contradiction passage import", () => {
  test("preserves all five supplied creation passages in three groups", () => {
    const groups = parseDetail(`<div class="contra">${html}</div>`);
    expect(groups.map((group) => group.references.length)).toEqual([2, 2, 1]);
    const article = buildArticle(
      {
        groups,
        path: "/contra/who_created.html",
        title: "Who created heaven and earth?",
        position: 2,
      },
      bible,
      1000
    );
    const quotes = article.document.blocks.filter(
      (block) => block.type === "quote"
    );
    expect(quotes.map((quote) => quote.reference)).toEqual([
      "Genesis 1:1",
      "Isaiah 44:24",
      "John 1:6-10",
      "Colossians 1:16",
      "1 Corinthians 8:6",
    ]);
    expect(quotes[2]?.content[0]?.text).toBe(
      "There was a man sent from God, whose name was John. The same came for a witness, to bear witness of the Light, that all men through him might believe. He was not that Light, but was sent to bear witness of that Light. That was the true Light, which lighteth every man that cometh into the world. He was in the world, and the world was made by him, and the world knew him not."
    );
    expect(quotes[3]?.content[0]?.text).toContain(
      "By him [Jesus] were all things created"
    );
    expect(quotes[4]?.content[0]?.text).toContain(
      "from whom all things are and for whom we exist"
    );
    expect(article.sources).toEqual([]);
    expect(JSON.stringify(article)).not.toMatch(
      /\bsab\b|skepticsannotatedbible/iu
    );
  });

  test("keeps the entire numbered-book range instead of falling back to the link's first verse", () => {
    const passages = resolvePassages(bible, {
      text: "1 Corinthians 8:6",
      href: "../1cor/8.html#1",
    });
    expect(passages[0]?.reference).toBe("1 Corinthians 8:6");
    expect(passages[0]?.text).toContain("one God, the Father");
  });

  test("fails on missing verses rather than publishing an incomplete quotation", () => {
    expect(() =>
      resolvePassages(bible, { text: "John 1:6-11", href: "../jn/1.html#6" })
    ).toThrow("Missing verse");
  });

  test("resolves cross-chapter ranges without expanding the final verse number", () => {
    const source = {
      translation: "test",
      books: [
        {
          name: "John",
          edition: "test",
          chapters: [
            { chapter: 8, verses: [{ verse: 59, text: "First chapter end." }] },
            {
              chapter: 9,
              verses: [
                { verse: 1, text: "Next chapter start." },
                { verse: 2, text: "Range ends here." },
              ],
            },
          ],
        },
      ],
    };
    const passages = resolvePassages(source, {
      text: "John 8:59-9:2",
      href: "../jn/8.html#59",
    });
    expect(passages[0]?.text).toBe(
      "First chapter end. Next chapter start. Range ends here."
    );
  });
});
