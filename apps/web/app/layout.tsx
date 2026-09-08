import { ThemeProvider } from "@wrksz/themes/next";
import "@fontsource-variable/newsreader";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getInitialCorpus } from "@/lib/corpus";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
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
    description: siteConfig.description,
    siteName: siteConfig.name,
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
  themeColor: "#0749dc",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialCorpus = await getInitialCorpus();
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="light"
          disableTransitionOnChange
          storage="hybrid"
          storageKey="apolog-theme"
        >
          <a
            className="fixed left-3 top-3 z-[60] -translate-y-20 border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-bold text-[var(--ink)] focus:translate-y-0"
            href="#main-content"
          >
            Skip to content
          </a>
          <Suspense
            fallback={
              <div className="h-[70px] border-b border-[var(--line)]" />
            }
          >
            <SiteHeader initialCorpus={initialCorpus} />
          </Suspense>
          <main id="main-content">{children}</main>
          <Suspense>
            <SiteFooter initialCorpus={initialCorpus} />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
