import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { markdownTarget } from "@/lib/markdown-routes";

function negotiateMarkdown(request: NextRequest) {
  const target = markdownTarget(
    request.nextUrl.pathname,
    request.headers.get("accept")
  );
  if (target !== null) {
    const url = request.nextUrl.clone();
    url.pathname = target === "/" ? "/markdown" : `/markdown${target}`;
    return NextResponse.rewrite(url);
  }
}

export default convexAuthNextjsMiddleware(negotiateMarkdown);

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/api/auth",
    "/api/auth/:path*",
    "/articles/:path*",
    "/(.*\\.md)",
    {
      has: [{ key: "accept", type: "header", value: ".*text/(x-)?markdown.*" }],
      source: "/((?!_next/).*)",
    },
  ],
};
