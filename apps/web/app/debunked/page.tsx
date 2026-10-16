import { ArticleListPage } from "@/components/article-list-page";
import { corpusPageMetadata } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";

export const generateMetadata = corpusPageMetadata("/debunked", {
  title: "Debunked claims",
});

export default function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return (
    <ArticleListPage collectionKey="debunked" searchParams={searchParams} />
  );
}
