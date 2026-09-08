"use server";

import { api } from "@apolog/backend/api";
import type { CorpusKey } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

export async function loadContradictions({
  corpusKey,
  cursor,
  query = "",
}: {
  corpusKey: CorpusKey;
  cursor: string | null;
  query?: string;
}) {
  if (query.trim()) {
    return fetchQuery(api.search.collectionPage, {
      collectionKey: "contradictions",
      corpusKey,
      query,
      paginationOpts: { cursor, numItems: 24 },
    });
  }
  return fetchQuery(api.articles.list, {
    collectionKey: "contradictions",
    corpusKey,
    paginationOpts: { cursor, numItems: 24 },
    sort: "ranked",
  });
}
