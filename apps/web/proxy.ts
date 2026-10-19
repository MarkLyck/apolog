import { api } from "@apolog/backend/api";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { articleSlugFromPathname } from "./lib/article-route";
import { documentSecurityHeaders } from "./lib/content-security-policy";
import { redirectWithoutTrailingSlash } from "./lib/trailing-slash";

const isAuthRoute = createRouteMatcher([
  "/login",
  "/signup",
  "/api/auth",
  "/api/auth/:path*",
  "/articles/:path*",
]);

// notFound() thrown by a page only reaches not-found.tsx on the client, so the
// server HTML would be an empty error shell.
async function isMissingArticle(request: NextRequest) {
  const slug = articleSlugFromPathname(request.nextUrl.pathname);
  if (!slug) {
    return false;
  }
  return await fetchQuery(api.articles.getBySlug, { slug }).then(
    (article) => article === null,
    () => false
  );
}

async function withDocumentSecurity(request: NextRequest) {
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");
  const headers = documentSecurityHeaders({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    development: process.env.NODE_ENV === "development",
    https: request.nextUrl.protocol === "https:",
    nonce,
  });
  // Next.js reads the nonce from the request's CSP and stamps it on its own scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    headers["Content-Security-Policy"]
  );
  const forward = { request: { headers: requestHeaders } };
  const response = (await isMissingArticle(request))
    ? NextResponse.rewrite(new URL("/_not-found", request.url), forward)
    : NextResponse.next(forward);
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

const authProxy = convexAuthNextjsMiddleware(withDocumentSecurity);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const redirect = redirectWithoutTrailingSlash(request);
  if (redirect) {
    return redirect;
  }
  return isAuthRoute(request)
    ? authProxy(request, event)
    : withDocumentSecurity(request);
}

export const config = {
  matcher: [
    "/api/auth",
    "/api/auth/:path*",
    "/(.+)/",
    "/((?!api/|_next/|fonts/|images/|favicon|apple-touch-icon|icon-|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|opengraph-image|\\.well-known/).*)",
  ],
};
