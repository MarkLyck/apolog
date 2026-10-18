import { gpcSupportResource } from "@/lib/privacy";

export const dynamic = "force-static";

export function GET() {
  return Response.json(gpcSupportResource);
}
