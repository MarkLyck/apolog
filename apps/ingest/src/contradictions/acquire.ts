import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";

const forEachEffect = Effect.forEach;

const origin = "https://www.skepticsannotatedbible.com";
const indexUrl = `${origin}/first/contra2_list.html`;
const bibleUrl =
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json";

const bibleSchema = Schema.Struct({
  translation: Schema.String,
  books: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        name: Schema.mutableKey(Schema.String),
        edition: Schema.String.pipe(
          Schema.withDecodingDefault(Effect.succeed("King James Version"))
        ),
        chapters: Schema.Array(
          Schema.Struct({
            chapter: Schema.Number,
            verses: Schema.Array(
              Schema.Struct({ verse: Schema.Number, text: Schema.String })
            ),
          })
        ),
      })
    )
  ),
});

const catalogEntrySchema = Schema.Struct({
  path: Schema.String,
  title: Schema.String,
  position: Schema.Number,
  groups: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        label: Schema.String,
        references: Schema.mutable(
          Schema.Array(
            Schema.Struct({ text: Schema.String, href: Schema.String })
          )
        ),
      })
    )
  ),
});
export type CatalogEntry = typeof catalogEntrySchema.Type;
export type Bible = typeof bibleSchema.Type;

const AcquisitionIoError = Data.TaggedError("AcquisitionIoError")<{
  operation: string;
  cause: unknown;
  message: string;
}>;

const AcquisitionParseError = Data.TaggedError("AcquisitionParseError")<{
  url: string;
  cause: unknown;
  message: string;
}>;

const AcquisitionHttpError = Data.TaggedError("AcquisitionHttpError")<{
  url: string;
  status: number;
  message: string;
}>;

function ioError(operation: string, cause: unknown) {
  return new AcquisitionIoError({
    operation,
    cause,
    message: `${operation}: ${String(cause)}`,
  });
}

function cleanText(text: string) {
  return text.replaceAll(/\s+/gu, " ").trim();
}

