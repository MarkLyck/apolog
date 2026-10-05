import { describe, expect, test } from "bun:test";

import {
  ensurePrimaryPlacements,
  type Placement,
  slugify,
  type Source,
  sourcesForSave,
} from "./article-editor-model";

describe("article editor slugs", () => {
  test("turns title punctuation and repeated whitespace into URL separators", () => {
    expect(slugify("  Genesis 1:1 / Creation & Evidence?!  ")).toBe(
      "genesis-1-1-creation-evidence"
    );
    expect(slugify("creation--and___evidence")).toBe("creation-and-evidence");
  });

  test("preserves a valid edited slug and leaves a cleared field empty", () => {
    expect(slugify("genesis-1-1")).toBe("genesis-1-1");
    expect(slugify("   ")).toBe("");
    expect(slugify("?! / ---")).toBe("");
  });
});

describe("article editor sources", () => {
  test("omits blank rows, retains incomplete citations, and removes editor IDs", () => {
    const sources: Source[] = [
      { editorId: "blank", publisher: "", title: "", url: "" },
      {
        editorId: "complete",
        publisher: "Example Press",
        title: "Creation accounts",
        url: "https://example.com/creation",
      },
      {
        editorId: "title-only",
        publisher: "",
        title: "Draft citation",
        url: "",
      },
      { editorId: "publisher-only", publisher: "Archive", title: "", url: "" },
      {
        editorId: "url-only",
        publisher: "",
        title: "",
        url: "https://example.com/archive",
      },
    ];

    expect(sourcesForSave(sources)).toEqual([
      {
        publisher: "Example Press",
        title: "Creation accounts",
        url: "https://example.com/creation",
      },
      { publisher: "", title: "Draft citation", url: "" },
      { publisher: "Archive", title: "", url: "" },
      { publisher: "", title: "", url: "https://example.com/archive" },
    ]);
  });
});

const bibleEvidence: Placement = {
  collectionKey: "evidence",
  corpusKey: "bible",
  editorId: "bible-evidence",
  isPrimary: false,
  position: 0,
};
const bibleContradictions: Placement = {
  collectionKey: "contradictions",
  corpusKey: "bible",
  editorId: "bible-contradictions",
  isPrimary: true,
  position: 7,
};
const quranEvidence: Placement = {
  collectionKey: "evidence",
  corpusKey: "quran",
  editorId: "quran-evidence",
  isPrimary: true,
  position: 0,
};

describe("article editor primary placements", () => {
  test("preserves a chosen primary even when it follows another corpus", () => {
    const placements = [bibleEvidence, quranEvidence, bibleContradictions];

    expect(ensurePrimaryPlacements(placements)).toEqual([
      { ...bibleEvidence, isPrimary: false },
      { ...quranEvidence, isPrimary: true },
      { ...bibleContradictions, isPrimary: true },
    ]);
  });

  test("promotes a remaining placement after its corpus primary is removed", () => {
    const placements = [
      bibleEvidence,
      quranEvidence,
      {
        ...bibleContradictions,
        editorId: "bible-secondary",
        isPrimary: false,
      },
    ];

    expect(ensurePrimaryPlacements(placements)).toEqual([
      { ...bibleEvidence, isPrimary: true },
      { ...quranEvidence, isPrimary: true },
      {
        ...bibleContradictions,
        editorId: "bible-secondary",
        isPrimary: false,
      },
    ]);
    expect(placements.map(({ isPrimary }) => isPrimary)).toEqual([
      false,
      true,
      false,
    ]);
  });

  test("gives the first placement in a newly added corpus its own primary", () => {
    const placements = [
      bibleEvidence,
      bibleContradictions,
      { ...quranEvidence, isPrimary: false },
    ];

    expect(ensurePrimaryPlacements(placements)).toEqual([
      { ...bibleEvidence, isPrimary: false },
      { ...bibleContradictions, isPrimary: true },
      { ...quranEvidence, isPrimary: true },
    ]);
  });
});
