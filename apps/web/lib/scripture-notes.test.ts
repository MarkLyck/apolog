import { describe, expect, test } from "bun:test";

import { scriptureNotes } from "./scripture-notes";

const kjv = "King James Version";

describe("scriptureNotes", () => {
  test("includes notes touching either endpoint but excludes adjacent verses", () => {
    expect(
      scriptureNotes("Proverbs 26:3-4", kjv).map((note) => note.kind)
    ).toEqual(["context"]);
    expect(
      scriptureNotes("Proverbs 26:5-6", kjv).map((note) => note.kind)
    ).toEqual(["context"]);
    expect(scriptureNotes("Proverbs 26:3", kjv)).toEqual([]);
    expect(scriptureNotes("Proverbs 26:6", kjv)).toEqual([]);
    expect(scriptureNotes("Proverbs 25:4-5", kjv)).toEqual([]);
    expect(scriptureNotes("Genesis 26:4-5", kjv)).toEqual([]);
  });

  test("compares chapters before verses for ranges crossing chapters", () => {
    expect(
      scriptureNotes("Job 3:26-4:1", kjv).map((note) => note.kind)
    ).toEqual(["context"]);
    expect(
      scriptureNotes("Job 5:27-6:1", kjv).map((note) => note.kind)
    ).toEqual(["context"]);
    expect(scriptureNotes("Job 3:1-26", kjv)).toEqual([]);
    expect(scriptureNotes("Job 6:1-27", kjv)).toEqual([]);
  });

  test("selects every applicable note when the reference is an entire chapter", () => {
    expect(
      scriptureNotes("Genesis 2", kjv)
        .map((note) => note.kind)
        .sort()
    ).toEqual(["context", "wording"]);
  });

  test("returns a note once when several of its passages overlap", () => {
    expect(scriptureNotes("Job 4-5", kjv).map((note) => note.kind)).toEqual([
      "context",
    ]);
  });

  test("recognizes KJV aliases and clarified quotations without applying KJV notes to other editions", () => {
    for (const edition of [
      "KJV",
      "King James Version, with supplied clarification",
    ]) {
      expect(
        scriptureNotes("Genesis 2:19", edition).map((note) => note.kind)
      ).toEqual(["wording"]);
    }
    expect(
      scriptureNotes("Genesis 2:19", "Douay-Rheims, Challoner revision")
    ).toEqual([]);
  });
});
