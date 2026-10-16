import { siteConfig } from "./site";

interface NodeReference {
  "@id": string;
}

interface WebSiteNode extends NodeReference {
  "@type": "WebSite";
  description: string;
  inLanguage: "en";
  name: string;
  publisher: NodeReference;
  url: string;
}

interface OrganizationNode extends NodeReference {
  "@type": "Organization";
  contactPoint: {
    "@type": "ContactPoint";
    contactType: string;
    url: string;
  };
  description: string;
  logo: string;
  name: string;
  sameAs: string[];
  url: string;
}

export interface SiteStructuredData {
  "@context": "https://schema.org";
  "@graph": [WebSiteNode, OrganizationNode];
}

const { repositoryUrl } = siteConfig;
const organization: NodeReference = {
  "@id": `${siteConfig.url}/#organization`,
};

export const siteStructuredData: SiteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${siteConfig.url}/#website`,
      "@type": "WebSite",
      description: siteConfig.description,
      inLanguage: "en",
      name: siteConfig.name,
      publisher: organization,
      url: siteConfig.url,
    },
    {
      ...organization,
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "technical support",
        url: `${repositoryUrl}/issues`,
      },
      description: siteConfig.description,
      logo: `${siteConfig.url}/icon-512.png`,
      name: siteConfig.name,
      sameAs: [repositoryUrl],
      url: siteConfig.url,
    },
  ],
};

export function serializeJsonLd(data: SiteStructuredData): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
