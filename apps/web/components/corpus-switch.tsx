"use client";

import { corpusKeys, withCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import { cn } from "cnfast";
import Link from "next/link";

function selectCorpus(key: CorpusKey) {
  document.cookie = `apolog-text=${key}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function CorpusSwitch({
  corpusKey,
  pathname,
  search = "",
}: {
  corpusKey: CorpusKey;
  pathname: string;
  search?: string;
}) {
  const currentPath = search ? `${pathname}?${search}` : pathname;

  return (
    <nav
      aria-label="Choose text corpus"
      className="inline-grid grid-cols-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 shadow-sm"
    >
      {corpusKeys.map((key) => (
        <Link
          aria-current={corpusKey === key ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-4",
            corpusKey === key
              ? "bg-[var(--ink)] text-[var(--paper)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          )}
          href={withCorpus(currentPath, key)}
          key={key}
          onClick={() => selectCorpus(key)}
        >
          {key === "bible" ? "Bible" : "Quran"}
        </Link>
      ))}
    </nav>
  );
}
