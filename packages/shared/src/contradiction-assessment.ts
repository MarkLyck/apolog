import * as Schema from "effect/Schema";
import * as Struct from "effect/Struct";

export const reviewedContradictionSchema = Schema.Struct({
  kind: Schema.Literals(["direct", "interpretive", "weak", "not-demonstrated"]),
  importance: Schema.Literals([1, 2, 3, 4, 5]),
  reason: Schema.Trim.check(Schema.isMinLength(1)),
}).mapFields(Struct.map(Schema.mutableKey));

export const contradictionAssessmentSchema = Schema.Union([
  Schema.Struct({
    status: Schema.Literal("reviewed"),
    ...reviewedContradictionSchema.fields,
  }).mapFields(Struct.map(Schema.mutableKey)),
  Schema.Struct({ status: Schema.Literal("unreviewed") }).mapFields(
    Struct.map(Schema.mutableKey)
  ),
  Schema.Struct({ status: Schema.Literal("changed") }).mapFields(
    Struct.map(Schema.mutableKey)
  ),
]);

export type ContradictionAssessment = typeof contradictionAssessmentSchema.Type;
