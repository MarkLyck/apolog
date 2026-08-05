import type { ArticleType } from "@apolog/shared";

export const publicRoutes = {
  home: "",
  contradictions: "/contradictions",
  debate: "/debate",
  debunked: "/debunked",
  evidence: "/evidence",
  immoral: "/immoral",
  silly: "/silly",
} as const;

export const articleSections = [
  { href: publicRoutes.debunked, label: "Debunked", type: "debunked" },
  { href: publicRoutes.immoral, label: "Immoral", type: "immoral" },
  { href: publicRoutes.evidence, label: "Evidence", type: "evidence" },
  { href: publicRoutes.silly, label: "Silly", type: "silly" },
] as const satisfies readonly {
  href: `/${ArticleType}`;
  label: string;
  type: ArticleType;
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
