"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentProps } from "react";

export function IntentPrefetchLink(
  props: Omit<
    ComponentProps<typeof Link>,
    "onFocus" | "onMouseEnter" | "onTouchStart" | "prefetch"
  >
) {
  const [hasIntent, setHasIntent] = useState(false);
  const prefetchPage = () => setHasIntent(true);
  return (
    <Link
      {...props}
      onFocus={prefetchPage}
      onMouseEnter={prefetchPage}
      onTouchStart={prefetchPage}
      prefetch={hasIntent || null}
    />
  );
}
