import { ThemeProvider } from "@wrksz/themes/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getInitialCorpus } from "@/lib/corpus";
import { feedAlternateTypes } from "@/lib/discovery";
import { speculationRules } from "@/lib/document-caching";
import { siteOpenGraph } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const astaSans = localFont({
  src: "../public/fonts/asta-sans-latin.woff2",
  variable: "--font-asta",
  display: "optional",
  weight: "300 800",
});

export const metadata: Metadata = {
  alternates: { types: feedAlternateTypes },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  applicationName: siteConfig.name,
  description: siteConfig.description,
  icons: {
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    ...siteOpenGraph,
    description: siteConfig.description,
    title: "Apolog — examine the claim",
    type: "website",
  },
  title: {
    default: "Apolog — examine the claim",
    template: "%s · Apolog",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#0749dc",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [initialCorpus, requestHeaders] = await Promise.all([
    getInitialCorpus(),
    headers(),
  ]);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  return (
    <html
      className={astaSans.variable}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          defaultTheme="light"
          disableTransitionOnChange
          nonce={nonce}
          storage="hybrid"
          storageKey="apolog-theme"
        >
          <a
            className="fixed top-3 left-3 z-[60] -translate-y-20 border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-bold text-[var(--ink)] focus:translate-y-0"
            href="#main-content"
          >
            Skip to content
          </a>
          <Suspense
            fallback={
              <div className="site-header" aria-hidden="true">
                <div className="site-header-row" />
              </div>
            }
          >
            <SiteHeader initialCorpus={initialCorpus} />
          </Suspense>
          <main id="main-content">{children}</main>
          <Suspense>
            <SiteFooter initialCorpus={initialCorpus} />
          </Suspense>
        </ThemeProvider>
        <script nonce={nonce} type="speculationrules">
          {JSON.stringify(speculationRules)}
        </script>
      </body>
    </html>
  );
}
