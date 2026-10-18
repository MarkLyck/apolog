import { collectionRegistry, withCorpus } from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";

import {
  absoluteUrl,
  articleCanonicalUrl,
  canonicalUrl,
  shareImage,
} from "./metadata";
import type { PublishedArticle } from "./metadata";
import { siteConfig } from "./site";

interface Reference {
  "@id": string;
}

interface ListItem {
  "@type": "ListItem";
  item: string;
  name: string;
  position: number;
}

type JsonLdValue =
  | string
  | number
  | Reference
  | readonly string[]
  | readonly ListItem[];

type JsonLdNode = { "@type": string } & Record<string, JsonLdValue>;

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

export interface Crumb {
  href: string;
  name: string;
  url: string;
}

const organizationRef = { "@id": absoluteUrl("/#organization") };
const websiteRef = { "@id": absoluteUrl("/#website") };

const siteNodes: JsonLdNode[] = [
  {
    "@type": "WebSite",
    ...websiteRef,
    description: siteConfig.description,
    inLanguage: "en",
    name: siteConfig.name,
    publisher: organizationRef,
    url: absoluteUrl("/"),
  },
  {
    "@type": "Organization",
    ...organizationRef,
    logo: absoluteUrl("/icon-512.png"),
    name: siteConfig.name,
    url: absoluteUrl("/"),
  },
];

function graph(...nodes: JsonLdNode[]): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [...siteNodes, ...nodes],
  };
}

export const siteGraph = graph();

export function collectionGraph({
  collectionKey,
  corpusKey,
  description,
}: {
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
  description: string;
}): JsonLdGraph {
  const url = canonicalUrl(collectionRegistry[collectionKey].href, corpusKey);
  return graph({
    "@type": "CollectionPage",
    "@id": url,
    description,
    inLanguage: "en",
    isPartOf: websiteRef,
    name: collectionRegistry[collectionKey].label,
    url,
  });
}

export function articleBreadcrumbs(
  article: PublishedArticle,
  collectionKey: CollectionKey,
  corpusKey: CorpusKey
): Crumb[] {
  const collection = collectionRegistry[collectionKey];
  const url = articleCanonicalUrl(article);
  return [
    {
      href: withCorpus("/", corpusKey),
      name: "Home",
      url: canonicalUrl("/", corpusKey),
    },
    {
      href: withCorpus(collection.href, corpusKey),
      name: collection.label,
      url: canonicalUrl(collection.href, corpusKey),
    },
    { href: url, name: article.title, url },
  ];
}

export function articleGraph(
  article: PublishedArticle,
  collectionKey: CollectionKey,
  breadcrumbs: readonly Crumb[]
): JsonLdGraph {
  const url = articleCanonicalUrl(article);
  const node = {
    "@type": "Article",
    "@id": `${url}#article`,
    articleSection: collectionRegistry[collectionKey].label,
    author: organizationRef,
    dateModified: new Date(article.updatedAt).toISOString(),
    description: article.summary,
    headline: article.title,
    image: shareImage.url,
    inLanguage: "en",
    isPartOf: websiteRef,
    keywords: [...article.tags],
    mainEntityOfPage: url,
    publisher: organizationRef,
    url,
  } satisfies JsonLdNode;
  return graph(
    article.publishedAt
      ? {
          ...node,
          datePublished: new Date(article.publishedAt).toISOString(),
        }
      : node,
    {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index): ListItem => ({
        "@type": "ListItem",
        item: crumb.url,
        name: crumb.name,
        position: index + 1,
      })),
    }
  );
}

export function serializeJsonLd(value: JsonLdGraph): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
