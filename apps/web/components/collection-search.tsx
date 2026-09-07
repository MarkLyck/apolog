import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { Button } from "@apolog/ui";
import Link from "next/link";
import { FiArrowRight, FiFilter, FiSearch } from "react-icons/fi";

export function CollectionSearch({
  collectionKey,
  corpusKey,
  query,
  sort,
}: {
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
  query: string;
  sort: "ranked" | "newest" | "oldest" | "relevance";
}) {
  const label = collectionRegistry[collectionKey].label;
  return (
    <form
      className="collection-search"
      method="get"
      aria-label={`Search ${label}`}
    >
      <input name="text" type="hidden" value={corpusKey} />
      <label className="collection-query">
        <FiSearch aria-hidden="true" />
        <span className="sr-only">Search {label}</span>
        <input
          defaultValue={query}
          name="q"
          type="search"
          placeholder={`Search ${corpusLabel(corpusKey)} ${label.toLowerCase()}…`}
        />
      </label>
      {sort === "ranked" ? null : (
        <label className="collection-sort">
          <FiFilter aria-hidden="true" />
          <span className="sr-only">Sort results</span>
          <select defaultValue={sort} name="sort">
            {query ? <option value="relevance">Most relevant</option> : null}
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      )}
      <Button type="submit">
        Search <FiArrowRight className="ml-3" aria-hidden="true" />
      </Button>
    </form>
  );
}

export function CollectionEmptyState({
  collectionKey,
  corpusKey,
  query,
}: {
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
  query: string;
}) {
  return (
    <div className="empty-state">
      <FiSearch aria-hidden="true" />
      <h2>{query ? "No matches this time." : "More questions to explore."}</h2>
      <p>
        {query
          ? "Try a different phrase or a passage reference. You can also clear your search to see the whole collection."
          : `There are no published articles in this ${corpusLabel(corpusKey)} collection yet. Explore another part of the library.`}
      </p>
      <Link
        className="text-link"
        href={
          query
            ? `/${collectionKey}?text=${corpusKey}`
            : `/?text=${corpusKey}#explore`
        }
      >
        {query ? "Clear the search" : "Explore the library"}{" "}
        <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}
