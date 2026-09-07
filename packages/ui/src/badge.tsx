import { cn } from "cnfast";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}
