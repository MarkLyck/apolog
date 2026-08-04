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
  const { slug } = await params;
  const article = await getArticle("evidence", slug);
  return article
    ? { description: article.summary, title: article.title }
    : { title: "Not found" };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, corpusKey] = await Promise.all([
    params,
    getPageCorpus(searchParams),
  ]);
  return (
    <ArticleDetailPage corpusKey={corpusKey} slug={slug} type="evidence" />
  );
}
