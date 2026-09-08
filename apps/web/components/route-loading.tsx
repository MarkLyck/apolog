import { collectionRegistry } from "@apolog/shared";
import type { CollectionKey } from "@apolog/shared";

import { AdminListHeading } from "./admin-list-heading";
import { PageIntro } from "./page-intro";

function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

export function CollectionLoading({
  collectionKey,
}: {
  collectionKey: CollectionKey;
}) {
  const copy =
    collectionKey === "contradictions"
      ? {
          eyebrow: "Claim against claim",
          title: "Where the accounts pull apart.",
          description:
            "Compare the precise claims, their passage references, the point of conflict, and the strongest common reconciliation.",
        }
      : collectionRegistry[collectionKey].page;
  return (
    <div aria-busy="true">
      <PageIntro {...copy} />
      <section className="page-container" aria-label="Loading collection">
        <div className="collection-search" aria-hidden="true">
          <Skeleton className="collection-query h-[46px]" />
          {collectionKey === "contradictions" ? null : (
            <Skeleton className="collection-sort h-[46px] w-44" />
          )}
          <Skeleton className="h-[46px] w-28" />
        </div>
        <div className="collection-results">
          <output>Loading results…</output>
        </div>
        <div
          className={
            collectionKey === "contradictions"
              ? "grid gap-5 md:grid-cols-2"
              : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton className="h-80 rounded-2xl" key={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function ArticleLoading() {
  return (
    <div className="article-reader page-container" aria-busy="true">
      <header className="reader-header">
        <div className="reader-heading">
          <output className="text-sm text-[var(--muted)]">
            Loading article…
          </output>
          <Skeleton className="mt-8 h-4 w-64 sm:mt-10" />
          <Skeleton className="mt-4 h-24 max-w-4xl" />
          <Skeleton className="mt-4 h-16 max-w-3xl sm:mt-5" />
        </div>
      </header>
      <Skeleton className="mt-8 h-20" />
      <div className="grid gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function EditorLoading() {
  return (
    <div className="page-container editor-page" aria-busy="true">
      <output className="sr-only">Loading editor…</output>
      <Skeleton className="h-36" />
      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <Skeleton className="h-[40rem]" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

export function AdminRowsLoading() {
  return (
    <div
      className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]"
      aria-busy="true"
    >
      <output className="sr-only">Loading articles…</output>
      {[0, 1, 2, 3, 4].map((item) => (
        <div className="border-b border-[var(--line)] p-5 sm:p-6" key={item}>
          <Skeleton className="h-24" />
        </div>
      ))}
    </div>
  );
}

export function AuthFormLoading({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="grid gap-5" aria-busy="true">
      <output className="sr-only">Checking your session…</output>
      {(mode === "signup"
        ? ["Email", "Password", "Confirm password"]
        : ["Email", "Password"]
      ).map((label) => (
        <div
          className="grid gap-2 text-sm font-medium"
          key={label}
          aria-hidden="true"
        >
          {label}
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ))}
      <Skeleton className="mt-1 h-11 w-full rounded-full" />
    </div>
  );
}

export function DebateLoading() {
  return (
    <>
      <PageIntro
        description="Bring a claim, follow the arguments, and build a response with sources you can return to."
        eyebrow="Think it through"
        title="Good questions start a conversation."
      />
      <section className="page-container debate-page" aria-busy="true">
        <div className="debate-shell">
          <div className="debate-status">
            <output>Loading conversation…</output>
          </div>
          <div className="min-h-[28rem] p-5 sm:p-7">
            <Skeleton className="mx-auto mt-12 h-56 max-w-xl" />
          </div>
          <Skeleton className="m-5 h-28" />
        </div>
      </section>
    </>
  );
}

export function AdminListLoading() {
  return (
    <div className="page-container editor-page" aria-busy="true">
      <AdminListHeading />
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full sm:w-96" />
        <Skeleton className="h-11 w-full sm:w-72" />
      </div>
      <AdminRowsLoading />
    </div>
  );
}

export function AdminAccessLoading() {
  return (
    <section className="page-container status-page" aria-busy="true">
      <Skeleton className="size-14 rounded-2xl" />
      <h1 className="mt-6 text-4xl">Editorial access</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
        <output>Checking editorial access…</output>
      </p>
      <Skeleton className="mt-7 h-11 w-28 rounded-full" />
    </section>
  );
}
