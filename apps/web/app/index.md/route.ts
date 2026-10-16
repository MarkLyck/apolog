import { resolveCorpus } from "@apolog/shared";
import * as Effect from "effect/Effect";
import type { NextRequest } from "next/server";

import { getFeatured } from "@/lib/data";
import { homeMarkdown, markdownResponse } from "@/lib/markdown";

export async function GET(request: NextRequest) {
  const corpusKey = resolveCorpus(
    request.nextUrl.searchParams.get("text"),
    request.cookies.get("apolog-text")?.value
  );
  const featured = await Effect.runPromise(getFeatured(corpusKey));
  return markdownResponse(homeMarkdown(corpusKey, featured));
}
