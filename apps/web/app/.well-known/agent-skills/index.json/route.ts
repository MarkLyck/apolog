import {
  agentSkill,
  agentSkillMarkdown,
  sha256Digest,
} from "@/lib/agent-skill";
import { agentSkillPath } from "@/lib/discovery";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          description: agentSkill.description,
          digest: sha256Digest(agentSkillMarkdown(siteConfig.url)),
          name: agentSkill.name,
          type: "skill-md",
          url: `${siteConfig.url}${agentSkillPath}`,
        },
      ],
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}
