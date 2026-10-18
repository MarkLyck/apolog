import { describe, expect, test } from "bun:test";

import {
  absoluteUrl,
  articleCanonicalUrl,
  articleMetadata,
  canonicalUrl,
  pageMetadata,
} from "./metadata";
import type { PublishedArticle } from "./metadata";

const article = (
  corpora: PublishedArticle["placements"][number]["corpusKey"][]
): PublishedArticle => ({
  placements: corpora.map((corpusKey) => ({ corpusKey })),
  slug: "talking-donkey",
  summary: "A donkey speaks to Balaam.",
  tags: ["Numbers"],
  title: "The talking donkey",
  updatedAt: Date.UTC(2026, 9, 1),
});

describe("canonical URLs", () => {
  test("corpus pages keep the rendered corpus, except the default home", () => {
    expect(canonicalUrl("/debunked", "bible")).toBe(
      absoluteUrl("/debunked?text=bible")
    );
    expect(canonicalUrl("/debunked", "quran")).toBe(
      absoluteUrl("/debunked?text=quran")
    );
    expect(canonicalUrl("/", "bible")).toBe(absoluteUrl("/"));
    expect(canonicalUrl("/", "quran")).toBe(absoluteUrl("/?text=quran"));
    expect(canonicalUrl("/privacy")).toBe(absoluteUrl("/privacy"));
  });

  test("articles drop the corpus unless the bare URL would redirect", () => {
    expect(articleCanonicalUrl(article(["bible", "quran"]))).toBe(
      absoluteUrl("/articles/talking-donkey")
    );
    expect(articleCanonicalUrl(article(["quran"]))).toBe(
      absoluteUrl("/articles/talking-donkey?text=quran")
    );
  });
});

describe("page metadata", () => {
  test("og:url is the canonical URL", () => {
    const url = canonicalUrl("/debunked", "quran");
    const metadata = pageMetadata({ title: "Debunked claims", url });
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph?.url).toBe(url);
    expect(metadata.openGraph).toMatchObject({
      images: [
        {
          height: 630,
          type: "image/png",
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
        },
      ],
      locale: "en_US",
    });
  });

  test("articles publish as og:article with ISO times", () => {
    const metadata = articleMetadata({
      ...article(["bible"]),
      publishedAt: Date.UTC(2026, 8, 1),
    });
    expect(metadata.openGraph).toMatchObject({
      modifiedTime: "2026-10-01T00:00:00.000Z",
      publishedTime: "2026-09-01T00:00:00.000Z",
      type: "article",
      url: absoluteUrl("/articles/talking-donkey"),
    });
  });
});
