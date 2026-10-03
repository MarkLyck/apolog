# Read an article

Readers open a claim, inspect its reasoning and sources, and return to the collection or move to an adjacent article.

## Sub-features

- `article-card` opens the full article from a collection card.
- `article-direct` resolves a direct URL with its corpus and collection context.
- `article-sources` exposes references alongside the body.
- `article-navigation` preserves context through back and adjacent links.

## How to get to it (user POV)

- Choose an article card from a collection or the homepage's featured content.
- Choose a result from global search.
- Open `/articles/global-flood-evidence?from=debunked&text=bible` directly.
- Choose an enabled Previous or Next link on another article.

## Driving it with T3 preview

Preconditions: the local seed contains the flood article. Adjacent navigation requires at least two published articles in the chosen corpus and collection.

- **Card entry.** Navigate to `/debunked?text=bible`. Snapshot, then click `role=link[name="Would a global flood leave a global signal?"]`. Require `/articles/global-flood-evidence`, `from=debunked`, and `text=bible` in the URL.
- **Read.** Wait for the exact title in the h1. Require `Bible context`, body content, and `[aria-label="Article details"]` containing `Sources`. Snapshot the body and source references. Read external link URLs without following them unless outbound navigation is the behavior under test.
- **Back.** Click the link containing `Back to Debunked`. Require the collection route and Bible selection to return.
- **Direct and search entries.** Navigate to the direct URL above and require the same article state. Use the search recipe separately to prove result navigation.
- **Adjacent entry.** Snapshot an article with an enabled adjacent link. Scope to `nav[aria-label="Article navigation"] >> nth=0`, then choose the intended link from that snapshot. Require the neighboring title and preserved `from` and `text` parameters. Repeat in the other direction where available. Report this branch as skipped if the seed has no neighbor.

## Gotchas

- The top and bottom of the page both contain `Article navigation`. An unscoped link match may be ambiguous.
- An article unavailable in the selected corpus redirects to a collection. That redirect is not successful article rendering.
- Current public reading is read-only. Admin edit controls require separate authenticated verification.
- Seed quotations are demonstrations, not evidence of editorial accuracy.
