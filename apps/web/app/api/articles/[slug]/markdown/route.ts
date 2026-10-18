import { articleMarkdown } from "@apolog/shared/article-markdown";
import * as Effect from "effect/Effect";

import { getArticle } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await Effect.runPromise(getArticle(slug));
  if (!article) {
    return new Response("Article not found.\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: 404,
    });
  }
  return new Response(
    articleMarkdown(article, `${siteConfig.url}/articles/${slug}`),
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": "text/markdown; charset=utf-8",
      },
    }
  );
}
