# Contradiction assessments

Comparison cards and article headers show two separate judgments: the inference needed to establish a conflict, and the importance of the claim. Reading order remains the existing editorial rank, which weighs both. None of these labels is a probability or a claim that a passage has only one possible reading.

| Textual conflict | Meaning |
| --- | --- |
| Direct contradiction | Explicit incompatible claims about the same subject and conditions, with little additional inference. |
| Interpretive tension | A substantive disagreement that depends on wording, scope, or narrative interpretation. |
| Weak tension | A conflict that needs substantial assumptions, such as treating omissions as denials. |
| No demonstrated contradiction | The supplied passages do not establish incompatible claims. |

Importance has five separate levels: incidental, minor, supporting, major, and foundational. A conflicting accession age can be direct with minor importance. The creation-order comparison has foundational importance while requiring an interpretation of the chronology in Genesis 2.

## Reviewed catalog

`packages/backend/src/contradiction-assessments.json` contains 567 reviewed assessments with an explicit classification, importance, reason, and source digest. It draws on the existing ranking review. Strength 5 initially maps to direct, 3–4 to interpretive, 2 to weak, and 0–1 to no demonstrated contradiction. This mapping is a starting point for editorial review, not runtime logic or a new ranking formula.

Six previously highest-strength entries were classified as interpretive after reviewing the inference they require: `bible-accounts`, `bible-humans`, `bible-abes-sons`, `bible-jehovah`, `bible-solomons-reign`, and `bible-flying`. Their reasons name the relevant tense, scope, chronology, or exception. Importance and reading order were retained.

The resulting catalog has 51 direct contradictions, 248 interpretive tensions, 121 weak tensions, and 147 entries with no demonstrated contradiction. Those last entries remain accessible as comparisons; their labels do not assert that a contradiction has been established.

## Matching assessments to content

The backend matches a review by slug and a SHA-256 digest of its title, summary, and document content. The canonical source includes passage references, editions, link destinations, group labels, and explanation text. It excludes generated IDs, inline emphasis, heading levels, rank, and timestamps.

A changed source returns `status: changed`; an unknown slug returns `status: unreviewed`. The UI withholds both old judgments and explains why assessment is pending. It never infers a classification from rank, tags, title keywords, or importance. Formatting changes alone preserve the assessment.

The manifest lives in the backend and is not shipped to browser bundles. Public article, pagination, search, and featured queries return the same small assessment shape. Publication permissions continue to apply before assessment lookup. No database migration, article rewrite, or rank update is needed; deployment makes the matching catalog assessments available automatically.

To review an edited or new article, inspect its current passages and explanation, choose the classification and importance independently, write a specific reason, and calculate its digest with `assessmentSourceDigest` in `packages/backend/src/assessment-source.ts`. Update the manifest in the same review. Do not refresh a digest without reviewing the changed argument.

## Verification

Run `bun run check`. Tests exercise the real Convex queries, matching card/detail results, changed-content detection, edition changes, formatting stability, rank preservation, and the displayed labels.

To check a complete article export in the shape `{ "articles": [...] }`:

```bash
bun run contradictions:verify-assessments /absolute/path/to/articles.json
```

The command rejects duplicate slugs, reports missing catalog entries and unmatched content, and exits unsuccessfully if any assessment cannot be applied. All 567 current production articles matched during implementation. The production check was read-only.
