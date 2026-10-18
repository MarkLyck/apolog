import { describe, expect, test } from "bun:test";

import { rssFeed } from "./rss-feed";

const feed = rssFeed({
  articles: [
    {
      publishedAt: Date.UTC(2026, 4, 27, 9),
      slug: "flood",
      summary: 'Rain & <sediment> "layers"',
      title: "The flood's timeline",
    },
    { publishedAt: 0, slug: "undated", summary: "No date.", title: "Undated" },
  ],
  description: "Evidence-first.",
  feedPath: "/feed.xml",
  lastBuildDate: Date.UTC(2026, 4, 28),
  siteUrl: "https://apolog.example",
  title: "Apolog articles",
});

describe("rss feed", () => {
  test("identifies itself with an absolute self link and a declared cadence", () => {
    expect(feed).toContain(
      '<atom:link href="https://apolog.example/feed.xml" rel="self" type="application/rss+xml" />'
    );
    expect(feed).toContain(
      "<lastBuildDate>Thu, 28 May 2026 00:00:00 GMT</lastBuildDate>"
    );
    expect(feed).toContain("<sy:updatePeriod>weekly</sy:updatePeriod>");
  });

  test("gives every item an absolute permalink guid and escapes its text", () => {
    expect(feed).toContain(
      '<guid isPermaLink="true">https://apolog.example/articles/flood</guid>'
    );
    expect(feed).toContain("<title>The flood&apos;s timeline</title>");
    expect(feed).toContain(
      "<description>Rain &amp; &lt;sediment&gt; &quot;layers&quot;</description>"
    );
    expect(feed).toContain("<pubDate>Wed, 27 May 2026 09:00:00 GMT</pubDate>");
  });

  test("omits pubDate for an article without a publish date", () => {
    const undated = feed.slice(feed.indexOf("<title>Undated</title>"));
    expect(undated).not.toContain("<pubDate>");
  });
});
