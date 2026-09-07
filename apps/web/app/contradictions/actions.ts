"use server";

import { api } from "@apolog/backend/api";
import type { CorpusKey } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

export async function loadContradictions({
  corpusKey,
  cursor,
}: {
  corpusKey: CorpusKey;
  cursor: string | null;
}) {
  return fetchQuery(api.articles.list, {
    collectionKey: "contradictions",
    corpusKey,
    paginationOpts: { cursor, numItems: 24 },
    sort: "ranked",
  });
}
