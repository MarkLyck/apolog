export const collectionKeys = [
  "debunked",
  "immoral",
  "evidence",
  "silly",
  "contradictions",
] as const;
export type CollectionKey = (typeof collectionKeys)[number];

export const collectionRegistry = {
  contradictions: {
    cardLabel: "Contradiction",
    description: "Structured claim-against-claim comparisons.",
    href: "/contradictions",
    label: "Contradictions",
  },
  debunked: {
    cardLabel: "Claim review",
    description: "Historical and factual claims tested against evidence.",
    href: "/debunked",
    label: "Debunked",
    page: {
      description:
        "Historical and factual claims examined with explicit findings: contradicted, unsupported, anachronistic, or physically implausible.",
      eyebrow: "Claims under review",
      title: "What would the evidence look like?",
    },
  },
  evidence: {
    cardLabel: "Evidence guide",
    description: "Guides to evidence, methods, uncertainty, and limitations.",
    href: "/evidence",
    label: "Evidence",
    page: {
      description:
        "Accessible guides to evidence, uncertainty, cross-checks, and limitations across science, history, and archaeology.",
      eyebrow: "Methods and findings",
      title: "Understand how we know.",
    },
  },
  immoral: {
    cardLabel: "Moral analysis",
    description: "Moral analysis using transparent ethical standards.",
    href: "/immoral",
    label: "Immoral",
    page: {
      description:
        "Moral analysis that distinguishes narration, command, approval, punishment, and attributed speech before applying a transparent ethical framework.",
      eyebrow: "Ethics in context",
      title: "Name the standard. Read the whole passage.",
    },
  },
  silly: {
    cardLabel: "Silly story",
    description: "Critical readings of strange and fanciful stories.",
    href: "/silly",
    label: "Silly",
    page: {
      description:
        "Talking animals, impossible logistics, strange miracles, and narrative turns that can be examined critically without mocking the people who believe them.",
      eyebrow: "The strange and silly",
      title: "Some stories are hard to read with a straight face.",
    },
  },
} as const satisfies Record<
  CollectionKey,
  {
    cardLabel: string;
    description: string;
    href: `/${CollectionKey}`;
    label: string;
    page?: { description: string; eyebrow: string; title: string };
  }
>;

export function parseCollection(
  value: string | null | undefined
): CollectionKey | null {
  return collectionKeys.find((key) => key === value) ?? null;
}
