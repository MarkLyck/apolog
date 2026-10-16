export const routeTable = [
  { kind: "markdown", pattern: "/" },
  { kind: "app", pattern: "/admin/articles" },
  { kind: "app", pattern: "/admin/articles/[id]" },
  { kind: "app", pattern: "/admin/articles/new" },
  { kind: "app", pattern: "/api/chat" },
  { kind: "app", pattern: "/api/search/articles" },
  { kind: "public", pattern: "/apple-touch-icon.png" },
  { kind: "markdown", pattern: "/articles/[slug]" },
  { kind: "app", pattern: "/contradictions" },
  { kind: "app", pattern: "/debate" },
  { kind: "app", pattern: "/debunked" },
  { kind: "app", pattern: "/evidence" },
  { kind: "public", pattern: "/favicon.ico" },
  { kind: "public", pattern: "/favicon.svg" },
  { kind: "public", pattern: "/fonts/[file]" },
  { kind: "public", pattern: "/icon-192.png" },
  { kind: "public", pattern: "/icon-512.png" },
  { kind: "public", pattern: "/icon-maskable-512.png" },
  { kind: "public", pattern: "/images/[file]" },
  { kind: "app", pattern: "/immoral" },
  { kind: "app", pattern: "/login" },
  { kind: "app", pattern: "/manifest.webmanifest" },
  { kind: "app", pattern: "/markdown/[[...path]]" },
  { kind: "app", pattern: "/opengraph-image" },
  { kind: "app", pattern: "/robots.txt" },
  { kind: "app", pattern: "/signup" },
  { kind: "app", pattern: "/silly" },
  { kind: "app", pattern: "/sitemap.xml" },
] as const satisfies readonly {
  kind: "app" | "markdown" | "public";
  pattern: `/${string}`;
}[];

type Route = (typeof routeTable)[number];
export type MarkdownRoute = Extract<Route, { kind: "markdown" }>["pattern"];

type Segment =
  | { kind: "static"; value: string }
  | { kind: "param"; name: string }
  | { kind: "rest"; optional: boolean };

function parseSegment(segment: string): Segment {
  const rest = /^\[(?<optional>\[)?\.\.\.\w+\]\]?$/u.exec(segment);
  if (rest) {
    return { kind: "rest", optional: rest.groups?.optional === "[" };
  }
  const name = /^\[(?<name>\w+)\]$/u.exec(segment)?.groups?.name;
  return name === undefined
    ? { kind: "static", value: segment }
    : { kind: "param", name };
}

const dynamicSegments = (segments: readonly Segment[]) =>
  segments.filter((segment) => segment.kind !== "static").length;

const compiledRoutes = routeTable
  .map((route) => ({
    route,
    segments: route.pattern.split("/").filter(Boolean).map(parseSegment),
  }))
  .sort(
    (left, right) =>
      dynamicSegments(left.segments) - dynamicSegments(right.segments)
  );

function matchSegments(segments: readonly Segment[], parts: readonly string[]) {
  const params: Record<string, string> = {};
  for (const [index, segment] of segments.entries()) {
    if (segment.kind === "rest") {
      return segment.optional || parts.length > index ? params : null;
    }
    const part = parts[index];
    if (part === undefined) {
      return null;
    }
    if (segment.kind === "param") {
      params[segment.name] = part;
    } else if (segment.value !== part) {
      return null;
    }
  }
  return parts.length === segments.length ? params : null;
}

export function matchRoute(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  for (const { route, segments } of compiledRoutes) {
    const params = matchSegments(segments, parts);
    if (params) {
      return { params, route };
    }
  }
  return null;
}

const markdownTypes = new Set(["text/markdown", "text/x-markdown"]);
const htmlTypes = new Set(["text/html", "text/*", "*/*"]);

function quality(parameters: string[]) {
  const q = parameters.find((parameter) => parameter.trim().startsWith("q="));
  const value = q === undefined ? 1 : Number(q.trim().slice(2));
  return Number.isNaN(value) ? 0 : value;
}

export function prefersMarkdown(accept: string | null) {
  let markdown = 0;
  let html = 0;
  for (const range of (accept ?? "").split(",")) {
    const [type = "", ...parameters] = range.split(";");
    const mediaType = type.trim().toLowerCase();
    if (markdownTypes.has(mediaType)) {
      markdown = Math.max(markdown, quality(parameters));
    } else if (htmlTypes.has(mediaType)) {
      html = Math.max(html, quality(parameters));
    }
  }
  return markdown > 0 && markdown >= html;
}

export function markdownTarget(pathname: string, accept: string | null) {
  if (pathname.endsWith(".md")) {
    const path = pathname.slice(0, -".md".length);
    return path === "/index" ? "/" : path;
  }
  if (!prefersMarkdown(accept)) {
    return null;
  }
  const kind = matchRoute(pathname)?.route.kind;
  return kind === undefined || kind === "markdown" ? pathname : null;
}
