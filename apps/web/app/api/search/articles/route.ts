import { parseCorpus } from "@apolog/shared";
import * as Effect from "effect/Effect";
import { NextResponse } from "next/server";

import { searchArticles } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const corpusKey = parseCorpus(url.searchParams.get("text"));
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!corpusKey || query.length < 2 || query.length > 200) {
    return NextResponse.json(
      { error: "Invalid search parameters." },
      { status: 400 }
    );
  }
  const hits = await Effect.runPromise(searchArticles(corpusKey, query, 12));
  return NextResponse.json(
    { results: hits },
    { headers: { "Cache-Control": "private, max-age=15" } }
  );
}
