"use client";

import { Button } from "@apolog/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { authFormConfig, passwordConfirmationError } from "./auth-form-model";
import type { AuthMode } from "./auth-form-model";

const fieldClassName =
  "min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20";

export function AuthForm({
  mode,
  redirectTo = "/",
}: {
  mode: AuthMode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = authFormConfig[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const confirmationError = passwordConfirmationError(
      mode,
      formData.get("password"),
      formData.get("confirmPassword")
    );
    if (confirmationError !== null) {
      setError(confirmationError);
      return;
    }

    formData.delete("confirmPassword");
    formData.set("flow", config.flow);
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", formData);
      router.replace(redirectTo);
    } catch {
      setError(config.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <p aria-live="polite" className="text-sm text-[var(--muted)]">
        Checking your session…
      </p>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="grid gap-5">
        <p className="leading-7 text-[var(--muted)]">
          You are already signed in.
        </p>
        <Button disabled={isSubmitting} onClick={handleSignOut}>
          {isSubmitting ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold" htmlFor={`${mode}-email`}>
        Email
        <input
          autoComplete="email"
          className={fieldClassName}
          id={`${mode}-email`}
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>

      <label
        className="grid gap-2 text-sm font-bold"
        htmlFor={`${mode}-password`}
      >
        Password
        <input
          autoComplete={config.passwordAutoComplete}
          className={fieldClassName}
          id={`${mode}-password`}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      {mode === "signup" ? (
        <label
          className="grid gap-2 text-sm font-bold"
          htmlFor="signup-confirm-password"
        >
          Confirm password
          <input
            autoComplete="new-password"
            className={fieldClassName}
            id="signup-confirm-password"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
      ) : null}

      {error === null ? null : (
        <p
          className="text-sm font-semibold text-[var(--accent-strong)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button className="mt-1 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? config.pendingLabel : config.submitLabel}
      </Button>
    </form>
  );
}
