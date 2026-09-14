import { api } from "@apolog/backend/api";
import type { Id } from "@apolog/backend/data-model";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { FiEdit3 } from "react-icons/fi";

export async function ArticleEditButton({
  articleId,
}: {
  articleId: Id<"articles">;
}) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return null;
  }

  const access = await fetchQuery(api.articles.canManage, {}, { token });
  if (!access.authorized) {
    return null;
  }

  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      href={`/admin/articles/${articleId}`}
    >
      <FiEdit3 aria-hidden="true" /> Edit article
    </Link>
  );
}
