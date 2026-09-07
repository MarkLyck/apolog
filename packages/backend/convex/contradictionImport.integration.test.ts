import { describe, expect, test } from "bun:test";

import { articleContentSchema } from "@apolog/shared";
import { contentFixtures } from "@apolog/shared/demo-content";
import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import * as v from "valibot";

import { projectArticle } from "../src/article-projection";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./articles.ts": () => import("./articles"),
  "./seed.ts": () => import("./seed"),
  "./contradictionImport.ts": () => import("./contradictionImport"),
};
const replace = makeFunctionReference<"mutation">(
  "contradictionImport:replace"
);
const snapshot = makeFunctionReference<"query">("contradictionImport:snapshot");
const seed = makeFunctionReference<"mutation">("seed:seed");
const digest = "a".repeat(64);
const artifact = process.env.APOLOG_CONTRADICTION_ARTIFACT;
const articles = artifact
  ? v.parse(
      v.object({ articles: v.array(articleContentSchema) }),
      await Bun.file(artifact).json()
    ).articles
  : Array.from({ length: 500 }, (_, index) =>
      v.parse(articleContentSchema, {
        title: `Comparison ${index}`,
        slug: `comparison-${index}`,
        summary: "Compare the quoted passages.",
        document: {
          schemaVersion: 1,
          blocks: [
            {
              id: "a",
              type: "quote",
              reference: "Genesis 1:1",
              edition: "KJV",
              content: [
                {
                  id: "at",
                  type: "text",
                  text: "In the beginning God created the heaven and the earth.",
                },
              ],
            },
            {
              id: "b",
              type: "quote",
              reference: "John 1:3",
              edition: "KJV",
              content: [
                {
                  id: "bt",
                  type: "text",
                  text: "All things were made by him; and without him was not any thing made that was made.",
                },
              ],
            },
          ],
        },
        sources: [],
        tags: ["contradiction"],
        readingMinutes: 1,
        publishedAt: 1000,
        updatedAt: 1000,
        placements: [
          {
            collectionKey: "contradictions",
            corpusKey: "bible",
            isPrimary: true,
            position: index + 1,
          },
        ],
      })
    );

describe("atomic contradiction replacement", () => {
  test("replaces old rows and relations, keeps other articles, and can be rerun", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const before = await t.query(snapshot, {});
    const oldIds = new Set(before.map((article: { id: string }) => article.id));
    const expected = before.map(
      ({ id, version }: { id: string; version: number }) => ({ id, version })
    );
    const result = await t.mutation(replace, { articles, digest, expected });
    expect(result).toEqual({
      deleted: before.length,
      inserted: articles.length,
      unchanged: 0,
    });
    const after = await t.query(snapshot, {});
    expect(after).toHaveLength(articles.length);
    const afterBySlug = new Map(
      after.map((article: { content: { slug: string } }) => [
        article.content.slug,
        article.content,
      ])
    );
    for (const article of articles) {
      expect(afterBySlug.get(article.slug)).toEqual(article);
    }
    await t.run(async (ctx) => {
      const allArticles = await ctx.db.query("articles").collect();
      expect(
        allArticles.filter((article) => oldIds.has(article._id))
      ).toHaveLength(0);
      expect(allArticles).toHaveLength(
        contentFixtures.articles.length - before.length + articles.length
      );
      for (const relation of [
        ...(await ctx.db.query("searchDocuments").collect()),
        ...(await ctx.db.query("articlePlacements").collect()),
        ...(await ctx.db.query("articleTags").collect()),
      ]) {
        expect(oldIds.has(relation.articleId)).toBe(false);
      }
      for (const document of await ctx.db.query("searchDocuments").collect()) {
        if (document.collectionKey !== "contradictions") {
          continue;
        }
        const stored = await ctx.db.get(document.articleId);
        const source = articles.find(
          (article) => article.slug === stored?.slug
        );
        expect(source).toBeDefined();
        if (source) {
          const projected = projectArticle(source);
          expect(document.searchText).toBe(projected.searchText);
          expect(document.comparisonReferences).toEqual(
            projected.comparisonReferences
          );
        }
      }
    });
    expect(await t.mutation(replace, { articles, digest, expected })).toEqual({
      deleted: 0,
      inserted: 0,
      unchanged: articles.length,
    });
  });

  test("rejects stale backups and incomplete imports before changing existing data", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const before = await t.query(snapshot, {});
    await expect(
      t.mutation(replace, { articles, digest, expected: [] })
    ).rejects.toThrow("changed after the backup");
    await expect(
      t.mutation(replace, {
        articles: articles.slice(0, 2),
        digest,
        expected: [],
      })
    ).rejects.toThrow("complete");
    expect(await t.query(snapshot, {})).toEqual(before);
  });
});
