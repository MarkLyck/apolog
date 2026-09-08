import { cn } from "cnfast";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
};

export function Card({ eyebrow, className, children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition duration-200 hover:border-[var(--muted)] sm:p-8",
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <div className="mb-4 font-mono text-[0.68rem] font-medium uppercase tracking-wide text-[var(--muted)]">
          {eyebrow}
        </div>
      ) : null}
      {children}
    </article>
  );
}
