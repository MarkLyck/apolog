import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[62vh] max-w-3xl place-items-center px-5 text-center">
      <div>
        <div className="font-display text-[8rem] leading-none text-[var(--line)]">
          404
        </div>
        <h1 className="mt-4 text-5xl">That record is not published.</h1>
        <p className="mt-4 text-[var(--muted)]">
          The address may be wrong, or the item may still be a draft.
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
