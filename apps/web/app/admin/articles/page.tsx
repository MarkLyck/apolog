import type { Metadata } from "next";

import { AdminArticleList } from "@/components/admin-article-list";

export const metadata: Metadata = { title: "Manage articles" };

export default function ArticlesAdminPage() {
  return <AdminArticleList />;
}