export function cachedFetch(url: string, directory: string) {
  return Effect.gen(function* cachedFetchProgram() {
    yield* Effect.tryPromise({
      try: () => mkdir(directory, { recursive: true }),
      catch: (cause) => ioError(`Create cache ${directory}`, cause),
    });
    const file = Bun.file(
      path.join(
        directory,
        `${createHash("sha256").update(url).digest("hex")}.txt`
      )
    );
    const exists = yield* Effect.tryPromise({
      try: () => file.exists(),
      catch: (cause) => ioError(`Check cache ${url}`, cause),
    });
    if (exists) {
      return yield* Effect.tryPromise({
        try: () => file.text(),
        catch: (cause) => ioError(`Read cache ${url}`, cause),
      });
    }
    const request = Effect.tryPromise({
      try: async (signal) => {
        const response = await fetch(url, {
          headers: { "user-agent": "ApologPassageImporter/2.0" },
          signal,
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new AcquisitionHttpError({
            url,
            status: response.status,
            message: `HTTP ${response.status}: ${url}`,
          });
        }
        return response.text();
      },
      catch: (cause) =>
        cause instanceof AcquisitionHttpError
          ? cause
          : ioError(`Fetch ${url}`, cause),
    }).pipe(
      Effect.timeout("30 seconds"),
      Effect.retry({
        schedule: Schedule.recurs(2).pipe(
          Schedule.addDelay(({ output }) => Effect.succeed(1000 * (output + 1)))
        ),
        while: (error) =>
          error._tag === "AcquisitionHttpError" &&
          (error.status === 429 || error.status >= 500),
      })
    );
    const text = yield* request;
    yield* Effect.tryPromise({
      try: () => Bun.write(file, text),
      catch: (cause) => ioError(`Write cache ${url}`, cause),
    });
    return text;
  });
}

function parseIndex(html: string) {
  const $ = load(html);
  const entries = $(".list li a[href^='/contra/']")
    .toArray()
    .map((element, index) => ({
      path: $(element).attr("href") ?? "",
      title: cleanText($(element).text()),
      position: index + 1,
    }));
  if (
    entries.length < 500 ||
    entries.length !== $(".list li").length ||
    new Set(entries.map((entry) => entry.path)).size !== entries.length
  ) {
    throw new Error(
      `Index incomplete or duplicated: ${entries.length} entries`
    );
  }
  return entries;
}

export function parseDetail(html: string): CatalogEntry["groups"] {
  const $ = load(html);
  const body = $(".contra").first();
  if (body.length !== 1) {
    throw new Error("Missing contradiction detail body");
  }
  const groups: CatalogEntry["groups"] = [];
  let group: CatalogEntry["groups"][number] = { label: "", references: [] };
  for (const element of body.find("h3, a").toArray()) {
    const node = $(element);
    if (element.tagName === "h3") {
      if (group.references.length > 0) {
        groups.push(group);
      }
      group = { label: cleanText(node.text()), references: [] };
      continue;
    }
    if (node.parents("h3").length > 0) {
      continue;
    }
    const href = node.attr("href") ?? "";
    if (!/\/\w+\/\d+\.html(?:#|$)/u.test(href) || href.includes("/contra/")) {
      continue;
    }
    const reference = { href, text: cleanText(node.text()) };
    if (
      !group.references.some(
        (existing) => existing.href === href && existing.text === reference.text
      )
    ) {
      group.references.push(reference);
    }
  }
  if (group.references.length > 0) {
    groups.push(group);
  }
  if (groups.length === 1 && groups[0]) {
    return groups[0].references.map((reference) => ({
      label: "",
      references: [reference],
    }));
  }
  if (groups.length < 2) {
    throw new Error("Fewer than two passage groups");
  }
  return groups;
}

export function acquireEffect(directory: string) {
  return Effect.gen(function* acquireProgram() {
    const cache = path.join(directory, "cache");
    const index = yield* cachedFetch(indexUrl, cache);
    const entries = yield* Effect.try({
      try: () => parseIndex(index),
      catch: (cause) =>
        new AcquisitionParseError({
          url: indexUrl,
          cause,
          message: String(cause),
        }),
    });
    const readBible = (url: string) =>
      Effect.gen(function* readBibleProgram() {
        const text = yield* cachedFetch(url, cache);
        return yield* Schema.decodeUnknownEffect(
          Schema.fromJsonString(bibleSchema)
        )(text);
      });
    const bible = yield* readBible(bibleUrl);
    const apocrypha = yield* readBible(
      bibleUrl.replace("KJV.json", "DRC.json")
    );
    const extraBooks = new Set([
      "Tobit",
      "Judith",
      "Wisdom",
      "Sirach",
      "Baruch",
      "I Maccabees",
      "II Maccabees",
    ]);
    bible.books.push(
      ...apocrypha.books
        .filter((book) => extraBooks.has(book.name))
        .map((book) => ({
          ...book,
          edition: "Douay-Rheims, Challoner revision",
        }))
    );
    for (const book of bible.books) {
      book.name = book.name
        .replace(/^III /u, "3 ")
        .replace(/^II /u, "2 ")
        .replace(/^I /u, "1 ")
        .replace("Revelation of John", "Revelation")
        .replace("Sirach", "Ecclesiasticus");
    }
    const catalog: CatalogEntry[] = [];
    const failures: { path: string; error: string }[] = [];
    for (let start = 0; start < entries.length; start += 4) {
      const results = yield* forEachEffect(
        (entry: ReturnType<typeof parseIndex>[number]) =>
          Effect.gen(function* detailProgram() {
            const url = new URL(entry.path, origin).href;
            const html = yield* cachedFetch(url, cache);
            return yield* Effect.try({
              try: () => ({
                ...entry,
                title:
                  cleanText(load(html)(".contra h2").first().text()) ||
                  entry.title,
                groups: parseDetail(html),
              }),
              catch: (cause) =>
                new AcquisitionParseError({
                  url,
                  cause,
                  message: String(cause),
                }),
            });
          }).pipe(Effect.result),
        { concurrency: 4 }
      )(entries.slice(start, start + 4));
      for (const [offset, result] of results.entries()) {
        if (Result.isSuccess(result)) {
          catalog.push(result.success);
        } else {
          failures.push({
            path: entries[start + offset]?.path ?? "",
            error: String(result.failure),
          });
        }
      }
      if (start % 40 === 0) {
        process.stderr.write(
          `Fetched ${Math.min(start + 4, entries.length)}/${entries.length}\n`
        );
      }
    }
    return { bible, catalog, failures, indexed: entries.length };
  });
}
