import { withCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";

import { footerLinks } from "@/lib/public-routes";

export function getSiteFooterLinks(corpusKey: CorpusKey) {
  return footerLinks.map(({ href, label }) => ({
    href: withCorpus(href, corpusKey),
    label,
  }));
}
