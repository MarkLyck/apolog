import { agentSkillMarkdown } from "@/lib/agent-skill";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return new Response(agentSkillMarkdown(siteConfig.url), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
