"use client";

import { api } from "@apolog/backend/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FiLock } from "react-icons/fi";

export function AdminAccess({ children }: { children: ReactNode }) {
  const access = useQuery(api.articles.canManage);

  if (access === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
        <p aria-live="polite" className="text-sm text-[var(--muted)]">
          Checking editorial access…
        </p>
      </div>
    );
  }

  if (!access.authorized) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center lg:px-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--surface-strong)] text-2xl text-[var(--accent-strong)]">
          <FiLock aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl">Editorial access</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          {access.authenticated
            ? "Your account is signed in, but it does not have administrator access."
            : "Sign in with an administrator account to write and manage articles."}
        </p>
        {access.authenticated ? null : (
          <Link
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-[var(--paper)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
            href="/login?next=/admin/articles"
          >
            Sign in
          </Link>
        )}
      </section>
    );
  }

  return children;
}
