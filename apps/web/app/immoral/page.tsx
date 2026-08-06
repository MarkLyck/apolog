import type { Metadata } from "next";

import { ArticleListPage } from "@/components/article-list-page";
import type { PageSearchParams } from "@/lib/corpus";

export const metadata: Metadata = { title: "Moral analysis" };
export default function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return (
    <ArticleListPage collectionKey="immoral" searchParams={searchParams} />
  );
}
