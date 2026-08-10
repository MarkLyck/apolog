import type { ReactNode } from "react";

import { AuthForm } from "./auth-form";

export function AuthPage({
  description,
  mode,
  redirectTo,
  title,
}: {
  description: ReactNode;
  mode: "login" | "signup";
  redirectTo?: string;
  title: string;
}) {
  return (
    <section className="editorial-grid px-5 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_24px_80px_color-mix(in_srgb,var(--ink)_10%,transparent)] sm:p-10">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Account access
        </div>
        <h1 className="mt-4 text-5xl leading-none">{title}</h1>
        <p className="mb-8 mt-5 leading-7 text-[var(--muted)]">{description}</p>
        <AuthForm mode={mode} redirectTo={redirectTo} />
      </div>
    </section>
  );
}
