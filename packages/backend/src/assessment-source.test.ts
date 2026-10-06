import { describe, expect, test } from "bun:test";

import { assessmentSourceDigest } from "./assessment-source";
import type { AssessmentSource } from "./assessment-source";

const image = {
  alt: "A square Earth blueprint",
  caption: "Creation needs geometry",
  id: "meme",
  src: "https://example.com/meme.png",
  type: "image",
} satisfies AssessmentSource["document"]["blocks"][number];
const article = {
  document: { schemaVersion: 1, blocks: [image] },
  summary: "The Bible's Earth geometry",
  title: "Corners of creation",
} satisfies AssessmentSource;

describe("image assessment source", () => {
  test.each([
    { src: "https://example.com/revised.png" },
    { alt: "A globe next to a square blueprint" },
    { caption: "Revised caption" },
    { caption: undefined },
  ])(
    "invalidates the digest when an image's meaning changes %j",
    async (change) => {
      expect(
        await assessmentSourceDigest({
          ...article,
          document: { schemaVersion: 1, blocks: [{ ...image, ...change }] },
        })
      ).not.toBe(await assessmentSourceDigest(article));
    }
  );

  test("ignores regenerated image IDs", async () => {
    expect(
      await assessmentSourceDigest({
        ...article,
        document: {
          schemaVersion: 1,
          blocks: [{ ...image, id: "regenerated-image" }],
        },
      })
    ).toBe(await assessmentSourceDigest(article));
  });
});
