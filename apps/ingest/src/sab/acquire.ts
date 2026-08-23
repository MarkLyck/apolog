import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SabContradictionEntry } from "@apolog/shared/sab-contradictions";

import { mergeSabEntry, parseSabDetailPage, parseSabListPage } from "./parse";

const LIST_URL =
  "https://www.skepticsannotatedbible.com/first/contra2_list.html";
const USER_AGENT =
  "ApologIngest/1.0 (contradiction catalog; https://github.com/MarkLyck/apolog)";

export type SabAcquireResult = {
  catalog: SabContradictionEntry[];
  failed: { error: string; url: string }[];
};

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return await response.text();
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += concurrency) {
    const chunk = items.slice(start, start + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((item, offset) => worker(item, start + offset))
    );
    results.push(...chunkResults);
  }
  return results;
}

export async function acquireSabContradictions(): Promise<SabAcquireResult> {
  const listing = parseSabListPage(await fetchText(LIST_URL));
  const failed: SabAcquireResult["failed"] = [];
  const catalog: SabContradictionEntry[] = [];

  const details = await mapPool(listing, 6, async (entry) => {
    try {
      const html = await fetchText(entry.url);
      if (html.includes("No contradictions detail record found")) {
        failed.push({
          error: "SAB has no detail record for this list link",
          url: entry.url,
        });
        return null;
      }
      const parsed = parseSabDetailPage(html);
      if (parsed.claims.length < 2) {
        throw new Error("Detail page did not yield two comparison claims");
      }
      return mergeSabEntry(entry, parsed);
    } catch (error) {
      failed.push({
        error: error instanceof Error ? error.message : "Unknown acquire error",
        url: entry.url,
      });
      return null;
    }
  });

  for (const entry of details) {
    if (entry) {
      catalog.push(entry);
    }
  }

  return { catalog, failed };
}

export function catalogTypeScript(
  catalog: readonly SabContradictionEntry[]
): string {
  return `import type { SabContradictionEntry } from "./sab-contradictions";

export const sabContradictionCatalog: SabContradictionEntry[] = ${JSON.stringify(
    catalog,
    null,
    2
  )};
`;
}

export async function writeSabCatalog(
  catalog: readonly SabContradictionEntry[],
  destination = path.resolve(
    import.meta.dir,
    "../../../../packages/shared/src/sab-contradiction-catalog.ts"
  )
): Promise<string> {
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, catalogTypeScript(catalog));
  return destination;
}
