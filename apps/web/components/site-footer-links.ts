import type { CorpusKey } from "@apolog/shared";

export function getSiteFooterLinks(corpusKey: CorpusKey) {
  return [
    { href: `/evidence?text=${corpusKey}`, label: "Methods" },
    { href: `/map?text=${corpusKey}`, label: "Geography" },
    { href: `/debate?text=${corpusKey}`, label: "Debate" },
  ];
}
