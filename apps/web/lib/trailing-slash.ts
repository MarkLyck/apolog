import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function redirectWithoutTrailingSlash(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname === "/" || !url.pathname.endsWith("/")) {
    return null;
  }
  url.pathname = url.pathname.replace(/\/+$/u, "") || "/";
  return NextResponse.redirect(url, {
    headers: { "Redirect-By": "Apolog" },
    status: 308,
  });
}
