import { apiCatalog } from "@/lib/discovery";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(apiCatalog(siteConfig.url), null, 2), {
    headers: { "Content-Type": "application/linkset+json; charset=utf-8" },
  });
}
