import { cn } from "cnfast";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
};

export function Card({ eyebrow, className, children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "group border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_16px_40px_-36px_color-mix(in_srgb,var(--ink)_45%,transparent)] transition duration-300 hover:border-[var(--ink)] hover:shadow-[0_20px_44px_-34px_color-mix(in_srgb,var(--ink)_38%,transparent)]",
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <div className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {eyebrow}
        </div>
      ) : null}
      {children}
    </article>
  );
}
