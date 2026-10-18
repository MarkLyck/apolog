import { collectionRegistry } from "@apolog/shared";

import { ArticleListPage } from "@/components/article-list-page";
import type { PageSearchParams } from "@/lib/corpus";
import { corpusPageMetadata } from "@/lib/metadata";

export const generateMetadata = corpusPageMetadata({
  path: collectionRegistry.debunked.href,
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
