# Apolog MVP Architecture and Implementation Plan

## Summary

Build Apolog as a public, account-free platform for examining contradictions, debunked claims, immoral passages, scientific evidence, and geographical claims associated with the Bible and Quran.

A persistent Bible/Quran switch controls all content across the application: landing-page recommendations, lists, searches, article relationships, debate retrieval, and map entries. Content relevant to both texts can be tagged for both and appears in either mode.

The MVP also includes text-only debate powered by Vercel AI SDK, Vercel AI Gateway, and Grok 4.5. Voice chat and an authenticated admin editor remain future extensions.

## Architecture and Repository Structure

Use pnpm workspaces with Turborepo:

```text
apps/
  web/                 Next.js App Router site and /api/chat
  ingest/              Scraping, AI enrichment, validation, and import CLI
packages/
  backend/             Convex schema, functions, and generated API
  ui/                  Base UI-backed shadcn components and design tokens
  shared/              Valibot schemas, domain types, content blocks, prompts
  typescript-config/   Shared strict TypeScript configuration
```

- `apps/web`
  - Implements all public pages, SEO metadata, sitemap, loading/error states, and AI streaming.
  - Uses Tailwind CSS 4 with `@tailwindcss/postcss`.
  - Initializes shadcn explicitly with Base UI. ([shadcn Base UI documentation](https://ui.shadcn.com/docs/changelog/2026-01-base-ui))
  - Replaces shadcn's generated `cn` helper with `cnfast`.
  - Uses `@wrksz/themes/next` with cookie/hybrid storage for light, dark, and system themes. ([themes documentation](https://themes.wrksz.dev/))
  - Uses `react-icons` and MapLibre GL.

- `packages/backend`
  - Owns the Convex project and exports its generated typed API.
  - Exposes public read-only content queries and secret-protected import operations.
  - Supports separate Convex preview and production deployments. ([Convex Vercel deployment](https://docs.convex.dev/production/hosting/vercel))

- `apps/ingest`
  - Provides separate adapters for Bible and Quran sources.
  - Pipeline: scrape/import -> normalize references -> validate -> generate original analysis and rankings -> dry-run report -> explicit publication.
  - Uses stable source IDs and hashes so reruns update rather than duplicate records.
  - Records source URLs, model, prompt version, input hash, results, and errors.
  - Never republishes complete scraped annotations. Scripture quotations require a translation with recorded reuse permission.

- Tooling
  - Root scripts: `dev`, `build`, `test`, `typecheck`, `lint`, `format`, `format:check`, and `check`.
  - Configure Ultracite's React, Next.js, and Vitest presets over Oxlint and Oxfmt. ([Ultracite setup](https://www.ultracite.ai/))
  - Add `.conductor/settings.toml` with `pnpm install` setup and one process-group dev command that starts Convex and Next.js on `CONDUCTOR_PORT`.
  - Mark local Conductor run mode nonconcurrent because workspaces share a Convex development deployment.

## Global Bible/Quran Selection

Define the shared type:

```ts
type SacredTextKey = "bible" | "quran";
```

The selector appears prominently in the global header on desktop and mobile.

- The canonical URL state is `?text=bible` or `?text=quran`, managed through nuqs.
- A cookie named `apolog-text` remembers the most recent choice.
- URL state wins over the cookie; Bible is the fallback when neither exists.
- Navigation automatically carries the active text into every list, debate, and map route.
- Every list and retrieval query requires a `textKey`.
- Articles and map entries use `textKeys: SacredTextKey[]`, allowing content to belong to Bible, Quran, or both.
- Contradictions belong to exactly one text because their passage comparisons are text-specific.
- Switching while viewing an item that supports both texts keeps the current page and updates its contextual links.
- Switching from a text-specific detail page navigates to the equivalent category list for the newly selected text.
- Search suggestions, featured content, related content, map results, and debate grounding never mix texts unless a record is explicitly tagged for both.
- The active text is visually clear near page titles and inside debate and map interfaces.

## Routes and Product Behavior

- `/`
  - Landing page whose featured contradictions, articles, geographical entries, and counts are filtered by the selected text.
  - Includes the scripture selector, category explanations, map preview, and debate call-to-action.

- `/contradictions`
  - Search through `?q=` and filter through the global `?text=`.
  - Default order is descending `effectiveObviousnessScore`.
  - Convex full-text search finds candidates; matching results are displayed in obviousness order. ([Convex full-text search](https://docs.convex.dev/search/text-search))

- `/contradictions/[contradiction-slug]`
  - Shows conflicting passages, explanation, textual context, common harmonizations and responses, provenance, and sources.

- `/debunked`
  - Lists factually or historically debunked stories and statements for the selected text.

- `/debunked/[slug]`
  - Renders a structured article containing text, pictures, tables, scripture comparisons, callouts, and citations.

- `/immoral`
  - Lists ethically objectionable passages, laws, commands, and stories for the selected text.
  - Supports search and topic filters such as genocide, slavery, sexual violence, misogyny, child punishment, collective punishment, and religious intolerance.

- `/immoral/[slug]`
  - Shows an exact quotation with its translation and reference.
  - Includes enough surrounding context to avoid quote-mining.
  - Explains what is commanded or portrayed, historical context, ethical implications, common apologetic defenses, responses, and sources.
  - Displays content notices for graphic or sexual violence.
  - AI-generated text is forbidden inside scripture quotation blocks; those blocks must reference imported passages.

- `/evidence`
  - Lists evidence topics relevant to the selected text and its common apologetic claims.
  - Examples include evolution, Earth's shape, dating methods, fossils, and Neanderthals.
  - Evidence applicable to both traditions is tagged with both text keys and appears in both modes.

- `/evidence/[slug]`
  - Shows the full evidence article, supporting media, sources, related claims, and links back to relevant contradictions or debunked articles.

- `/debate`
  - Text-only chat built with `useChat`, `streamText`, and AI SDK UI message/source parts. ([AI SDK chatbot guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot))
  - Uses Vercel AI Gateway with `AI_MODEL=xai/grok-4.5`.
  - The selected text is included explicitly in every request.
  - Curated retrieval searches only published content tagged for the selected text.
  - Grok live web search is available when the curated library is insufficient or the claim is time-sensitive.
  - Responses begin with a concise, human-sounding, copy-ready rebuttal followed by expandable reasoning and visible sources.
  - The assistant takes an atheist/agnostic, evidence-first position while criticizing claims rather than attacking believers.
  - Chat remains in browser state and is not persisted in Convex.
  - Valibot validates messages, roles, lengths, and request shape.
  - Anonymous cookie-based rate limiting caps requests, context size, and output length.

- `/map`
  - A generalized scripture-geography explorer, not a miracle-only map.
  - Shows any geographically representable claim or event, including:
    - Alleged miracles.
    - Journeys and migrations.
    - Battles and conquests.
    - Claimed historical events.
    - Regions controlled, promised, destroyed, or visited.
    - Competing location or route hypotheses.
    - Distance, duration, and scale comparisons.
  - Supports points, routes, regions, and multiple geographical features per entry.
  - Example: Moses' journey can display origin/destination, a proposed route, alternative reconstructions, the claimed 40-year duration, and a sourced modern walking-time comparison.
  - All comparisons must state methodology and uncertainty. A direct modern route must not be presented as the exact ancient route.
  - Filters include selected text, entry type, topic, historical period, and geographic certainty.
  - Low-zoom markers cluster; routes and regions remain independently selectable.
  - Selecting an entry opens a detail panel containing summary, scripture references, chronology, comparison metrics, related articles, and sources.
  - Includes a fully accessible non-map list view.
  - Uses a configurable OpenFreeMap style initially.

All detail routes have globally unique slugs, server-rendered metadata, Open Graph data, sitemap entries, canonical URLs, structured article data, and proper 404 handling.

## Database and Interfaces

### Convex tables

| Table | Purpose and principal fields |
|---|---|
| `texts` | Key (`bible` or `quran`), display name, description, enabled state, default translation ID |
| `translations` | Text ID, code, title, language, publisher, license, source URL, default flag |
| `scripturePassages` | Translation ID, canonical key, display reference, sortable book/surah and verse range, licensed exact text |
| `sources` | URL, title, publisher, author, publication/access dates, source type, license metadata |
| `contradictions` | Text key, slug, title, summary, explanation blocks, scripture references, sources, search text, AI score, future editor score, effective score, rationale, provenance, status, import key |
| `articles` | Kind (`debunked`, `immoral`, or `evidence`), text keys, slug, title, dek, tags, content warnings, hero media, structured blocks, scripture references, sources, search text, status, import key |
| `media` | Convex storage ID, MIME type, dimensions, alt text, caption, credit, license, source URL |
| `mapEntries` | Text keys, slug, entry type, title, summary, chronology, scripture references, comparison metrics, source IDs, related article IDs, certainty, status, import key |
| `geographies` | GeoJSON-compatible geometry type and coordinates, label, modern country/region, historical name, precision, uncertainty notes |
| `mapEntryGeographies` | Map entry ID, geography ID, role, display order, styling metadata |
| `ingestionRuns` | Source adapter, source text key, source URL/hash, model and prompt versions, status, counts, errors, timestamps |

There is no table or type named `miracleLocations`.

### Geography model

`geographies` supports:

```ts
type GeographyKind =
  | "point"
  | "line-string"
  | "multi-line-string"
  | "polygon"
  | "multi-polygon";
```

`mapEntryGeographies.role` supports values such as:

```ts
type GeographyRole =
  | "event-site"
  | "origin"
  | "destination"
  | "claimed-route"
  | "alternative-route"
  | "comparison-route"
  | "affected-region"
  | "promised-region";
```

`mapEntries.entryType` is an extensible string union initially containing:

```ts
type MapEntryType =
  | "miracle"
  | "journey"
  | "battle"
  | "conquest"
  | "migration"
  | "claimed-event"
  | "geographic-claim"
  | "distance-comparison"
  | "duration-comparison";
```

Comparison metrics contain:

- Claim label and value.
- Comparison label and value.
- Unit.
- Calculation methodology.
- Assumptions and uncertainty.
- Source IDs.
- Optional geography IDs used for the calculation.

This permits future map content without schema changes to a miracle-specific model.

### Structured content contract

Define a Valibot-validated discriminated union for:

- Paragraphs, headings, and lists.
- Exact scripture quotations and comparisons.
- General quotations.
- Images with alt text, caption, credit, and license.
- Accessible tables.
- Callouts and content notices.
- Citation lists.
- Apologetic argument/response pairs.
- Map embeds and sourced metric comparisons.

Scripture quotation blocks reference `scripturePassages` records. Arbitrary HTML and executable MDX are not stored or rendered.

Convex uses its required `v` validators for database and function boundaries. Valibot validates imports, AI output, rich documents, API requests, and environment variables.

### Backend functions

Public reads:

- `contradictions.list({ textKey, query?, paginationOpts })`
- `contradictions.getBySlug({ slug })`
- `articles.list({ kind, textKey, query?, tags?, paginationOpts })`
- `articles.getBySlug({ kind, slug })`
- `map.listEntries({ textKey, entryTypes?, topics?, certainty?, bounds? })`
- `map.getEntryBySlug({ slug })`
- `retrieval.searchPublished({ query, textKey, kinds?, limit })`
- `home.getFeatured({ textKey })`

Import-only operations:

- Secret-protected batch upserts for translations, passages, sources, contradictions, articles, media, map entries, and geographies.
- `publishImportRun` publishes only records belonging to a fully validated run.
- Stable import keys preserve document IDs and slugs across reruns.
- Validation rejects content without a text key, unlicensed quotations, invalid GeoJSON, impossible coordinate ranges, or comparison metrics without methodology and sources.

The only Next.js HTTP API is `POST /api/chat`; public content reads use typed Convex queries.

## Delivery Sequence and Tests

1. Scaffold the monorepo, Next.js application, Convex backend, shared schemas, UI package, Conductor scripts, and quality tooling.
2. Implement the global Bible/Quran state contract and require it across all list, featured-content, retrieval, and map queries.
3. Implement the database, structured content, scripture passages, sources, SEO, and fixture seeding.
4. Build Contradictions, Debunked, Immoral, and Evidence list/detail experiences.
5. Build the ingestion CLI with text-specific adapters, AI generation/scoring, quotation verification, dry runs, idempotent imports, and explicit publication.
6. Add AI Gateway debate, text-scoped retrieval, live-search citations, copy-ready responses, privacy controls, and rate limiting.
7. Build the generalized geography explorer with points, routes, regions, metric comparisons, filters, and accessible list mode.
8. Configure Vercel and Convex preview/production deployments and complete accessibility and performance checks.

Test coverage includes:

- URL-versus-cookie selector precedence and persistence across every route.
- No Bible-only record appearing in Quran mode or Quran-only record appearing in Bible mode.
- Dual-tagged articles and map entries appearing in both modes.
- Debate retrieval always receiving and enforcing the selected text.
- Draft visibility, category filtering, contradiction ordering, slugs, and import idempotency.
- Rejection of invented, mismatched, unlicensed, or incorrectly attributed scripture quotations.
- Immoral article filters, warnings, quotation context, and apologetic-response blocks.
- GeoJSON validation for points, routes, and polygons.
- Map entries with multiple features and competing route hypotheses.
- Distance/duration comparisons with missing sources, methodology, or uncertainty being rejected.
- Map filtering, clustering, route selection, detail panels, and accessible list fallback.
- Chat validation, rate limits, cancellation, provider errors, citation display, prompt injection, and copy-reply extraction.
- Playwright journeys for every route, Bible/Quran switching, search deep links, debate, map interaction, responsive layouts, and 404s.
- CI acceptance requires formatting, linting, type checking, tests, and production build to pass from a clean checkout.

## Assumptions and Defaults

- English is the MVP language; Bible and Quran are the initial text keys.
- Bible is the fallback selection, but every content experience honors the active selector.
- Every publishable content or map record must declare one or both text keys.
- `/immoral` is the canonical route spelling.
- Geography is modeled generically and is not limited to miracle locations.
- Map comparisons are explanatory tools, not automatic proof; methodology and uncertainty are always visible.
- Scripture imports require translation and license metadata.
- AI obviousness scores are stored during import with model, prompt version, rationale, and an optional future editor override.
- No user accounts, saved chats, comments, submissions, admin UI, or voice mode are included.
- Publication requires a successful validation run and an explicit CLI command.
- Vercel AI Gateway and Grok 4.5 are configurable through environment variables but are the MVP defaults.
