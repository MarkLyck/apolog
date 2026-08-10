import type { ArticleDocument, CollectionKey, CorpusKey } from "@apolog/shared";

export type Status = "draft" | "published" | "archived";
export type Placement = {
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
  editorId: string;
  isPrimary: boolean;
  position: number;
};
export type Source = {
  editorId: string;
  publisher: string;
  title: string;
  url: string;
};
export type EditorValues = {
  contentWarning: string;
  document: ArticleDocument;
  finding: string;
  placements: Placement[];
  readingMinutes: number;
  slug: string;
  sources: Source[];
  status: Status;
  summary: string;
  tags: string;
  title: string;
};
export type UpdateValues = <Key extends keyof EditorValues>(
  key: Key,
  value: EditorValues[Key]
) => void;

function initialDocument(): ArticleDocument {
  return {
    blocks: [
      {
        content: [
          {
            id: crypto.randomUUID(),
            text: "Start writing your argument here…",
            type: "text",
          },
        ],
        id: crypto.randomUUID(),
        type: "paragraph",
      },
    ],
    schemaVersion: 1,
  };
}

export function initialEditorValues(): EditorValues {
  return {
    contentWarning: "",
    document: initialDocument(),
    finding: "",
    placements: [
      {
        collectionKey: "evidence",
        corpusKey: "bible",
        editorId: crypto.randomUUID(),
        isPrimary: true,
        position: 0,
      },
    ],
    readingMinutes: 1,
    slug: "",
    sources: [],
    status: "draft",
    summary: "",
    tags: "",
    title: "",
  };
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

export function sourcesForSave(sources: Source[]) {
  return sources.flatMap(({ publisher, title, url }) =>
    title || publisher || url ? [{ publisher, title, url }] : []
  );
}

export function ensurePrimaryPlacements(placements: Placement[]): Placement[] {
  return placements.map((placement, index) => ({
    ...placement,
    isPrimary:
      placements.findIndex(
        (candidate) => candidate.corpusKey === placement.corpusKey
      ) === index
        ? !placements.some(
            (candidate, candidateIndex) =>
              candidateIndex !== index &&
              candidate.corpusKey === placement.corpusKey &&
              candidate.isPrimary
          )
        : placement.isPrimary,
  }));
}
