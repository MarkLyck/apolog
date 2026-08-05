export function normalizeSearchQuery(query: string): string {
  return query.trim().replaceAll(/\s+/gu, " ");
}
