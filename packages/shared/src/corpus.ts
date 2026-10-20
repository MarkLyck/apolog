export const corpusKeys = ["bible", "quran"] as const;

export type CorpusKey = (typeof corpusKeys)[number];

export const defaultCorpus: CorpusKey = "bible";

export function parseCorpus(
  value: string | null | undefined
): CorpusKey | null {
  return value === "bible" || value === "quran" ? value : null;
}

export function corpusFromSearch(value: string | null | undefined): CorpusKey {
  return parseCorpus(value) ?? defaultCorpus;
}

export function withCorpus(path: string, corpusKey: CorpusKey): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const pathAndQuery = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const [pathname = "/", query = ""] = pathAndQuery.split("?", 2);
  const parameters = new URLSearchParams(query);
  if (corpusKey === defaultCorpus) {
    parameters.delete("text");
  } else {
    parameters.set("text", corpusKey);
  }
  const serialized = parameters.toString();
  return `${serialized ? `${pathname}?${serialized}` : pathname}${hash}`;
}

export function corpusLabel(corpusKey: CorpusKey): "Bible" | "Quran" {
  return corpusKey === "bible" ? "Bible" : "Quran";
}
