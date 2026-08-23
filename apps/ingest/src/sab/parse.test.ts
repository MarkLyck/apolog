import { describe, expect, test } from "bun:test";

import {
  isVerseReference,
  normalizeVerseReference,
  parseSabDetailPage,
  parseSabListPage,
  referenceFromHref,
} from "./parse";

const listHtml = `
<div class="list">
<h3>Contradictions by First Occurrence (<span id="lcnt">2</span>)</h3>
<ol>
<h3>Genesis</h3>
<li><a href="/contra/heaven.html">When was heaven created?</a> &nbsp; <a href="/gen/1.html#1">Genesis 1:1</a></li>
<h3>Exodus</h3>
<li><a href="/contra/borders.html"></a> &nbsp; <a href="/gen/15.html#18">Genesis 15:18</a></li>
</ol>
</div>
`;

const detailHtml = `
<div class="contra">
<h2 style="font-size:150%;">When was heaven created?</h2>
<h3>In the beginning.</h3>
<blockquote>In the beginning God created the heaven and the earth. <a href="../gen/1.html#1">Genesis 1:1</a></blockquote>
<h3>On the second day of creation.</h3>
<blockquote>And God called the firmament Heaven. <a href="../gen/1.html#6">Genesis 1:6-8</a></blockquote>
</div>
<div class="links">ignore</div>
`;

describe("SAB HTML parsers", () => {
  test("accepts standard verse references", () => {
    expect(isVerseReference("Genesis 1:1")).toBe(true);
    expect(isVerseReference("1 Chronicles 21:2")).toBe(true);
    expect(isVerseReference("2 Samuel 24:1-17")).toBe(true);
    expect(isVerseReference("When was heaven created?")).toBe(false);
    expect(normalizeVerseReference("1 Kings 7.26")).toBe("1 Kings 7:26");
    expect(normalizeVerseReference("1 Kings 14;20")).toBe("1 Kings 14:20");
    expect(normalizeVerseReference("2 Kings15:32-33")).toBe("2 Kings 15:32-33");
    expect(normalizeVerseReference("Genesis 46:9-15a")).toBe(
      "Genesis 46:9-15a"
    );
    expect(normalizeVerseReference("Genesis 1:3 - 2:3")).toBe(
      "Genesis 1:3 - 2:3"
    );
    expect(referenceFromHref("../jg/1.html#29")).toBe("Judges 1:29");
    expect(referenceFromHref("/dt/3.html#26")).toBe("Deuteronomy 3:26");
  });

  test("reads first-occurrence listings with book headings", () => {
    const entries = parseSabListPage(listHtml);
    expect(entries).toEqual([
      {
        book: "Genesis",
        firstReference: "Genesis 1:1",
        path: "/contra/heaven.html",
        position: 1,
        title: "When was heaven created?",
        url: "https://www.skepticsannotatedbible.com/contra/heaven.html",
      },
      {
        book: "Exodus",
        firstReference: "Genesis 15:18",
        path: "/contra/borders.html",
        position: 2,
        title: "",
        url: "https://www.skepticsannotatedbible.com/contra/borders.html",
      },
    ]);
  });

  test("recovers verse locators from broken SAB anchors", () => {
    expect(
      parseSabDetailPage(`
<div class="contra">
<h2>What angered God?</h2>
<h3>He struck the rock.</h3>
<blockquote><a href="/num/20.html#7">Numbers 20:7-12</a></blockquote>
<h3>God was angry with the people.</h3>
<blockquote><a href="/dt/3.html#26">Deuteronomy 3:26-27</p></blockquote>
</div>
`)
    ).toEqual({
      claims: [
        { label: "He struck the rock.", references: ["Numbers 20:7-12"] },
        {
          label: "God was angry with the people.",
          references: ["Deuteronomy 3:26"],
        },
      ],
      title: "What angered God?",
    });
  });

  test("reads claim labels and verse locators from a detail page", () => {
    expect(parseSabDetailPage(detailHtml)).toEqual({
      claims: [
        { label: "In the beginning.", references: ["Genesis 1:1"] },
        {
          label: "On the second day of creation.",
          references: ["Genesis 1:6-8"],
        },
      ],
      title: "When was heaven created?",
    });
  });
});
