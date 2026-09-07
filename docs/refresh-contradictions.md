# Replace contradiction articles

Run commands from the repository root.

```bash
bun run contradictions:refresh prepare
```

The script fetches the contradiction index and detail pages in batches of four. It resolves their citations against full KJV passages and Douay-Rheims passages for the Apocrypha. It writes these files under `.context/contradictions/`:

- `prepared.json`: validated articles and a SHA-256 digest.
- `report.json`: article and quotation counts, unavailable pages, and errors.
- `cache/`: downloaded inputs. Repeated runs reuse them.

To fetch fresh inputs, pass a new artifact directory:

```bash
bun run contradictions:refresh prepare .context/contradictions-next
```

## Apply to the database

Set `NEXT_PUBLIC_CONVEX_URL` and a matching deployment-specific `CONVEX_DEPLOY_KEY` in an environment file. Deploy the backend functions before applying the import:

```bash
bunx convex deploy --env-file /absolute/path/to/.env
bun --env-file=/absolute/path/to/.env run contradictions:refresh apply
```

Pass the same artifact directory after `apply` if you prepared elsewhere.

`apply` backs up every existing contradiction article to a private `backup-<timestamp>.json` file before submitting the replacement. The backup contains article content, publication status, placements, tags, IDs, and versions. It is a content backup, not a complete Convex deployment export.

The internal mutation deletes every article with a contradiction placement, across all corpora, together with its placement, search, and tag relations. It inserts the prepared Bible articles and rebuilds their relations in the same transaction. Articles outside the contradiction collection stay in place. New slugs start with `bible-`; previous article IDs and URLs are replaced.

If an article changed after the backup, the mutation rejects the replacement. A failed mutation rolls back the entire transaction. Reapplying an unchanged artifact is a no-op. The script reads every replacement back and compares its content with the prepared articles.

To repeat the read-back check:

```bash
bun --env-file=/absolute/path/to/.env run contradictions:refresh verify
```

## Content and passage metadata

Each passage is a `quote` block. Its `reference` and `edition` fields are separate from the quotation in `content`. The existing renderer displays the quotation and its citation. Search indexes every quotation and reference; list-card metadata uses the first quote of each consecutive quotation group.

The importer does not reproduce the website's collection of original commentary. It retains short headings within a 25-word limit per article, including the title, and uses numbered passage groups otherwise. It expands cited ranges to complete verses, including citations in surrounding explanatory text. Ellipses, editorial annotations, and modern translations from the source are replaced with public-domain passage text. The creation example supplied in the task retains its supplied wording and headings, with separate edition labels for the supplied quotations.

Articles have no SAB mentions or links, including their slugs and source lists. The scraper's source URLs remain in the script and local cache.

`apps/ingest/src/contradictions/corrections.ts` records three citation corrections, the supplied creation wording, and a Book of Moses passage outside the Bible datasets. The KJV and Douay-Rheims datasets come from [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases). The [Douay-Rheims edition is public domain](https://ebible.org/engDRA/copyright.htm).

On September 7, 2026, the index displayed 571 but contained 566 links. Two detail records were unavailable: `long_day.html` and `temptgod.html`. Neither appeared in the prior imported catalog. They are explicitly recorded in the report. Any other acquisition or citation failure blocks replacement. The successful run prepared 564 articles with 3,376 quotations.

## Verify the importer

```bash
bun test apps/ingest/src/contradictions packages/backend/convex/contradictionImport.integration.test.ts
APOLOG_CONTRADICTION_ARTIFACT=.context/contradictions/prepared.json bun test packages/backend/convex/contradictionImport.integration.test.ts
```

The second command imports the actual prepared collection into Convex's test database. It checks all stored article content, search text, reference projections, old-relation cleanup, unrelated articles, stale-backup rejection, and repeat-run behavior. It does not contact the deployed database.
