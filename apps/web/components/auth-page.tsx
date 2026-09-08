import type { ReactNode } from "react";
import { FiBookOpen } from "react-icons/fi";

import { AuthForm } from "./auth-form";
import { AuthFormLoading } from "./route-loading";

export function AuthPage({
  loading = false,
  description,
  mode,
  redirectTo,
  title,
}: {
  loading?: boolean;
  description: ReactNode;
  mode: "login" | "signup";
  redirectTo?: string;
  title: string;
}) {
  return (
    <section className="auth-page">
      <div className="auth-intro night-surface">
        <div className="page-eyebrow">
          <FiBookOpen aria-hidden="true" /> A little curiosity. A closer look.
        </div>
        <h2>
          Every question
          <br />
          deserves a closer look.
        </h2>
        <p>
          A source-led library for exploring faith, questioning claims, and
          following the evidence.
        </p>
      </div>
      <div className="auth-card">
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          Account access
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {loading ? (
          <AuthFormLoading mode={mode} />
        ) : (
          <AuthForm mode={mode} redirectTo={redirectTo} />
        )}
      </div>
    </section>
  );
}
