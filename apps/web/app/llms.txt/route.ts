import * as Effect from "effect/Effect";

import { listArticlesByCollection } from "@/lib/data";
import { llmsTxt } from "@/lib/llms-txt";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const collections = await Effect.runPromise(
    listArticlesByCollection((collectionKey) =>
      collectionKey === "contradictions" ? "ranked" : "newest"
    )
  );
  return new Response(
    llmsTxt({
      collections,
      description: siteConfig.description,
      name: siteConfig.name,
      siteUrl: siteConfig.url,
    }),
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "text/markdown; charset=utf-8",
      },
    }
  );
}
