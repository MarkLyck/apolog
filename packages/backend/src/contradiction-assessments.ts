import type { ContradictionAssessment } from "@apolog/shared";
import { reviewedContradictionSchema } from "@apolog/shared/contradiction-assessment";
import * as Schema from "effect/Schema";

import { assessmentSourceDigest } from "./assessment-source";
import type { AssessmentSource } from "./assessment-source";
import manifest from "./contradiction-assessments.json";

const reviewManifestSchema = Schema.mutable(
  Schema.Array(
    Schema.Struct({
      slug: Schema.String,
      sourceDigest: Schema.String.check(Schema.isPattern(/^[a-f0-9]{64}$/u)),
      ...reviewedContradictionSchema.fields,
    })
  )
).check(
  Schema.makeFilter((entries) =>
    new Set(entries.map((entry) => entry.slug)).size === entries.length
      ? undefined
      : "Assessment slugs must be unique"
  )
);

const reviews = new Map(
  Schema.decodeUnknownSync(reviewManifestSchema)(manifest).map((entry) => [
    entry.slug,
    entry,
  ])
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
