# Apolog verification map

Use this map after the parent [launch and doctor steps](../SKILL.md). Each recipe assumes the local seeded backend, `http://localhost:48163`, and an owned T3 preview tab. Repeat affected entry points independently. Record a skipped path and its unmet prerequisite instead of inferring coverage from another path.

## Features

| Recipe | Coverage | Additional prerequisites |
| --- | --- | --- |
| [Browse and switch corpus](browse.md) | Collections, corpus selection, mobile navigation | Seed data |
| [Search](search.md) | Collection form, empty state, global palette, keyboard entry | Seed data |
| [Read an article](articles.md) | Cards, direct links, sources, adjacent navigation | Seed data; adjacent articles for next/previous checks |
| [Compare contradictions](contradictions.md) | Comparison cards, labels, assessments, pagination | More than 24 comparisons for pagination |
| [Debate](debate.md) | Prompts, composer, unconfigured error, streaming and copy | External service credentials only for the success branch |

## Coverage boundaries

The initial smoke check needs one complete mapped flow with recorded actions, resulting state, and retained evidence. This is not full regression coverage. The eight-article seed does not prove pagination.

Authentication, administrator article editing, ingestion, and production deployment are outside these five initial recipes. `/login` and `/signup` are deliberately unlinked. `/admin/articles` requires an administrator account; creating a normal account does not grant that role. Add dedicated recipes when changing these features. Record untested behavior explicitly.

The existing `scripts/verify-design.py` lists additional routes and viewport checks. Prefer T3 browser tools for those checks when available. A screenshot sweep does not establish form submission, navigation, or persisted state.

## Maintenance sources

Read `apps/web/app`, `apps/web/components`, `packages/shared/src/demo-content.ts`, and `packages/backend/convex` when updating the map. Check recipe names against live snapshots. Keep each feature file's four sections in order. Use `/maintain-verification-skill` to reconcile changes.
