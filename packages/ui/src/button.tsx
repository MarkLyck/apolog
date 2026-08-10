import { cn } from "cnfast";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-bold text-[var(--paper)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      type={type}
      {...props}
    />
  );
}
