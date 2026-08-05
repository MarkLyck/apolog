import type { ArticleType } from "@apolog/shared";

export const articleSections: {
  href: `/${ArticleType}`;
  label: string;
  type: ArticleType;
}[] = [
  { href: "/debunked", label: "Debunked", type: "debunked" },
  { href: "/immoral", label: "Immoral", type: "immoral" },
  { href: "/evidence", label: "Evidence", type: "evidence" },
  { href: "/silly", label: "Silly", type: "silly" },
];
