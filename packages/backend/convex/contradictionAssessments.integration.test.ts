import { describe, expect, test } from "bun:test";

import { articleContentSchema, parseArticleListResponse } from "@apolog/shared";
import { convexTest } from "convex-test";
import * as v from "valibot";

import { projectArticle } from "../src/article-projection";
import fixtures from "../src/fixtures/assessment-articles.json";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./articles.ts": () => import("./articles"),
  "./search.ts": () => import("./search"),
  "./home.ts": () => import("./home"),
};
const articles = v.parse(v.array(articleContentSchema), fixtures);

describe("public contradiction assessments", () => {
  test("detail, pagination, search, and home agree without changing stored ranks", async () => {
    const t = convexTest(schema, modules);
    const ids = await t.run(async (ctx) => {
      const created = [];
      for (const content of articles) {
        const { placements, tags, ...article } = content;
        const articleId = await ctx.db.insert("articles", {
          ...article,
          importKey: article.slug,
          status: "published",
          version: 1,
        });
        const stored = await ctx.db.get(articleId);
        if (!stored) {
          throw new Error("Missing seeded article");
        }
        const projection = projectArticle(content);
        for (const placement of placements) {
          const common = {
            articleId,
            corpusKey: placement.corpusKey,
            collectionKey: placement.collectionKey,
            comparisonReferences: projection.comparisonReferences,
            position: placement.position,
            status: "published" as const,
            tags,
            updatedAt: article.updatedAt,
          };
          await ctx.db.insert("articlePlacements", {
            ...common,
            articleCreatedAt: stored._creationTime,
            isPrimary: placement.isPrimary,
            publishedAt: article.publishedAt,
          });
          await ctx.db.insert("searchDocuments", {
            ...common,
            title: article.title,
            summary: article.summary,
            searchText: projection.searchText,
            sourceCreatedAt: stored._creationTime,
          });
        }
        created.push(articleId);
      }
      return created;
    });
    const args = {
      collectionKey: "contradictions" as const,
      corpusKey: "bible" as const,
      paginationOpts: { cursor: null, numItems: 24 },
      sort: "ranked" as const,
    };
    const before = await t.query(api.articles.list, args);
    expect(before.page.map((article) => article.position)).toEqual([1, 164]);
    expect(parseArticleListResponse({ results: before.page })).toEqual(
      before.page
    );
    for (const item of before.page) {
      const detail = await t.query(api.articles.getBySlug, { slug: item.slug });
      expect(detail?.assessment).toEqual(item.assessment);
      expect(item.assessment?.status).toBe("reviewed");
    }
    const search = await t.query(api.search.keywordArticles, {
      corpusKey: "bible",
      collectionKey: "contradictions",
      query: "creation",
      limit: 24,
    });
    expect(
      search.find((item) => item?.slug === "bible-accounts")?.assessment
    ).toMatchObject({
      status: "reviewed",
      kind: "interpretive",
      importance: 5,
    });
    const searchPage = await t.query(api.search.collectionPage, {
      corpusKey: "bible",
      collectionKey: "contradictions",
      query: "creation",
      paginationOpts: { cursor: null, numItems: 24 },
    });
    expect(searchPage.page[0]?.assessment).toEqual(search[0]?.assessment);
    const home = await t.query(api.home.getFeatured, { corpusKey: "bible" });
    expect(home.contradictions.map((item) => item.assessment)).toEqual(
      before.page.map((item) => item.assessment)
    );
    const id = ids[0];
    if (!id) {
      throw new Error("Missing fixture ID");
    }
    await t.run((ctx) => ctx.db.patch(id, { summary: "Changed argument" }));
    const after = await t.query(api.articles.list, args);
    expect(after.page[0]?.assessment).toEqual({ status: "changed" });
    expect(after.page.map((article) => article.position)).toEqual(
      before.page.map((article) => article.position)
    );
  });
});
