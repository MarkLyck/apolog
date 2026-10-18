interface RelatedCandidate {
  publishedAt: number;
  slug: string;
  tags: readonly string[];
}

export function rankRelatedArticles<Candidate extends RelatedCandidate>(
  current: { slug: string; tags: readonly string[] },
  sameCollection: readonly Candidate[],
  topicMatches: readonly Candidate[],
  limit = 3
): Candidate[] {
  const currentTags = new Set(current.tags.map((tag) => tag.toLowerCase()));
  const sharedTags = (candidate: Candidate) =>
    candidate.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
  const collectionRanked = sameCollection
    .map((candidate) => ({ candidate, shared: sharedTags(candidate) }))
    .sort(
      (a, b) =>
        b.shared - a.shared || b.candidate.publishedAt - a.candidate.publishedAt
    )
    .map(({ candidate }) => candidate);
  const unique = new Map<string, Candidate>();
  for (const candidate of [...collectionRanked, ...topicMatches]) {
    if (candidate.slug !== current.slug && !unique.has(candidate.slug)) {
      unique.set(candidate.slug, candidate);
    }
  }
  return [...unique.values()].slice(0, limit);
}
