import { parseCorpus, resolveCorpus, withCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export function firstSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// `?text=` selects different content, so it stays in the canonical exactly as
// the sitemap lists it; every other parameter (search, sort) is dropped.
export async function corpusCanonical(
  path: `/${string}`,
  searchParams: PageSearchParams
): Promise<string> {
  const corpusKey = parseCorpus(firstSearchParam((await searchParams).text));
  return corpusKey ? withCorpus(path, corpusKey) : path;
}

export function corpusPageMetadata(
  path: `/${string}`,
  metadata: Metadata,
  markdownPath?: `/${string}`
) {
  return async ({
    searchParams,
  }: {
    searchParams: PageSearchParams;
  }): Promise<Metadata> => ({
    ...metadata,
    alternates: {
      canonical: await corpusCanonical(path, searchParams),
      ...(markdownPath && {
        types: {
          "text/markdown": await corpusCanonical(markdownPath, searchParams),
        },
      }),
    },
  });
}

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
