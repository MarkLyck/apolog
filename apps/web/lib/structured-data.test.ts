import { describe, expect, test } from "bun:test";

import { absoluteUrl } from "./metadata";
import type { PublishedArticle } from "./metadata";
import {
  articleBreadcrumbs,
  articleGraph,
  collectionGraph,
  serializeJsonLd,
  siteGraph,
} from "./structured-data";
import type { JsonLdGraph } from "./structured-data";

const article: PublishedArticle = {
  placements: [{ corpusKey: "bible" }, { corpusKey: "quran" }],
  slug: "global-flood-evidence",
  summary: "What the geology says about a worldwide flood.",
  tags: ["Genesis", "Geology"],
  title: "Global flood </script><script>alert(1)</script>",
  updatedAt: Date.UTC(2026, 9, 1),
};

const nodeOfType = (graph: JsonLdGraph, type: string) =>
  graph["@graph"].find((node) => node["@type"] === type);

describe("structured data", () => {
  test("serialized JSON-LD cannot close its script tag and still parses back", () => {
    const graph = articleGraph(
      article,
      "debunked",
      articleBreadcrumbs(article, "debunked", "quran")
    );
    const serialized = serializeJsonLd(graph);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(graph);
  });

  test("the breadcrumb list mirrors the visible trail in order", () => {
    const crumbs = articleBreadcrumbs(article, "debunked", "quran");
    expect(crumbs.map((crumb) => [crumb.name, crumb.href])).toEqual([
      ["Home", "/?text=quran"],
      ["Debunked", "/debunked?text=quran"],
      [article.title, absoluteUrl("/articles/global-flood-evidence")],
    ]);
    const list = nodeOfType(
      articleGraph(article, "debunked", crumbs),
      "BreadcrumbList"
    );
    expect(list?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        item: absoluteUrl("/?text=quran"),
        name: "Home",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: absoluteUrl("/debunked?text=quran"),
        name: "Debunked",
        position: 2,
      },
      {
        "@type": "ListItem",
        item: absoluteUrl("/articles/global-flood-evidence"),
        name: article.title,
        position: 3,
      },
    ]);
  });

  test("an article names the site organization as author and publisher", () => {
    const graph = articleGraph(
      article,
      "debunked",
      articleBreadcrumbs(article, "debunked", "bible")
    );
    const organization = nodeOfType(graph, "Organization");
    const node = nodeOfType(graph, "Article");
    expect(node).toMatchObject({
      author: { "@id": organization?.["@id"] },
      dateModified: "2026-10-01T00:00:00.000Z",
      headline: article.title,
      publisher: { "@id": organization?.["@id"] },
      url: absoluteUrl("/articles/global-flood-evidence"),
    });
    expect(node).not.toHaveProperty("datePublished");
  });

  test("every page shares one site identity", () => {
    const collection = collectionGraph({
      collectionKey: "silly",
      corpusKey: "bible",
      description: "Silly stories.",
    });
    expect(nodeOfType(collection, "WebSite")).toEqual(
      nodeOfType(siteGraph, "WebSite")
    );
    expect(nodeOfType(collection, "CollectionPage")).toMatchObject({
      name: "Silly",
      url: absoluteUrl("/silly?text=bible"),
    });
  });
});
