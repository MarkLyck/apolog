import { cn } from "cnfast";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-[var(--line)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}
