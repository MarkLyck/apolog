import type { RefObject } from "react";
import { FiSearch } from "react-icons/fi";

export function SearchTrigger({
  onOpen,
  triggerRef,
}: {
  onOpen: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      aria-label="Open search"
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--ink)] md:w-auto md:gap-2 md:px-4"
      data-search-trigger
      onClick={onOpen}
      ref={triggerRef}
      type="button"
    >
      <FiSearch aria-hidden="true" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden text-xs md:inline">⌘K</kbd>
    </button>
  );
}
