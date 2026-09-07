import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-container status-page">
      <div>
        <div className="font-display text-[8rem] leading-none text-[var(--line)]">
          404
        </div>
        <h1 className="mt-4 text-5xl">This page is still out there.</h1>
        <p className="mt-4 text-[var(--muted)]">
          The link may be incorrect, or this article hasn’t been published yet.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-[var(--paper)]"
          href="/?text=bible"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
