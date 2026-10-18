import { serializeJsonLd } from "@/lib/structured-data";
import type { JsonLdGraph } from "@/lib/structured-data";

export function JsonLd({ graph }: { graph: JsonLdGraph }) {
  return <script type="application/ld+json">{serializeJsonLd(graph)}</script>;
}
