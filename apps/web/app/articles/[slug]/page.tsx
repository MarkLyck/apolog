import { parseCollection } from "@apolog/shared";
import type { Metadata } from "next";

import { ArticleDetailPage } from "@/components/article-detail-page";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getArticle } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return article
    ? { description: article.summary, title: article.title }
    : { title: "Not found" };
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
