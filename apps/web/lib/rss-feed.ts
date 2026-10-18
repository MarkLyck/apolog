interface FeedArticle {
  publishedAt: number;
  slug: string;
  summary: string;
  title: string;
}

interface Feed {
  articles: readonly FeedArticle[];
  description: string;
  feedPath: string;
  lastBuildDate: number;
  siteUrl: string;
  title: string;
}

const xmlEntities = new Map([
  ['"', "&quot;"],
  ["&", "&amp;"],
  ["'", "&apos;"],
  ["<", "&lt;"],
  [">", "&gt;"],
]);

function xml(text: string) {
  return text.replaceAll(
    /["&'<>]/gu,
    (character) => xmlEntities.get(character) ?? character
  );
}

function rfc822(timestamp: number) {
  return new Date(timestamp).toUTCString();
}

function feedItem(article: FeedArticle, siteUrl: string) {
  const url = xml(`${siteUrl}/articles/${article.slug}`);
  return [
    "    <item>",
    `      <title>${xml(article.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    ...(article.publishedAt
      ? [`      <pubDate>${rfc822(article.publishedAt)}</pubDate>`]
      : []),
    `      <description>${xml(article.summary)}</description>`,
    "    </item>",
  ].join("\n");
}

export function rssFeed(feed: Feed) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>${xml(feed.title)}</title>
    <link>${xml(feed.siteUrl)}/</link>
    <description>${xml(feed.description)}</description>
    <language>en</language>
    <atom:link href="${xml(feed.siteUrl + feed.feedPath)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${rfc822(feed.lastBuildDate)}</lastBuildDate>
    <sy:updatePeriod>weekly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
${feed.articles.map((article) => feedItem(article, feed.siteUrl)).join("\n")}
  </channel>
</rss>
`;
}
