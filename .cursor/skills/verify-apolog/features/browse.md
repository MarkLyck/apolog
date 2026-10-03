# Browse and switch corpus

Readers browse a collection and switch between Bible and Quran content while staying in that collection.

## Sub-features

- `browse-collection` reaches each public collection through navigation.
- `browse-corpus` changes the selected corpus and displayed articles.
- `browse-corpus-persist` retains the selection without an explicit query parameter.
- `browse-mobile` keeps navigation and corpus controls usable at a narrow viewport.

## How to get to it (user POV)

- Choose a collection from the homepage or the header's `Primary` links.
- Open `/debunked`, `/immoral`, `/evidence`, `/silly`, or `/contradictions` directly with `?text=bible` or `?text=quran`.
- Choose `Bible` or `Quran` in `Choose text corpus`.

## Driving it with T3 preview

Preconditions: the launch and doctor checks pass with local seed data.

- **Collection entry.** Navigate to `/debunked?text=bible`, take a snapshot, and click `nav[aria-label="Primary"] >> role=link[name="Silly"]` at desktop width. Require `/silly?text=bible` and the card `A donkey debates a prophet—and spots the angel first`. For the homepage entry, navigate to `/?text=bible` and choose the Silly collection link from its library section using the snapshot.
- **Corpus change.** Run `preview_click({locator:'nav[aria-label="Choose text corpus"] >> role=link[name="Quran"]'})`. Wait for URL `text=quran` and card `Solomon understands an ant's traffic warning`. Require the Bible-only donkey card to be absent.
- **Persisted selection.** Observe `document.cookie` with `preview_evaluate`; require `apolog-text=quran`. Navigate to `/silly` without a corpus query. Require Quran content and `[aria-label="Choose text corpus"] a[aria-current="true"]` to read `Quran`. Navigate to `/silly?text=bible` and require Bible content despite the stored cookie.
- **Other collections.** Repeat the header entry for each collection affected by the change. Require the intended route, selected corpus, and populated content. Use the dedicated contradictions recipe for comparison behavior.
- **Mobile.** Run `preview_resize({mode:"freeform",width:390,height:844})`. Snapshot before choosing the same corpus controls. Open `summary[aria-label="Open navigation"]` to reach `nav[aria-label="Primary mobile"]` and choose a collection. Require the controls to remain usable and `document.documentElement.scrollWidth <= innerWidth`. Save a screenshot, then restore the original viewport.

## Gotchas

- URL corpus selection overrides the `apolog-text` cookie. A fresh tab may share cookies with other localhost tabs.
- Home and header links are different entry points. Prove the one your change affects.
- Fixtures are editorial demonstrations. This recipe checks content selection, not the truth of their claims.
