import { parseCollection } from "@apolog/shared";
import type { Metadata } from "next";

import { ArticleDetailPage } from "@/components/article-detail-page";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getArticle } from "@/lib/data";
import { siteConfig } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return { title: "Not found" };
  }

  const metadata = { description: article.summary, title: article.title };
  if (slug !== "noahs-ark-disproven-in-45-ways") {
    return metadata;
  }

  const image = {
    url: new URL("/images/articles/noahs-ark-social-card.jpg", siteConfig.url)
      .href,
    width: 1731,
    height: 909,
    alt: "Noah's Ark vs. Reality: 41 evidence and feasibility checks on a recent global flood, with a cartoon of Noah patching his leaking ark.",
  };
  return {
    ...metadata,
    openGraph: {
      ...metadata,
      type: "article",
      siteName: siteConfig.name,
      url: `/articles/${slug}`,
      images: [image],
    },
    twitter: {
      ...metadata,
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, corpusKey, parameters] = await Promise.all([
    params,
    getPageCorpus(searchParams),
    searchParams,
  ]);
  const from = Array.isArray(parameters.from)
    ? parameters.from[0]
    : parameters.from;
  return (
    <ArticleDetailPage
      corpusKey={corpusKey}
      requestedCollection={parseCollection(from)}
      slug={slug}
    />
  );
}
