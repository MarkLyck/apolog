# Apolog MVP Architecture and Implementation Plan

## Summary

Build Apolog as a public, account-free platform for critically examining the Bible and Quran: internal contradictions, factually debunked claims, immoral passages, conflicts with established evidence, and geographical or chronological claims.

A persistent Bible/Quran switch controls every data surface: landing-page recommendations, list pages, searches, related content, debate retrieval, and map entries. A record can apply to one corpus or both, but content from the other corpus must never leak into the active view unintentionally.

The MVP also includes text-only debate powered by Vercel AI SDK, Vercel AI Gateway, and Grok 4.5. Voice chat and an authenticated admin editor remain future extensions.

## Architecture and Repository Structure

Use pnpm workspaces with Turborepo:

```text
apps/
  web/                 Next.js App Router site and /api/chat
  ingest/              Scraping, AI enrichment, verification, and import CLI
packages/
  backend/             Convex schema, functions, and generated API
  ui/                  Base UI-backed shadcn components and design tokens
  shared/              Valibot schemas, domain types, content blocks, prompts
  typescript-config/   Shared strict TypeScript configuration
```

- `apps/web`
  - Implements public pages, SEO metadata, sitemap, loading/error states, and AI streaming.
  - Uses Tailwind CSS 4 with `@tailwindcss/postcss`.
  - Initializes shadcn explicitly with Base UI. ([shadcn Base UI documentation](https://ui.shadcn.com/docs/changelog/2026-01-base-ui))
  - Replaces shadcn's generated `cn` helper with `cnfast`.
  - Uses `@wrksz/themes/next` with cookie/hybrid storage for light, dark, and system themes. ([themes documentation](https://themes.wrksz.dev/))
  - Uses `react-icons` and MapLibre GL.
  - Server-renders all indexable list and detail content; client components are limited to filters, live updates, chat, and the map.

- `packages/backend`
  - Owns the Convex project and exports its generated typed API.
  - Exposes public read-only content queries and protected import operations.
  - Maintains denormalized read/search projections transactionally when content changes.
  - Supports separate Convex preview and production deployments. ([Convex Vercel deployment](https://docs.convex.dev/production/hosting/vercel))

- `apps/ingest`
  - Provides separate adapters for Bible and Quran sources.
  - Pipeline: acquire -> normalize -> validate -> generate original analysis -> verify quotations/citations -> dry-run report -> stage drafts -> explicit publication.
  - Uses stable import keys and source hashes so reruns update rather than duplicate records.
  - Records source URLs, adapter version, model, prompt version, input hash, validation results, and errors.
  - Stores raw acquisition snapshots outside Git and never republishes complete scraped annotations.
  - Respects source terms, robots directives, and rate limits; publication uses original wording plus traceable references.

- Tooling
  - Root scripts: `dev`, `build`, `test`, `typecheck`, `lint`, `format`, `format:check`, and `check`.
  - Configure Ultracite's React, Next.js, and Vitest presets over Oxlint and Oxfmt. ([Ultracite setup](https://www.ultracite.ai/))
  - Test with Vitest, Testing Library, `convex-test`, and Playwright.
  - Vercel's build runs the Convex deployment step before the Turbo-filtered web build.
  - Add `.conductor/settings.toml` with `pnpm install` setup and one process-group dev command that starts Convex and Next.js on `CONDUCTOR_PORT`.
  - Mark local Conductor run mode nonconcurrent while workspaces share one Convex development deployment.

## Neutral Domain Language and Bible/Quran Selection

Use neutral technical language throughout the codebase. The Bible and Quran are content corpora; the data model must not encode theological claims about their status or origin.

```ts
type CorpusKey = "bible" | "quran";
```

Naming rules:

- Use `corpus`, `edition`, `passage`, `passageReference`, `textualClaim`, and `claimedMiracle`.
- Do not use theological status labels or an unqualified supernatural claim in schemas, APIs, variables, or neutral interface copy.
- Quotations are called passage quotations or source-text quotations.
- The public control is labeled “Bible / Quran,” not with a theological category label.

Selector behavior:

- The selector is prominent in the global header on desktop and mobile.
- Canonical URL state is `?text=bible` or `?text=quran`, managed through nuqs.
- A `SameSite=Lax` cookie named `apolog-text` remembers the most recent choice for one year.
- URL state wins over the cookie; Bible is the fallback when neither exists.
- Navigation carries the active value into every list, debate, and map route.
- Every list, search, featured-content, retrieval, and map query requires a `corpusKey`.
- Many-to-many link tables associate articles and map entries with one or both corpora; do not filter array fields with full table scans.
- Contradictions belong to exactly one corpus because their compared claims are corpus-specific.
- Switching while viewing an item linked to both corpora keeps the current page and updates its context.
- Switching from a corpus-specific detail page navigates to the equivalent list for the new corpus.
- The active corpus is visibly stated beside page titles and in debate and map interfaces.

## Routes and Product Behavior

- `/`
  - Landing page whose featured contradictions, articles, geographical entries, and counts are scoped to the active corpus.
  - Includes the Bible/Quran switch, category explanations, map preview, and debate call-to-action.

- `/contradictions`
  - Uses `?q=` for search and the global `?text=` selection.
  - With no search query, cursor-paginates 24 results at a time by descending `effectiveObviousnessScore` using a compound Convex index.
  - With a search query, Convex full-text search retrieves at most 200 candidates, then the response sorts matches by `effectiveObviousnessScore`; search mode is intentionally not cursor-paginated, and the UI asks the user to refine the query if the cap is reached. This avoids pretending Convex search can natively combine relevance pagination with a custom score order. ([Convex full-text search](https://docs.convex.dev/search/text-search))
  - Cards show the score, short explanation, compared passage references, and source count.

- `/contradictions/[contradiction-slug]`
  - Shows two or more structured claim groups, their passages, the exact conflict, relevant textual context, common reconciliation attempts and responses, provenance, and claim-level citations.

- `/debunked`
  - Lists factually or historically challenged stories and claims for the active corpus.
  - Filters by topic and finding such as `contradicted`, `unsupported`, `anachronistic`, or `physically implausible`; the finding prevents every case from being overstated as the same kind of failure.

- `/debunked/[slug]`
  - Renders a structured article containing text, pictures, accessible tables, passage comparisons, evidence summaries, callouts, and citations.

- `/immoral`
  - Lists ethically objectionable passages, laws, commands, and stories for the active corpus.
  - Supports search and topic filters such as genocide, slavery, sexual violence, misogyny, child punishment, collective punishment, and religious intolerance.

- `/immoral/[slug]`
  - Shows an exact passage quotation with edition and reference.
  - Includes enough surrounding context to avoid misleading excerpts.
  - Distinguishes narration from commands, approval, punishment, and attributed speech.
  - States the ethical framework being applied, such as harm, consent, equality, proportionality, and modern human-rights standards.
  - Covers material translation disputes, historical context, common apologetic defenses, responses, and sources.
  - Displays content notices for graphic or sexual violence.
  - AI-generated text is forbidden inside passage quotation blocks; quotation blocks resolve to imported passage records.

- `/evidence`
  - Lists evidence topics relevant to claims commonly made about the active corpus.
  - Examples include evolution, Earth's shape, dating methods, fossils, and Neanderthals.
  - Evidence linked to both corpora appears in both modes through explicit corpus-link records.

- `/evidence/[slug]`
  - Shows the evidence article, methods, supporting media, claim-level citations, limitations, related textual claims, and links to relevant contradictions or debunked articles.

- `/debate`
  - Text-only chat built with `useChat`, `streamText`, and AI SDK UI message/source parts. ([AI SDK chatbot guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot))
  - Uses Vercel AI Gateway with `AI_MODEL=xai/grok-4.5`; model selection remains an environment setting.
  - Sends the active `corpusKey` with every request and retrieves only published material linked to that corpus.
  - Uses curated Apolog material first and provider-supported live web search when the library is insufficient or the claim is time-sensitive.
  - Treats retrieved pages and pasted claims as untrusted evidence, never as instructions.
  - Responses begin with a concise, natural, copy-ready rebuttal followed by expandable reasoning, caveats, and visible sources.
  - The assistant takes an atheist/agnostic, evidence-first position while criticizing claims rather than attacking people.
  - It distinguishes established fact, scholarly consensus, reasonable inference, and opinion; disputed interpretations are labeled.
  - Chat remains in browser state and raw conversations are not written to Convex.
  - Valibot validates roles, message count, per-message length, total context, and request shape.
  - Abuse controls combine a signed anonymous session ID, a rotating hash of the request IP, request/body/output caps, and Vercel AI Gateway spending limits. Raw IP addresses are not stored.

- `/map`
  - A generalized geography explorer for claims and narratives in the active corpus.
  - Supports claimed supernatural events, journeys, migrations, battles, conquests, claimed historical events, affected regions, competing location hypotheses, and distance/duration/scale comparisons.
  - Supports points, routes, regions, and multiple GeoJSON features per entry.
  - Example: Moses' journey can display origin/destination, proposed route reconstructions, the claimed 40-year duration, and a sourced modern walking-time comparison.
  - Every comparison states its method, assumptions, source, and uncertainty. A modern direct route is never presented as the exact ancient route.
  - Entry types are data records rather than a closed TypeScript union, allowing future categories without a schema migration.
  - Filters include corpus, entry type, topic, historical period, and geographic certainty.
  - Low-zoom points cluster; routes and regions remain independently selectable.
  - `?entry=<slug>` deep-links the selected side panel without adding another required route.
  - The panel contains a summary, passage references, chronology, comparison metrics, related content, and citations.
  - Includes a fully accessible, indexable non-map list view.
  - The MVP fetches the complete published map dataset for the active corpus and performs viewport filtering and clustering in the client. Convex has no assumed geospatial index in this design; add a geohash/tile projection only if corpus datasets become too large for a single payload.
  - Uses a configurable OpenFreeMap style initially.

All detail routes have stable slugs, server-rendered metadata, Open Graph data, sitemap entries, canonical URLs, structured article data, and proper 404 handling.

## Data Model and Interfaces

### Core Convex tables

| Table | Purpose and principal fields |
|---|---|
| `corpora` | Stable key (`bible` or `quran`), display name, description, enabled state, default edition ID |
| `editions` | Corpus key, code, title, language, translator/editor, publisher, license, source URL |
| `passages` | Edition ID, canonical reference key, display reference, sortable book/surah and passage range, licensed exact text |
| `sources` | URL, title, publisher, author, publication/access dates, source type, archive URL, license metadata |
| `citations` | Source ID, optional passage ID, locator/page/section, exact supporting excerpt where permitted, verification status |
| `contradictions` | Corpus key, slug, title, summary, claim groups, explanation blocks, citation IDs, search text, AI score, future editor score, effective score, scoring rationale/version, provenance, status, import key |
| `articles` | Kind (`debunked`, `immoral`, or `evidence`), slug, title, dek, finding, content warnings, hero media, structured blocks, search text, status, version, timestamps, import key |
| `articleCorpora` | Article ID, corpus key, projected article kind/status/published time; compound-indexed for efficient corpus lists |
| `tags` | Managed topic key, label, description, and content category |
| `articleTags` | Article ID, tag ID, and projected corpus key for indexed corpus/topic filtering |
| `media` | Convex storage ID, MIME type, dimensions, alt text, caption, credit, license, source URL |
| `mapEntryTypes` | Extensible type key, label, description, icon, and default styling |
| `mapEntries` | Slug, type ID, title, summary, chronology, passage references, comparison metrics, citations, certainty, status, version, import key |
| `mapEntryCorpora` | Map entry ID, corpus key, projected type/status; compound-indexed for corpus-scoped map queries |
| `geoFeatures` | GeoJSON geometry, label, current and historical place names, precision, uncertainty notes, provenance |
| `mapEntryFeatures` | Map entry ID, feature ID, role, display order, and styling overrides |
| `searchDocuments` | One denormalized document per content item and corpus, with content kind/ID, title, searchable text, status, and ranking fields |
| `ingestionRuns` | Adapter, corpus key, source URL/hash, adapter/model/prompt versions, status, counts, errors, timestamps |

`articleCorpora`, `mapEntryCorpora`, and `searchDocuments` deliberately duplicate small amounts of data. Convex mutations update these projections atomically so corpus filtering and search remain indexed and do not scan array fields.

### Contradiction structure and ranking

Each contradiction contains at least two claim groups:

```ts
type ContradictionClaimGroup = {
  label: string;
  claim: string;
  passageIds: Id<"passages">[];
  citationIds: Id<"citations">[];
};
```

`aiObviousnessScore` is an integer from 0 to 100 generated during ingestion. The saved scoring record includes subscores for semantic opposition, directness of wording, dependence on translation, dependence on chronology/context, and the number of extra assumptions required to reconcile the claims. `effectiveObviousnessScore` equals a future editor override when present and otherwise the AI score. Public ordering never triggers a new model call.

### Geography structure

`geoFeatures.geometry` supports GeoJSON `Point`, `LineString`, `MultiLineString`, `Polygon`, and `MultiPolygon` geometries. Coordinates are always stored as longitude/latitude and validated for legal ranges and valid polygon rings.

Initial feature roles are:

```ts
type GeoFeatureRole =
  | "event-site"
  | "origin"
  | "destination"
  | "claimed-route"
  | "alternative-route"
  | "comparison-route"
  | "affected-region"
  | "claimed-promised-region";
```

Initial `mapEntryTypes` seed records include `claimed-miracle`, `journey`, `battle`, `conquest`, `migration`, `claimed-event`, `geographic-claim`, `distance-comparison`, and `duration-comparison`.

Comparison metrics contain the claimed value, comparison value, normalized unit, calculation method, assumptions, uncertainty, citation IDs, and any feature IDs used in the calculation.

### Structured content contract

Define a Valibot-validated discriminated union for:

- Paragraphs, headings, and lists.
- Exact passage quotations and passage comparisons.
- General quotations.
- Images with alt text, caption, credit, and license.
- Accessible tables with explicit headers and captions.
- Callouts and content notices.
- Claim-level citation references.
- Apologetic argument/response pairs.
- Map embeds and sourced metric comparisons.

Passage quotation blocks reference `passages` records. Arbitrary HTML and executable MDX are not stored or rendered. A plain-text projection is generated from blocks for search and previews.

Convex uses its required `v` validators for database/function boundaries. Valibot validates import payloads, model output, rich documents, API requests, and environment variables.

### Backend interfaces

Public reads:

- `contradictions.list({ corpusKey, query?, paginationOpts })`
- `contradictions.getBySlug({ slug })`
- `articles.list({ kind, corpusKey, query?, tagKeys?, paginationOpts })`
- `articles.getBySlug({ kind, slug })`
- `map.listEntries({ corpusKey, typeKeys?, topicKeys?, certainty? })`
- `map.getEntryBySlug({ slug })`
- `search.query({ corpusKey, query, kinds?, limit })`
- `retrieval.searchPublished({ corpusKey, query, kinds?, limit })`
- `home.getFeatured({ corpusKey })`

Import operations:

- A dedicated bearer-authenticated Convex HTTP action accepts bounded batches from `apps/ingest`; the secret is stored only in local/Convex environment configuration and is never a client-exposed value.
- Internal mutations upsert editions, passages, sources, citations, contradictions, articles, media, map entries, and features.
- `publishImportRun` publishes only records belonging to a fully validated run and atomically updates corpus links and search projections.
- Stable import keys preserve IDs and slugs across reruns.
- Validation rejects missing corpus links, unlicensed passage quotations, unverifiable quotation text, invalid GeoJSON, impossible coordinate ranges, and comparison metrics without methods and citations.

The only public Next.js HTTP API is `POST /api/chat`; content reads use typed Convex queries.

## Editorial and Provenance Rules

- Do not present AI output as a source. AI organizes and drafts analysis; citations must resolve to imported passages or external sources.
- Every material factual claim must have at least one claim-level citation. Prefer primary sources, peer-reviewed work, established reference works, and direct archaeological or historical evidence.
- Preserve exact passage wording, edition, reference, and surrounding context separately from commentary.
- Clearly distinguish contradiction, falsehood, lack of evidence, implausibility, metaphor, moral criticism, and disputed interpretation.
- Describe claimed supernatural events as claims unless independently established evidence supports stronger wording.
- Store model ID, prompt version, adapter version, content hash, and verification results for reproducibility.
- Publication requires successful structural validation, quotation verification, citation coverage, and an explicit publish command.
- Future admin edits increment the content version and preserve the previous revision rather than silently overwriting published analysis.

## Delivery Sequence and Tests

1. Scaffold the monorepo, Next.js app, Convex backend, shared schemas, UI package, Conductor scripts, and quality tooling.
2. Implement `CorpusKey` and enforce Bible/Quran scoping in all link tables, projections, reads, URL state, and cookies.
3. Implement passages, sources, citations, structured content, SEO rendering, and representative fixtures.
4. Build Contradictions, Debunked, Immoral, and Evidence list/detail experiences.
5. Build the ingestion CLI, AI generation/scoring, quotation and citation verification, dry runs, idempotent staging, and explicit publication.
6. Add AI Gateway debate, corpus-scoped retrieval, live-search citations, copy-ready responses, privacy controls, and abuse limits.
7. Build the generalized geography explorer with points, routes, regions, comparisons, deep links, filters, and accessible list mode.
8. Configure Vercel and Convex preview/production deployments, seed preview fixtures, and complete accessibility/performance checks.

Test coverage includes:

- URL-versus-cookie precedence and selector persistence across every route.
- No Bible-only record appearing in Quran mode or Quran-only record appearing in Bible mode.
- Dual-linked articles and map entries appearing in both modes without duplicate cards.
- Corpus link/search projections remaining consistent after create, update, publish, archive, and re-import operations.
- Default contradiction pagination ordered by effective score and bounded search mode ordered by score.
- Claim groups containing valid passages and citation references.
- Rejection of invented, mismatched, unlicensed, or incorrectly attributed passage quotations.
- Citation coverage and broken-source handling.
- Immoral article filters, warnings, narrative/command distinctions, and apologetic-response blocks.
- GeoJSON validation for points, routes, polygon rings, and coordinate order.
- Map entries with multiple features, alternative hypotheses, and sourced comparisons.
- Debate retrieval enforcing the active corpus, prompt-injection resistance, source rendering, rate limits, cancellation, and provider errors.
- Server-rendered route content, metadata, canonical URLs, sitemap entries, responsive layouts, keyboard navigation, themes, accessible tables, and map list fallback.
- Playwright journeys for every route, Bible/Quran switching, search deep links, debate copy flow, map deep links, and 404s.
- CI acceptance requires formatting, linting, type checking, tests, and a production build from a clean checkout.

## Assumptions and Defaults

- English is the MVP language; Bible and Quran are the initial corpora.
- Bible is the fallback selection, but every data experience honors the active corpus.
- Every publishable article and map entry has at least one explicit corpus link.
- `/immoral` is the canonical route spelling.
- Geography is modeled generically and is not limited to claimed supernatural events.
- Map comparisons are explanatory tools, not automatic proof; methods and uncertainty remain visible.
- Passage imports require edition and license metadata.
- AI scores and analysis are stored with reproducibility metadata and are never silently regenerated at read time.
- No user accounts, saved chats, comments, submissions, admin UI, or voice mode are included.
- Vercel AI Gateway and Grok 4.5 are configurable through environment variables but are the MVP defaults.
