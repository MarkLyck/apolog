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
    <footer className="bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto grid max-w-[92rem] gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <div className="font-display text-3xl">Apolog</div>
          <p className="mt-3 max-w-xl text-sm leading-6 opacity-70">
            An evidence-first editorial demo. Verify quotations before
            publication.
          </p>
        </div>
        <div className="flex gap-5 text-sm font-semibold">
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
