# Search published analysis

Readers search within a collection or open the global search palette to find an article.

## Sub-features

- `search-collection` submits a query and preserves corpus selection.
- `search-empty-clear` shows no matches and restores the collection after clearing.
- `search-palette` returns matching articles and opens a selected result.
- `search-keyboard` opens and closes the palette with keyboard controls.

## How to get to it (user POV)

- Use the search form on a collection page such as `/debunked?text=bible`.
- Choose the header button `Open search`.
- Press Cmd-K on macOS or Ctrl-K on other platforms.
- Open a collection URL with `q`, `text`, and optional `sort` query parameters.

## Driving it with T3 preview

Preconditions: the local seed contains `global-flood-evidence`; doctor passes.

- **Collection match.** Navigate to `/debunked?text=bible`. Run `preview_type({locator:'role=searchbox[name="Search Debunked"]',text:"flood",clear:true})`, then `preview_click({locator:'form[aria-label="Search Debunked"] button[type="submit"]'})`. Wait for URL `q=flood`. Require `Would a global flood leave a global signal?` and `text=bible` in the URL.
- **No matches.** Replace the query with `zzzxnonexistentxzzz` and submit the same form. Wait for `No matches this time.`. Require zero `main a[href^="/articles/"]` links. Capture the submitted URL and empty state.
- **Clear.** Click `role=link[name="Clear the search"]`. Require `/debunked?text=bible`, an empty searchbox, and the flood card restored.
- **Palette entry.** Click `role=button[name="Open search"]`. Require `role=dialog[name="Search Apolog"]` and focus in `[aria-label="Search published analysis"]`. Type `flood` there. Wait for the dialog's link containing `Would a global flood leave a global signal?`. Capture `/api/search/articles` status and response from browser network evidence when available.
- **Keyboard entry.** Press Escape. Require the dialog to disappear and focus to return to `Open search`. Run `preview_press({key:"k",modifiers:["Meta"]})` on macOS, or use `Control` elsewhere. Require the same dialog. Exercise this separately from the button entry.
- **Open result.** In the populated dialog, click `role=dialog[name="Search Apolog"] >> a[href*="/articles/global-flood-evidence"]`. Require the article URL, matching h1, and the dialog to close. This step continues into the article recipe.

## Gotchas

- Global search waits 250 ms and requires at least two characters. Wait for the result, not a fixed delay.
- The dialog has two `Close search` buttons. Use Escape or a snapshot-provided unique locator.
- Collection search submits a GET form. Typing alone does not execute it.
- `Sort results` appears on ordinary collections. Contradictions use ranked order and omit that control. If changing sort behavior, use the native select through keyboard input and submit; seed ties cannot prove ordering of a larger dataset.
