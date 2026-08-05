"use client";

import { parseCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

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
          ? "flex flex-wrap justify-center gap-1 px-3 pb-3 sm:px-5 xl:hidden"
          : "hidden items-center gap-1 xl:flex"
      }
    >
      {primaryNavigationLinks.map(({ href, label }) => (
        <Link
          aria-current={pathname.startsWith(href) ? "page" : undefined}
          className={
            isMobile
              ? "rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)] aria-[current=page]:bg-[var(--surface)] aria-[current=page]:text-[var(--accent-strong)]"
              : "rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)] aria-[current=page]:text-[var(--accent-strong)]"
          }
          href={`${href}?text=${corpusKey}`}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader({ initialCorpus }: { initialCorpus: CorpusKey }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const corpusKey = parseCorpus(searchParams.get("text")) ?? initialCorpus;
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
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--paper)]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[92rem] items-center gap-1 px-3 py-3 sm:gap-2 sm:px-5 md:gap-5 lg:px-8">
        <Link
          className="mr-auto flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          href={`/?text=${corpusKey}`}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] font-display text-xl text-[var(--paper)]">
            A
          </span>
          <span className="hidden font-display text-xl tracking-tight sm:inline">
            Apolog
          </span>
        </Link>
        <PrimaryNavigation
          corpusKey={corpusKey}
          pathname={pathname}
          variant="desktop"
        />
        <CorpusSwitch
          corpusKey={corpusKey}
          pathname={pathname}
          search={serialized}
        />
        <SearchTrigger onOpen={openSearch} triggerRef={searchTriggerRef} />
        <ThemeToggle />
      </div>
      <PrimaryNavigation
        corpusKey={corpusKey}
        pathname={pathname}
        variant="mobile"
      />
      <SearchPalette
        initialCorpus={initialCorpus}
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onToggle={toggleSearch}
      />
    </header>
  );
}
