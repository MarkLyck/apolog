import { cn } from "cnfast";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
};

export function Card({ eyebrow, className, children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "group rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_60px_-38px_rgba(10,20,18,0.42)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_24px_70px_-34px_rgba(16,93,76,0.35)]",
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <div className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          {eyebrow}
        </div>
      ) : null}
      {children}
    </article>
  );
}
