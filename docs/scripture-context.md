# Scripture context beside quotations

Every quote footer shows its stored translation or edition. Recognized Bible references link to full chapters on Bible Gateway in KJV or Douay-Rheims. A reference spanning chapters gets a link for each chapter. The Book of Moses links to the text in the Pearl of Great Price and is explicitly distinguished from the Bible.

A supplied quotation without an identified edition keeps that label and displays a notice. It gets no guessed translation link. A KJV quotation with supplied clarification links to the unmodified KJV and explains the difference. Unsupported editions or reference formats keep their original labels and show that no verified chapter link is available.

`apps/web/lib/scripture-reference.ts` owns reference parsing, edition identification, and chapter URLs. It accepts named books with a chapter, verse range, chapter range, or a range crossing chapters. It deliberately does not interpret abbreviated citations or multi-book references.

## Wording and context notes

`apps/web/lib/scripture-notes.ts` contains 13 curated notes, with verse ranges and source readings. Each note names the specific issue and links to primary texts. Notes appear beside quotations overlapping those ranges; they are currently scoped to the identified KJV editions. Comparisons with NIV label both versions explicitly.

The notes address creation-order tense and vegetation, testing versus temptation, evil versus disaster, killing versus murder, hearing versus understanding, adjacent instructions in Proverbs, seeing God, repentance over Saul, the fig-tree chronology, beings called gods, family loyalty, and the speaker in Eliphaz's speeches.

This is a selective set of reviewed notes, not a claim that unflagged passages have no context issues. Notes describe what affects the argument without automatically changing an article's assessment or ranking. Add a note by identifying its exact verse range, explaining the consequence for the comparison, and checking the linked texts. Avoid treating a character's speech as the narrator's position or assuming one translation resolves the underlying question.

These additions render from existing article references and editions. They require no database migration or content rewrite and preserve the quotation text and inline emphasis.

## Validation

Run `bun test apps/web/components/quote-context.test.tsx` and `bun run check`.

The production-content snapshot checked during implementation contains 567 articles and 3,383 quotations. Chapter links resolve for 3,382 quotations. The remaining supplied quotation, 1 Corinthians 8:6 in `bible-who-created`, has no identified edition and displays the notice. The curated passage notes match 44 quotations across 29 articles, with separate edition notices for modified, unidentified, and non-Bible sources.
