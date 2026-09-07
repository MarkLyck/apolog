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
        "inline-flex min-h-11 rounded-full items-center justify-center border border-[var(--accent-strong)] bg-[var(--accent-strong)] px-5 text-sm font-medium text-white dark:text-[#172131] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      type={type}
      {...props}
    />
  );
}
