import { articleContentSchema } from "@apolog/shared";
import * as v from "valibot";

import { getContradictionAssessment } from "../src/contradiction-assessments";
import manifest from "../src/contradiction-assessments.json";

const path = process.argv[2];
if (!path) {
  throw new Error(
    "Usage: bun run contradictions:verify-assessments <article-artifact.json>"
  );
}
const { articles } = v.parse(
  v.object({
    articles: v.pipe(
      v.array(articleContentSchema),
      v.check(
        (items) =>
          new Set(items.map((item) => item.slug)).size === items.length,
        "Duplicate article slugs"
      )
    ),
  }),
  await Bun.file(path).json()
);
const slugs = new Set(articles.map((article) => article.slug));
const missing = manifest
  .filter((review) => !slugs.has(review.slug))
  .map((review) => review.slug);
const results = await Promise.all(
  articles.map(async (article) => ({
    slug: article.slug,
    assessment: await getContradictionAssessment(article),
  }))
);
const unresolved = results.filter(
  (result) => result.assessment.status !== "reviewed"
);
process.stdout.write(
  `${JSON.stringify({ articles: articles.length, reviewed: results.length - unresolved.length, missing, unresolved }, null, 2)}\n`
);
if (missing.length > 0 || unresolved.length > 0) {
  process.exitCode = 1;
}
