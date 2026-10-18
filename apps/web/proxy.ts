import { api } from "@apolog/backend/api";
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";

import { articleSlugFromPathname } from "@/lib/article-route";

// notFound() thrown by a page only reaches not-found.tsx on the client, so the
// server HTML would be an empty error shell.
export default convexAuthNextjsMiddleware(async (request) => {
  const slug = articleSlugFromPathname(request.nextUrl.pathname);
  if (!slug) {
    return;
  }
  const missing = await fetchQuery(api.articles.getBySlug, { slug }).then(
    (article) => article === null,
    () => false
  );
  if (missing) {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }
});

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/api/auth",
    "/api/auth/:path*",
    "/articles/:path*",
  ],
};
