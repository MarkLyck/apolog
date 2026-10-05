import { describe, expect, test } from "bun:test";

import { parseScriptureReference } from "./scripture-reference";

describe("parseScriptureReference", () => {
  test("keeps both endpoints of a verse range after trimming whitespace", () => {
    expect(parseScriptureReference("  1 John 2:3–5  ")).toEqual({
      book: "1 John",
      start: { chapter: 2, verse: 3 },
      finish: { chapter: 2, verse: 5 },
    });
  });

  test("allows a smaller ending verse when the range crosses chapters", () => {
    expect(parseScriptureReference("John 3:16-4:2")).toEqual({
      book: "John",
      start: { chapter: 3, verse: 16 },
      finish: { chapter: 4, verse: 2 },
    });
    expect(parseScriptureReference("John 3:16-3:2")).toBeNull();
  });

  test("whole chapters include every verse in the selected chapters", () => {
    expect(parseScriptureReference("John 3")).toEqual({
      book: "John",
      start: { chapter: 3, verse: 1 },
      finish: { chapter: 3, verse: Infinity },
    });
    expect(parseScriptureReference("John 3-4")).toEqual({
      book: "John",
      start: { chapter: 3, verse: 1 },
      finish: { chapter: 4, verse: Infinity },
    });
  });

  test("requires positive chapter and verse numbers without leading zeros", () => {
    expect(parseScriptureReference("John 1:1")).toEqual({
      book: "John",
      start: { chapter: 1, verse: 1 },
      finish: { chapter: 1, verse: 1 },
    });
    for (const reference of [
      "John 01:1",
      "John 1:0",
      "John 1:01",
      "John 1:1-0",
      "John 1:1-02",
    ]) {
      expect(parseScriptureReference(reference)).toBeNull();
    }
  });
});
