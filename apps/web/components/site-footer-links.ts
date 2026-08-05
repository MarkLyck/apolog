import type { CorpusKey } from "@apolog/shared";

import { footerLinks } from "@/lib/public-routes";

export function getSiteFooterLinks(corpusKey: CorpusKey) {
  return footerLinks.map(({ href, label }) => ({
    href: `${href}?text=${corpusKey}`,
    label,
  }));
}
