"use client";

import { parseCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";

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
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header)]">
      <div className="mx-auto flex max-w-[92rem] items-center gap-1 px-3 py-2.5 sm:gap-2 sm:px-5 md:gap-4 lg:px-8">
        <Link
          className="mr-auto flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          href={`/?text=${corpusKey}`}
        >
          <span className="grid size-9 place-items-center bg-[var(--accent)] font-display text-xl font-semibold text-white">
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
        <Link
          aria-label="Open article editor"
          className="hidden size-10 place-items-center border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] sm:grid"
          href="/admin/articles"
          title="Article editor"
        >
          <FiEdit3 aria-hidden="true" />
        </Link>
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
