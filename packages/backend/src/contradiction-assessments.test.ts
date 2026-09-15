import { describe, expect, test } from "bun:test";

import { articleContentSchema } from "@apolog/shared";
import * as v from "valibot";

import { assessmentSourceDigest } from "./assessment-source";
import { getContradictionAssessment } from "./contradiction-assessments";
import manifest from "./contradiction-assessments.json";
import fixtures from "./fixtures/assessment-articles.json";

const articles = v.parse(v.array(articleContentSchema), fixtures);
const creation = articles.find((article) => article.slug === "bible-accounts");
const age = articles.find((article) => article.slug === "bible-ahaziah-age");
if (!creation || !age) {
  throw new Error("Missing assessment fixtures");
}

describe("reviewed contradiction assessments", () => {
  test("keeps importance separate from inference and ignores ranking", async () => {
    expect(await getContradictionAssessment(creation)).toMatchObject({
      status: "reviewed",
      kind: "interpretive",
      importance: 5,
    });
    expect(await getContradictionAssessment(age)).toMatchObject({
      status: "reviewed",
      kind: "direct",
      importance: 2,
    });
    const reranked = {
      ...age,
      placements: age.placements.map((placement) => ({
        ...placement,
        position: 1,
      })),
    };
    expect(await getContradictionAssessment(reranked)).toEqual(
      await getContradictionAssessment(age)
    );
  });
  test("withholds old judgments when text or translation changes", async () => {
    expect(
      await getContradictionAssessment({
        ...age,
        summary: "A revised argument.",
      })
    ).toEqual({ status: "changed" });
    expect(
      await getContradictionAssessment({
        ...age,
        document: {
          ...age.document,
          blocks: age.document.blocks.map((block) =>
            block.type === "quote"
              ? { ...block, edition: "Different translation" }
              : block
          ),
        },
      })
    ).toEqual({ status: "changed" });
    expect(
      await getContradictionAssessment({ ...age, slug: "new-article" })
    ).toEqual({ status: "unreviewed" });
  });
  test("formatting and regenerated IDs do not invalidate an assessment", async () => {
    const restyled = {
      ...age,
      document: {
        ...age.document,
        blocks: age.document.blocks.map((block) =>
          block.type === "quote"
            ? {
                ...block,
                id: `${block.id}-new`,
                content: [
                  {
                    id: "whole-quote",
                    text: block.content.map((node) => node.text).join(""),
                    type: "text" as const,
                  },
                ],
              }
            : block
        ),
      },
    };
    expect(await assessmentSourceDigest(restyled)).toBe(
      await assessmentSourceDigest(age)
    );
    expect(await getContradictionAssessment(restyled)).toEqual(
      await getContradictionAssessment(age)
    );
  });
  test("contains one explicit assessment for each previously reviewed article", () => {
    expect(new Set(manifest.map((review) => review.slug)).size).toBe(567);
    expect(manifest).toHaveLength(567);
    expect(
      manifest.filter((review) => review.kind === "not-demonstrated")
    ).toHaveLength(147);
  });
});
