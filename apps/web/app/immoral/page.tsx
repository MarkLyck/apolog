import { ArticleListPage } from "@/components/article-list-page";
import { corpusPageMetadata } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";

export const generateMetadata = corpusPageMetadata("/immoral", {
  title: "Moral analysis",
});

export default function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return (
    <ArticleListPage collectionKey="immoral" searchParams={searchParams} />
  );
}
