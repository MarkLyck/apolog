# Compare contradictions

Readers browse ranked passage comparisons, understand the assessment labels, and inspect the full comparison.

## Sub-features

- `contradictions-list` shows the collection total and comparison cards.
- `contradictions-guide` explains how to read assessment labels.
- `contradictions-search` narrows comparisons by query.
- `contradictions-assessment` shows a published assessment or an explicit unreviewed state.
- `contradictions-pagination` adds further comparisons without duplicates.

## How to get to it (user POV)

- Choose `Contradictions` in the header or homepage.
- Open `/contradictions?text=bible` or `/contradictions?text=quran`.
- Choose a comparison card, scroll toward the list end, or choose `Load more comparisons` when present.

## Driving it with T3 preview

Preconditions: launch and doctor pass. Pagination additionally requires more than 24 published comparisons in the selected corpus on an isolated backend.

- **List entry.** Click `nav[aria-label="Primary"] >> role=link[name="Contradictions"]`, then wait for `Where the accounts pull apart.`. Require comparison cards and the collection total. Save card titles and URLs from `main a[href^="/articles/"]` before further actions.
- **Guide.** Click `summary` with text `How to read the labels`. Observe its parent `details.open` with `preview_evaluate`. Require the guide text to be visible; click again and require it to close.
- **Search.** Type `zzzxnonexistentxzzz` into `role=searchbox[name="Search Contradictions"]` and submit `form[aria-label="Search Contradictions"] button[type="submit"]`. Require `No matches this time.`. Click `Clear the search` and require comparison cards to return.
- **Assessment.** Choose a card using its exact title from the snapshot. Require the article heading and `[aria-label="Comparison assessment"]`. Read the displayed classification and explanation, or the explicit state that no published assessment exists. Capture which branch occurred.
- **Pagination.** Return to the collection after the assessment step. With the larger dataset, record the initial unique card URLs. Scroll repeatedly using `preview_scroll({deltaY:600})` until the list end approaches the viewport, then wait for additional cards. If `Load more comparisons` is still available, exercise it separately. Require earlier cards to remain and all card URLs to be unique. Continue to exhaustion and require the loading control to disappear.

## Gotchas

- The default eight-article seed cannot exercise the pagination branch. Do not seed a shared deployment just to increase coverage.
- The scroll observer preloads within 600 px of the sentinel. Cards can load before the button is clicked; record that distinction.
- The collection total is not the search-match count. Do not assert they are equal.
- This collection has no sort selector. Ranking and assessment content need fixture-specific assertions when those rules change.
