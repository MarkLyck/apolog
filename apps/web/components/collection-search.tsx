import {
  collectionRegistry,
  corpusKeys,
  corpusLabel,
  withCorpus,
} from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { Button } from "@apolog/ui";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiFilter, FiSearch } from "react-icons/fi";

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
          placeholder={`Search ${corpusLabel(corpusKey)} ${label.toLowerCase()}...`}
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
  if (query) {
    return (
      <div className="empty-state">
        <FiSearch aria-hidden="true" />
        <h2>No matches this time.</h2>
        <p>
          Try a different phrase or a passage reference. You can also clear your
          search to see the whole collection.
        </p>
        <Link
          className="text-link"
          href={`/${collectionKey}?text=${corpusKey}`}
        >
          Clear the search <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }
  const { href, label } = collectionRegistry[collectionKey];
  const corpus = corpusLabel(corpusKey);
  return (
    <div className="empty-state">
      <FiBookOpen aria-hidden="true" />
      <h2>
        No {corpus} articles in {label} yet.
      </h2>
      <p>
        Read this section in another library, or explore what the {corpus}{" "}
        library already has.
      </p>
      <div className="empty-state-actions">
        {corpusKeys
          .filter((key) => key !== corpusKey)
          .map((key) => (
            <Link
              className="empty-state-switch"
              href={withCorpus(href, key)}
              key={key}
            >
              See {corpusLabel(key)} {label} <FiArrowRight aria-hidden="true" />
            </Link>
          ))}
        <Link className="text-link" href={`/?text=${corpusKey}#explore`}>
          Explore the library <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
