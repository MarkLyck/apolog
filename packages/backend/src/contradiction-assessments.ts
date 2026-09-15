import { reviewedContradictionSchema } from "@apolog/shared";
import type { ContradictionAssessment } from "@apolog/shared";
import * as v from "valibot";

import { assessmentSourceDigest } from "./assessment-source";
import type { AssessmentSource } from "./assessment-source";
import manifest from "./contradiction-assessments.json";

const reviews = new Map(
  v
    .parse(
      v.pipe(
        v.array(
          v.object({
            slug: v.string(),
            sourceDigest: v.pipe(v.string(), v.regex(/^[a-f0-9]{64}$/u)),
            ...reviewedContradictionSchema.entries,
          })
        ),
        v.check(
          (entries) =>
            new Set(entries.map((entry) => entry.slug)).size === entries.length,
          "Assessment slugs must be unique"
        )
      ),
      manifest
    )
    .map((entry) => [entry.slug, entry])
);

export async function getContradictionAssessment(
  article: AssessmentSource & { slug: string }
): Promise<ContradictionAssessment> {
  const review = reviews.get(article.slug);
  if (!review) {
    return { status: "unreviewed" };
  }
  if (review.sourceDigest !== (await assessmentSourceDigest(article))) {
    return { status: "changed" };
  }
  return {
    status: "reviewed",
    kind: review.kind,
    importance: review.importance,
    reason: review.reason,
  };
}
