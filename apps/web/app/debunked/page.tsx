import type { Metadata } from "next";

import { ArticleListPage } from "@/components/article-list-page";
import type { PageSearchParams } from "@/lib/corpus";

export const metadata: Metadata = { title: "Debunked claims" };
export default function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return <ArticleListPage searchParams={searchParams} type="debunked" />;
}
