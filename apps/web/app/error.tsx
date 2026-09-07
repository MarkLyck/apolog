"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="page-container status-page">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Something interrupted the page
        </div>
        <h1 className="mt-4 text-5xl">The evidence is still here.</h1>
        <p className="mt-4 text-[var(--muted)]">
          Retry the request. No conversation or form data was stored.
        </p>
        <button
          className="mt-8 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-[var(--paper)]"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
