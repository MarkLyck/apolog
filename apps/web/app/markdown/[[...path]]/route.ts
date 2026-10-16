import { resolveCorpus } from "@apolog/shared";
import * as Effect from "effect/Effect";
import type { NextRequest } from "next/server";

import { getArticle, getFeatured } from "@/lib/data";
import {
  articleMarkdown,
  homeMarkdown,
  markdownResponse,
  notFoundMarkdown,
} from "@/lib/markdown";
import { matchRoute } from "@/lib/markdown-routes";
import type { MarkdownRoute } from "@/lib/markdown-routes";

const renderers = {
  "/": async (_params, request) => {
    const corpusKey = resolveCorpus(
      request.nextUrl.searchParams.get("text"),
      request.cookies.get("apolog-text")?.value
    );
    return homeMarkdown(
      corpusKey,
      await Effect.runPromise(getFeatured(corpusKey))
    );
  },
  "/articles/[slug]": async ({ slug }) => {
    const article =
      slug === undefined ? null : await Effect.runPromise(getArticle(slug));
    return article ? articleMarkdown(article) : null;
  },
} satisfies Record<
  MarkdownRoute,
  (
    params: Partial<Record<string, string>>,
    request: NextRequest
  ) => Promise<string | null>
>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const pathname = `/${((await params).path ?? []).join("/")}`;
  const match = matchRoute(pathname);
  const body =
    match?.route.kind === "markdown"
      ? await renderers[match.route.pattern](match.params, request)
      : null;
  return body === null
    ? markdownResponse(notFoundMarkdown(pathname), 404)
    : markdownResponse(body);
}
