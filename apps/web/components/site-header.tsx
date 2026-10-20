"use client";

import { corpusFromSearch, withCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

import { primaryNavigationLinks } from "@/lib/public-routes";

import { CorpusSwitch } from "./corpus-switch";
import { SearchPalette } from "./search-palette";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

export function PrimaryNavigation({
  corpusKey,
  pathname,
  variant,
}: {
  corpusKey: CorpusKey;
  pathname: string;
  variant: "desktop" | "mobile";
}) {
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Primary mobile" : "Primary"}
      className={
        isMobile
          ? "flex flex-wrap justify-center border-t border-[var(--line)] px-3 xl:hidden"
          : "hidden items-center gap-5 xl:flex"
      }
    >
      {primaryNavigationLinks.map(({ href, label }) => (
        <Link
          aria-current={pathname.startsWith(href) ? "page" : undefined}
          className={
            isMobile
              ? "border-b-2 border-transparent px-3 py-2.5 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--ink)] aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-[var(--ink)]"
              : "border-b-2 border-transparent py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)] aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-[var(--ink)]"
          }
          href={withCorpus(href, corpusKey)}
          key={href}
          prefetch
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const corpusKey = corpusFromSearch(searchParams.get("text"));
  const serialized = searchParams.toString();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const toggleSearch = useCallback(
    () => setIsSearchOpen((current) => !current),
    []
  );
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    requestAnimationFrame(() => searchTriggerRef.current?.focus());
  }, []);

  return (
    <>
      <header data-landing={pathname === "/"} className="site-header">
        <div className="site-header-row">
          <Link
            className="mr-auto flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            href={withCorpus("/", corpusKey)}
          >
            <span className="site-brand-name font-display text-xl tracking-tight">
              Apolog
            </span>
          </Link>
          {pathname === "/" ? (
            <nav aria-label="Primary" className="landing-navigation">
              <Link href="#explore">The library</Link>
              <Link href="#approach">Our approach</Link>
              <Link href={withCorpus("/evidence", corpusKey)}>Evidence</Link>
              <Link href="#questions">FAQ</Link>
            </nav>
          ) : (
            <PrimaryNavigation
              corpusKey={corpusKey}
              pathname={pathname}
              variant="desktop"
            />
          )}
          <CorpusSwitch
            corpusKey={corpusKey}
            pathname={pathname}
            search={serialized}
          />
          <SearchTrigger onOpen={openSearch} triggerRef={searchTriggerRef} />
          {pathname === "/" ? (
            <details className="landing-mobile-menu">
              <summary aria-label="Open navigation">
                <FiMenu aria-hidden="true" />
              </summary>
              <nav aria-label="Primary mobile">
                <Link href="#explore">The library</Link>
                <Link href="#approach">Our approach</Link>
                <Link href={withCorpus("/evidence", corpusKey)}>Evidence</Link>
                <Link href="#questions">FAQ</Link>
                <Link href={withCorpus("/debate", corpusKey)}>
                  Start a conversation
                </Link>
              </nav>
            </details>
          ) : (
            <>
              <ThemeToggle />
              <details className="site-mobile-menu" key={pathname}>
                <summary aria-label="Open navigation">
                  <FiMenu aria-hidden="true" />
                </summary>
                <PrimaryNavigation
                  corpusKey={corpusKey}
                  pathname={pathname}
                  variant="mobile"
                />
              </details>
            </>
          )}
        </div>
      </header>
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onToggle={toggleSearch}
      />
    </>
  );
}
