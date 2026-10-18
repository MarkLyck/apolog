interface DiscoveryLink {
  href: `/${string}`;
  rel: string;
  title: string;
  type: string;
}

export const discoveryLinks = {
  llms: {
    href: "/llms.txt",
    rel: "describedby",
    title: "Apolog index for language models",
    type: "text/markdown",
  },
  apiCatalog: {
    href: "/.well-known/api-catalog",
    rel: "api-catalog",
    title: "Apolog API catalog",
    type: "application/linkset+json",
  },
  sitemap: {
    href: "/sitemap.xml",
    rel: "sitemap",
    title: "Apolog sitemap",
    type: "application/xml",
  },
  feed: {
    href: "/feed.xml",
    rel: "alternate",
    title: "Apolog articles",
    type: "application/rss+xml",
  },
  agentSkills: {
    href: "/.well-known/agent-skills/index.json",
    rel: "agent-skills",
    title: "Apolog agent skills",
    type: "application/json",
  },
} as const satisfies Record<string, DiscoveryLink>;

export const feedAlternateTypes = {
  [discoveryLinks.feed.type]: [
    { title: discoveryLinks.feed.title, url: discoveryLinks.feed.href },
  ],
};

export const agentSkillPath = "/.well-known/agent-skills/apolog/SKILL.md";

export function linkHeader(): string {
  return Object.values(discoveryLinks)
    .map(
      ({ href, rel, title, type }) =>
        `<${href}>; rel="${rel}"; type="${type}"; title="${title}"`
    )
    .join(", ");
}

export function apiCatalog(siteUrl: string) {
  const target = ({ href, title, type }: DiscoveryLink) => ({
    href: `${siteUrl}${href}`,
    title,
    type,
  });
  const site = {
    anchor: `${siteUrl}/`,
    ...Object.fromEntries(
      Object.values(discoveryLinks)
        .filter((link) => link.rel !== "api-catalog")
        .map((link) => [link.rel, [target(link)]])
    ),
  };
  return {
    linkset: [
      site,
      {
        anchor: `${siteUrl}/api/search/articles`,
        "service-doc": [
          target({
            href: agentSkillPath,
            rel: "service-doc",
            title: "How to search and read Apolog",
            type: "text/markdown",
          }),
        ],
      },
    ],
  };
}
