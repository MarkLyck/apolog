import { ArticleListPage } from "@/components/article-list-page";
import { corpusPageMetadata } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";

export const generateMetadata = corpusPageMetadata("/evidence", {
  title: "Evidence guides",
});

export default function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return (
    <ArticleListPage collectionKey="evidence" searchParams={searchParams} />
  );
}
