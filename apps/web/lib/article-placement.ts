import type { CollectionKey, CorpusKey } from "@apolog/shared";

interface Placement {
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
  isPrimary: boolean;
  position: number;
}

export function resolveArticlePlacement(
  placements: readonly Placement[],
  corpusKey: CorpusKey,
  requestedCollection: CollectionKey | null
) {
  const corpusPlacements = placements.filter(
    (placement) => placement.corpusKey === corpusKey
  );
  if (corpusPlacements.length > 0) {
    const requestedPlacement = requestedCollection
      ? corpusPlacements.find(
          (placement) => placement.collectionKey === requestedCollection
        )
      : null;
    return {
      placement:
        requestedPlacement ??
        corpusPlacements.find((placement) => placement.isPrimary) ??
        null,
      redirect: null,
    };
  }

  const requestedPlacement = requestedCollection
    ? placements.find(
        (placement) => placement.collectionKey === requestedCollection
      )
    : null;
  const fallback =
    requestedPlacement ??
    placements.find((placement) => placement.isPrimary) ??
    null;
  return {
    placement: null,
    redirect: fallback ? `/${fallback.collectionKey}?text=${corpusKey}` : null,
  };
}
