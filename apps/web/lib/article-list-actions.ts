"use server";

import { api } from "@apolog/backend/api";
import { parseCollection, parseCorpus } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

import {
  ARTICLE_LIST_PAGE_SIZE,
  parseArticleListBrowseSort,
} from "./article-list";

export async function loadMoreArticles(input: {
  collectionKey: string;
  corpusKey: string;
  cursor: string;
  sort: string;
}) {
  const collectionKey = parseCollection(input.collectionKey);
  const corpusKey = parseCorpus(input.corpusKey);
  const sort = parseArticleListBrowseSort(input.sort);
  const cursor = input.cursor.trim();
  if (
    collectionKey === null ||
    corpusKey === null ||
    sort === null ||
    !cursor
  ) {
    throw new Error("Invalid article list request.");
  }
  const result = await fetchQuery(api.articles.list, {
    collectionKey,
    corpusKey,
    paginationOpts: { cursor, numItems: ARTICLE_LIST_PAGE_SIZE },
    sort,
  });
  return {
    articles: result.page,
    continueCursor: result.continueCursor,
    isDone: result.isDone,
  };
}
