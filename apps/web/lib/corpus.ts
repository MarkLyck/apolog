import { corpusFromSearch } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";

export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export function firstSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function getPageCorpus(
  searchParams: PageSearchParams
): Promise<CorpusKey> {
  const parameters = await searchParams;
  return corpusFromSearch(
    Array.isArray(parameters.text) ? parameters.text[0] : parameters.text
  );
}
