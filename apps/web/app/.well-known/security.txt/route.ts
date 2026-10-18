import { siteConfig } from "@/lib/site";

export const revalidate = 86_400;

const yearInMilliseconds = 365 * 24 * 60 * 60 * 1000;

export function GET() {
  const expires = new Date(Date.now() + yearInMilliseconds).toISOString();
  return new Response(
    [
      "Contact: https://github.com/MarkLyck/apolog/security/advisories/new",
      `Expires: ${expires}`,
      "Preferred-Languages: en",
      `Canonical: ${siteConfig.url}/.well-known/security.txt`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
