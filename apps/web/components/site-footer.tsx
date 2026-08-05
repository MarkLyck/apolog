"use client";

import { parseCorpus } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { getSiteFooterLinks } from "./site-footer-links";

export function SiteFooter({ initialCorpus }: { initialCorpus: CorpusKey }) {
  const searchParams = useSearchParams();
  const corpusKey = parseCorpus(searchParams.get("text")) ?? initialCorpus;
  const links = getSiteFooterLinks(corpusKey);
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-4 px-5 py-10 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          Apolog is an evidence-first editorial demo. Verify quotations before
          publication.
        </p>
        <div className="flex gap-5">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
