import * as v from "valibot";

export const contradictionKinds = {
  direct: {
    label: "Direct contradiction",
    description:
      "The quoted passages make incompatible claims about the same subject under the same conditions. Little additional inference is needed.",
  },
  interpretive: {
    label: "Interpretive tension",
    description:
      "The passages pull in different directions, but the conflict depends on how their wording, scope, or narrative context is read.",
  },
  weak: {
    label: "Weak tension",
    description:
      "The alleged conflict needs substantial assumptions, such as treating an omission as a denial or figurative language as literal.",
  },
  "not-demonstrated": {
    label: "Weak contradiction",
    description:
      "The supplied passages do not establish incompatible claims. Different events, meanings, or conditions may account for the difference.",
  },
} as const;

export const contradictionImportance = {
  1: {
    label: "Incidental",
    description: "A small detail with little effect on the wider account.",
  },
  2: {
    label: "Minor",
    description: "A local detail in a story, chronology, or inventory.",
  },
  3: {
    label: "Supporting",
    description: "A supporting event, teaching, or biographical claim.",
  },
  4: {
    label: "Major",
    description: "A major event or claim with wider implications.",
  },
  5: {
    label: "Foundational",
    description:
      "A central claim about origins, salvation, divine justice, or religious authority.",
  },
} as const;

export const reviewedContradictionSchema = v.object({
  kind: v.picklist(["direct", "interpretive", "weak", "not-demonstrated"]),
  importance: v.picklist([1, 2, 3, 4, 5]),
  reason: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export const contradictionAssessmentSchema = v.variant("status", [
  v.object({
    status: v.literal("reviewed"),
    ...reviewedContradictionSchema.entries,
  }),
  v.object({ status: v.literal("unreviewed") }),
  v.object({ status: v.literal("changed") }),
]);

export type ContradictionAssessment = v.InferOutput<
  typeof contradictionAssessmentSchema
>;
