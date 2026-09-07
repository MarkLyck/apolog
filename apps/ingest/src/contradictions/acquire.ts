import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import * as v from "valibot";

const origin = "https://www.skepticsannotatedbible.com";
const indexUrl = `${origin}/first/contra2_list.html`;
const bibleUrl =
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json";

const bibleSchema = v.object({
  translation: v.string(),
  books: v.array(
    v.object({
      name: v.string(),
      edition: v.optional(v.string(), "King James Version"),
      chapters: v.array(
        v.object({
          chapter: v.number(),
          verses: v.array(v.object({ verse: v.number(), text: v.string() })),
        })
      ),
    })
  ),
});

const catalogEntrySchema = v.object({
  path: v.string(),
  title: v.string(),
  position: v.number(),
  groups: v.array(
    v.object({
      label: v.string(),
      references: v.array(v.object({ text: v.string(), href: v.string() })),
    })
  ),
});
export type CatalogEntry = v.InferOutput<typeof catalogEntrySchema>;
export type Bible = v.InferOutput<typeof bibleSchema>;

function cleanText(text: string) {
  return text.replaceAll(/\s+/gu, " ").trim();
}

async function cachedFetch(url: string, directory: string) {
  await mkdir(directory, { recursive: true });
  const file = Bun.file(
    path.join(
      directory,
      `${createHash("sha256").update(url).digest("hex")}.txt`
    )
  );
  if (await file.exists()) {
    return file.text();
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: { "user-agent": "ApologPassageImporter/2.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.ok) {
      const text = await response.text();
      await Bun.write(file, text);
      return text;
    }
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }
    await Bun.sleep(1000 * (attempt + 1));
  }
  throw new Error(`Fetch failed after three attempts: ${url}`);
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

export async function acquire(directory: string) {
  const cache = path.join(directory, "cache");
  const entries = parseIndex(await cachedFetch(indexUrl, cache));
  const bible = v.parse(
    bibleSchema,
    JSON.parse(await cachedFetch(bibleUrl, cache))
  );
  const apocrypha = v.parse(
    bibleSchema,
    JSON.parse(
      await cachedFetch(bibleUrl.replace("KJV.json", "DRC.json"), cache)
    )
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
      .map((book) => ({ ...book, edition: "Douay-Rheims, Challoner revision" }))
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
    const results = await Promise.allSettled(
      entries.slice(start, start + 4).map(async (entry) => {
        const html = await cachedFetch(new URL(entry.path, origin).href, cache);
        return {
          ...entry,
          title:
            cleanText(load(html)(".contra h2").first().text()) || entry.title,
          groups: parseDetail(html),
        };
      })
    );
    for (const [offset, result] of results.entries()) {
      if (result.status === "fulfilled") {
        catalog.push(result.value);
      } else {
        failures.push({
          path: entries[start + offset]?.path ?? "",
          error: String(result.reason),
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
}
