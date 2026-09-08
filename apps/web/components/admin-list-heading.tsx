import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export function AdminListHeading() {
  return (
    <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Publishing desk
        </p>
        <h1 className="mt-3 text-5xl">Articles</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Draft, edit, publish, and organize every article from one place.
        </p>
      </div>
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-[var(--paper)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        href="/admin/articles/new"
      >
        <FiPlus aria-hidden="true" /> New article
      </Link>
    </header>
  );
}
