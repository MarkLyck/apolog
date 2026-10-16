import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prefersMarkdown } from "@/lib/markdown";

function negotiateMarkdown(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/" &&
    prefersMarkdown(request.headers.get("accept"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/index.md";
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
    {
      has: [{ key: "accept", type: "header", value: ".*text/(x-)?markdown.*" }],
      source: "/",
    },
  ],
};
