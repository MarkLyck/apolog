export const corpusKeys = ["bible", "quran"] as const;

export type CorpusKey = (typeof corpusKeys)[number];

export function parseCorpus(
  value: string | null | undefined
): CorpusKey | null {
  return value === "bible" || value === "quran" ? value : null;
}

export function resolveCorpus(
  urlValue: string | null | undefined,
  cookieValue: string | null | undefined
): CorpusKey {
  return parseCorpus(urlValue) ?? parseCorpus(cookieValue) ?? "bible";
}

export function withCorpus(path: string, corpusKey: CorpusKey): string {
  const [pathname = "/", query = ""] = path.split("?", 2);
  const parameters = new URLSearchParams(query);
  parameters.set("text", corpusKey);
  const serialized = parameters.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function corpusLabel(corpusKey: CorpusKey): "Bible" | "Quran" {
  return corpusKey === "bible" ? "Bible" : "Quran";
}
