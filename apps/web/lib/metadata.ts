import { defaultCorpus, withCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import type { Metadata } from "next";

import { getPageCorpus } from "./corpus";
import type { PageSearchParams } from "./corpus";
import { feedAlternateTypes } from "./discovery";
import { siteConfig } from "./site";

export interface PublishedArticle {
  placements: readonly { corpusKey: CorpusKey }[];
  publishedAt?: number;
  slug: string;
  summary: string;
  tags: readonly string[];
  title: string;
  updatedAt: number;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export const shareImage = {
  alt: "Apolog — examine the claim",
  height: 630,
  type: "image/png",
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
} as const;

export function canonicalUrl(path: string, corpusKey?: CorpusKey): string {
  const isDefaultCorpusHome = path === "/" && corpusKey === defaultCorpus;
  return absoluteUrl(
    corpusKey && !isDefaultCorpusHome ? withCorpus(path, corpusKey) : path
  );
}

function corpusBareArticleUrlRedirectsTo(article: PublishedArticle) {
  return article.placements.some(
    (placement) => placement.corpusKey === defaultCorpus
  )
    ? undefined
    : article.placements[0]?.corpusKey;
}

export function articleCanonicalUrl(article: PublishedArticle): string {
  const path = `/articles/${article.slug}`;
  const corpus = corpusBareArticleUrlRedirectsTo(article);
  return absoluteUrl(corpus ? withCorpus(path, corpus) : path);
}

// A page that sets openGraph replaces the inherited one, including the root
// opengraph-image, so nested pages name the share image themselves.
export const siteOpenGraph = {
  images: [shareImage],
  locale: "en_US",
  siteName: siteConfig.name,
};

interface PageMetadataInput {
  description?: string;
  title: string;
  url: string;
}

export function pageMetadata({
  description,
  title,
  url,
}: PageMetadataInput): Metadata {
  const summary = description ?? siteConfig.description;
  return {
    alternates: { canonical: url, types: feedAlternateTypes },
    description: summary,
    openGraph: {
      ...siteOpenGraph,
      description: summary,
      title,
      type: "website",
      url,
    },
    title,
  };
}

export function articleMetadata(article: PublishedArticle): Metadata {
  const url = articleCanonicalUrl(article);
  return {
    alternates: {
      canonical: url,
      types: {
        ...feedAlternateTypes,
        "text/markdown": [
          {
            title: `${article.title} (Markdown source)`,
            url: `/articles/${article.slug}.md`,
          },
        ],
      },
    },
    description: article.summary,
    openGraph: {
      ...siteOpenGraph,
      description: article.summary,
      modifiedTime: new Date(article.updatedAt).toISOString(),
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      tags: [...article.tags],
      title: article.title,
      type: "article",
      url,
    },
    title: article.title,
  };
}

export function corpusPageMetadata({
  path,
  ...page
}: Omit<PageMetadataInput, "url"> & { path: string }) {
  return async ({
    searchParams,
  }: {
    searchParams: PageSearchParams;
  }): Promise<Metadata> =>
    pageMetadata({
      ...page,
      url: canonicalUrl(path, await getPageCorpus(searchParams)),
    });
}
