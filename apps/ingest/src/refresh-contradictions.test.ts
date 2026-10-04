import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { articleContentSchema } from "@apolog/shared/content";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { acquireEffect, parseDetail } from "./contradictions/acquire";
import { buildArticle } from "./contradictions/build";
import bible from "./contradictions/fixtures/creation-bible.json";
import { refreshContradictions } from "./refresh-contradictions";

const origin = "https://www.skepticsannotatedbible.com";
const bibleUrl =
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json";
const detail =
  '<div class="contra"><h2>Compare passages</h2><a href="/gen/1.html#1">Genesis 1:1</a><a href="/jn/1.html#6">John 1:6</a></div>';

async function withDirectory(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(path.join(tmpdir(), "apolog-prepare-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function cache(directory: string, url: string, text: string) {
  await Bun.write(
    path.join(
      directory,
      "cache",
      `${createHash("sha256").update(url).digest("hex")}.txt`
    ),
    text
  );
}

function preparedArticles() {
  const article = buildArticle(
    {
      groups: parseDetail(detail),
      path: "/contra/example.html",
      title: "Compare passages",
      position: 1,
    },
    bible,
    1000
  );
  return Array.from({ length: 500 }, (_, index) => ({
    ...article,
    slug: `comparison-${index}`,
  }));
}

describe("contradiction refresh", () => {
  test("collects detail failures and refuses to mark an incomplete import valid", async () => {
    await withDirectory(async (directory) => {
      await mkdir(path.join(directory, "cache"));
      const entries = Array.from(
        { length: 500 },
        (_, index) => `/contra/item-${index}.html`
      );
      await cache(
        directory,
        `${origin}/first/contra2_list.html`,
        `<ul class="list">${entries.map((entry) => `<li><a href="${entry}">Compare passages</a></li>`).join("")}</ul>`
      );
      await cache(directory, bibleUrl, JSON.stringify(bible));
      await cache(
        directory,
        bibleUrl.replace("KJV.json", "DRC.json"),
        JSON.stringify({ translation: "extra", books: [] })
      );
      await Promise.all(
        entries.map((entry, index) =>
          cache(
            directory,
            `${origin}${entry}`,
            index === 499 ? "missing body" : detail
          )
        )
      );
      const acquisition = await Effect.runPromise(acquireEffect(directory));
      expect(acquisition.indexed).toBe(500);
      expect(acquisition.catalog).toHaveLength(499);
      expect(acquisition.failures).toEqual([
        {
          path: "/contra/item-499.html",
          error: expect.stringContaining("Missing contradiction detail body"),
        },
      ]);
      await expect(
        Effect.runPromise(refreshContradictions("prepare", directory))
      ).rejects.toThrow("Incomplete scrape");
      const report = Schema.decodeUnknownSync(
        Schema.Struct({
          valid: Schema.Boolean,
          errors: Schema.Array(
            Schema.Struct({ path: Schema.String, error: Schema.String })
          ),
        })
      )(await Bun.file(path.join(directory, "report.json")).json());
      const prepared = Schema.decodeUnknownSync(
        Schema.Struct({
          valid: Schema.Boolean,
          digest: Schema.String,
          articles: Schema.Array(articleContentSchema),
        })
      )(await Bun.file(path.join(directory, "prepared.json")).json());
      expect(report.valid).toBe(false);
      expect(report.errors).toHaveLength(1);
      expect(prepared.valid).toBe(false);
      expect(prepared.digest).toBe(
        createHash("sha256")
          .update(JSON.stringify(prepared.articles))
          .digest("hex")
      );
    });
  });

  test("rejects a modified prepared file before accessing the deployment", async () => {
    await withDirectory(async (directory) => {
      const articles = preparedArticles();
      const digest = createHash("sha256")
        .update(JSON.stringify(articles))
        .digest("hex");
      const first = articles[0];
      if (!first) {
        throw new Error("Missing fixture article");
      }
      first.title = "Modified after preparation";
      await Bun.write(
        path.join(directory, "prepared.json"),
        JSON.stringify({ valid: true, digest, articles })
      );
      await expect(
        Effect.runPromise(refreshContradictions("verify", directory))
      ).rejects.toThrow("do not match their digest");
    });
  });
});
