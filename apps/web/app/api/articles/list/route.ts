import { parseCollection, parseCorpus } from "@apolog/shared";
import { NextResponse } from "next/server";

import { parseArticleListBrowseSort } from "@/lib/article-list";
import { listArticlePage } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const collectionKey = parseCollection(url.searchParams.get("collection"));
  const corpusKey = parseCorpus(url.searchParams.get("text"));
  const sort = parseArticleListBrowseSort(url.searchParams.get("sort") ?? "");
  const cursor = url.searchParams.get("cursor")?.trim() ?? "";
  if (
    collectionKey === null ||
    corpusKey === null ||
    sort === null ||
    cursor.length === 0
  ) {
    return NextResponse.json(
      { error: "Invalid article list parameters." },
      { status: 400 }
    );
  }
  const page = await listArticlePage(collectionKey, corpusKey, sort, cursor);
  return NextResponse.json(page, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
