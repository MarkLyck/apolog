import Link from "next/link";

import type { Crumb } from "@/lib/structured-data";

export function Breadcrumb({ crumbs }: { crumbs: readonly Crumb[] }) {
  const current = crumbs.at(-1);
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol>
        {crumbs.slice(0, -1).map((crumb) => (
          <li key={crumb.url}>
            <Link href={crumb.href}>{crumb.name}</Link>
          </li>
        ))}
        {current ? (
          <li>
            <span aria-current="page">{current.name}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
