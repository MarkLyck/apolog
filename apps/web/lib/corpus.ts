import { parseCorpus, resolveCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import { cookies } from "next/headers";

export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export async function getPageCorpus(
  searchParams: PageSearchParams
): Promise<CorpusKey> {
  const [parameters, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);
  const urlValue = Array.isArray(parameters.text)
    ? parameters.text[0]
    : parameters.text;
  return resolveCorpus(
    parseCorpus(urlValue),
    cookieStore.get("apolog-text")?.value
  );
}

export async function getInitialCorpus(): Promise<CorpusKey> {
  const cookieStore = await cookies();
  return resolveCorpus(null, cookieStore.get("apolog-text")?.value);
}
