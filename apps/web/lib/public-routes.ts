import { collectionRegistry } from "@apolog/shared";
import type { CollectionKey } from "@apolog/shared";

export const publicRoutes = {
  home: "",
  contradictions: collectionRegistry.contradictions.href,
  debate: "/debate",
  debunked: collectionRegistry.debunked.href,
  evidence: collectionRegistry.evidence.href,
  immoral: collectionRegistry.immoral.href,
  silly: collectionRegistry.silly.href,
} as const;

export const articleSections = [
  {
    collectionKey: "debunked",
    href: collectionRegistry.debunked.href,
    label: collectionRegistry.debunked.label,
  },
  {
    collectionKey: "immoral",
    href: collectionRegistry.immoral.href,
    label: collectionRegistry.immoral.label,
  },
  {
    collectionKey: "evidence",
    href: collectionRegistry.evidence.href,
    label: collectionRegistry.evidence.label,
  },
  {
    collectionKey: "silly",
    href: collectionRegistry.silly.href,
    label: collectionRegistry.silly.label,
  },
] as const satisfies readonly {
  collectionKey: CollectionKey;
  href: `/${CollectionKey}`;
  label: string;
}[];

export const primaryNavigationLinks = [
  { href: publicRoutes.contradictions, label: "Contradictions" },
  ...articleSections.map(({ href, label }) => ({ href, label })),
  { href: publicRoutes.debate, label: "Debate" },
] as const;

export const searchPaletteLinks = [
  { href: publicRoutes.contradictions, label: "Browse contradictions" },
  { href: publicRoutes.debunked, label: "Review factual claims" },
  { href: publicRoutes.immoral, label: "Explore moral critiques" },
  { href: publicRoutes.evidence, label: "Read evidence guides" },
  { href: publicRoutes.silly, label: "Browse the silliest stories" },
] as const;

export const footerLinks = [
  { href: publicRoutes.evidence, label: "Methods" },
  { href: publicRoutes.debate, label: "Debate" },
] as const;

export const sitemapRoutes = Object.values(publicRoutes);
