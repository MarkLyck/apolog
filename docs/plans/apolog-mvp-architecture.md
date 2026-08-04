# Apolog MVP Architecture and Implementation Plan

## Summary

Build Apolog as a public, account-free platform for critically examining the Bible and Quran: internal contradictions, factually debunked claims, immoral passages, conflicts with established evidence, and geographical or chronological claims.

A persistent Bible/Quran switch controls every data surface: landing-page recommendations, list pages, searches, related content, debate retrieval, and map entries. A record can apply to one corpus or both, but content from the other corpus must never leak into the active view unintentionally.

The MVP also includes hybrid keyword/semantic article search, a global Command-K palette, route-specific search metadata and social cards, and text-only debate powered by Vercel AI SDK, Vercel AI Gateway, and Grok 4.5. Voice chat and an authenticated admin editor remain future extensions.

## Architecture and Repository Structure

Use Bun workspaces with Turborepo. Pin the Bun version exactly in the root `packageManager` field, commit `bun.lock`, and use Bun for dependency installation and all repository scripts:

```text
apps/
  web/                 Next.js App Router site, search bridge, and /api/chat
  ingest/              Scraping, AI enrichment, verification, and import CLI
packages/
  backend/             Convex schema, functions, and generated API
  ui/                  Base UI-backed shadcn components and design tokens
  shared/              Valibot schemas, domain types, content blocks, prompts
  typescript-config/   Shared strict TypeScript configuration
```

- `apps/web`
  - Implements public pages, SEO metadata, structured data, sitemaps, generated social images, loading/error states, global search, and AI streaming.
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
  - Owns full-text indexes, vector indexes, article chunking state, and the hybrid result-ranking contract.
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
  - Run workspace tasks through `bun run` and Turbo; do not add pnpm, npm, or Yarn lockfiles or package-manager commands.
  - Pin every registry-backed `dependencies`, `devDependencies`, `optionalDependencies`, and `peerDependencies` entry to an exact version. Do not use caret, tilde, comparison, wildcard, `latest`, `next`, `canary`, or other floating tags.
  - Use Bun's `workspace:*` protocol only for packages that live inside this repository; it is the sole allowed non-exact manifest specifier. Pin Git dependencies to a full commit SHA rather than a branch or tag.
  - Treat the committed `bun.lock` as the exact transitive dependency graph. CI, Conductor, and Vercel install with `bun install --frozen-lockfile` and fail rather than rewriting it.
  - Add a repository check that scans every workspace manifest and fails when an external dependency is not exact, the root `packageManager` is not an exact `bun@x.y.z`, or an unexpected package-manager lockfile exists.
  - Pin third-party GitHub Actions by full commit SHA with the human-readable release in a comment. Dependency updates arrive as reviewed PRs that update the manifest pins and `bun.lock` together.
  - Configure Ultracite's React, Next.js, and Vitest presets over Oxlint and Oxfmt. ([Ultracite setup](https://www.ultracite.ai/))
  - Test with Vitest, Testing Library, `convex-test`, and Playwright.
  - Vercel's build runs the Convex deployment step before the Turbo-filtered web build.
  - Add `.conductor/settings.toml` with `bun install --frozen-lockfile` setup and one process-group dev command, invoked through the pinned Bun version, that starts Convex and Next.js on `CONDUCTOR_PORT`.
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

Shared article-list behavior for `/debunked`, `/immoral`, and `/evidence`:

- Uses nuqs-backed `?q=`, `?sort=newest|oldest|relevance`, and category-specific filter parameters so searches and sort choices are shareable and survive navigation.
- Defaults to `newest` when there is no query. `relevance` is available only when `q` is nonempty; clearing the query returns the sort to `newest` unless the user explicitly selected `oldest`.
- With no query, cursor-paginates 24 articles at a time through the corpus link projection ordered by the source article's creation timestamp.
- With a query, hybrid search combines full-text matches with semantic vector matches. The user can order the bounded result set by fused relevance, newest, or oldest; the UI requests a narrower query if the cap is reached.
- Search covers title, dek, tags, passage references, and the plain-text projection of article blocks.
- Search, sorting, corpus selection, and topic/finding filters compose rather than resetting one another.

Global search palette:

- Mount one accessible command-palette singleton in the root layout. Open it with Command-K on macOS, Control-K elsewhere, or a visible header button; Escape closes it and focus returns to the trigger.
- With no query it shows direct route commands, a Bible/Quran switch, and recent article destinations stored locally on that device.
- A query searches published Debunked, Immoral, and Evidence articles for the active corpus through the same hybrid service used by the list pages. Results are grouped by category and show title, dek, publication date, matched heading, and an excerpt taken only from stored article text.
- Return at most 12 palette results, followed by category-specific “View all results” links that preserve `?text=`, `?q=`, and `?sort=relevance`.
- Keyword results update immediately. Semantic search starts only for normalized queries of at least three characters after a 400 ms debounce; stale requests are cancelled or ignored so slower responses cannot replace newer ones.
- Arrow keys, Home/End, Enter, and Escape work as expected. The dialog/combobox has announced result counts, visible focus, IME-safe input handling, and a useful empty/error state.
- Selecting a result preserves the active corpus. The palette never mixes a record from the other corpus unless it has an explicit link to both.

- `/contradictions`
  - Uses `?q=` for search and the global `?text=` selection.
  - With no search query, cursor-paginates 24 results at a time by descending `effectiveObviousnessScore` using a compound Convex index.
  - With a search query, Convex full-text search retrieves at most 200 candidates, then the response sorts matches by `effectiveObviousnessScore`; search mode is intentionally not cursor-paginated, and the UI asks the user to refine the query if the cap is reached. This avoids pretending Convex search can natively combine relevance pagination with a custom score order. ([Convex full-text search](https://docs.convex.dev/search/text-search))
  - Cards show the score, short explanation, compared passage references, and source count.

- `/contradictions/[contradiction-slug]`
  - Shows two or more structured claim groups, their passages, the exact conflict, relevant textual context, common reconciliation attempts and responses, provenance, and claim-level citations.

- `/debunked`
  - Lists factually or historically challenged stories and claims for the active corpus.
  - Provides the shared article search and created-date sort controls.
  - Filters by topic and finding such as `contradicted`, `unsupported`, `anachronistic`, or `physically implausible`; the finding prevents every case from being overstated as the same kind of failure.

- `/debunked/[slug]`
  - Renders a structured article containing text, pictures, accessible tables, passage comparisons, evidence summaries, callouts, and citations.

- `/immoral`
  - Lists ethically objectionable passages, laws, commands, and stories for the active corpus.
  - Provides the shared article search and created-date sort controls.
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
  - Provides the shared article search and created-date sort controls.
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

## SEO and Social Sharing Contract

SEO is a route-level acceptance requirement rather than a final polish pass. Public list/detail content is rendered as meaningful HTML in the initial response; client JavaScript enhances filters, the command palette, chat, and MapLibre interactions but is not required to read an article or follow its internal links.

### Metadata and indexation

- Root metadata defines `metadataBase`, a title template, default description, application name, icons, and a default `twitter.card = "summary_large_image"`. Static metadata is used where possible; content-dependent pages use server-only `generateMetadata`. ([Next.js metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata))
- Each list page generates a unique title, description, canonical URL, Open Graph values, and introductory copy for its category and active corpus. `/debunked?text=bible` and `/debunked?text=quran`, for example, are separate canonical pages because their primary content differs.
- A list route without `text` performs a temporary redirect to the remembered corpus, or Bible when there is no cookie, so the displayed corpus and canonical URL are never ambiguous. URLs containing `q`, `sort`, topic/finding filters, pagination state, or `entry` use `robots: { index: false, follow: true }` and canonicalize to the clean category-and-corpus URL. Search engines can follow result links without indexing an unbounded set of query combinations.
- Each contradiction/article detail page loads its content once for both page rendering and `generateMetadata`, then emits a unique title, dek/summary description, canonical slug URL, publication and modification dates, category, linked corpus names, and social-image metadata. A `?text=` context never changes its canonical detail URL or SEO metadata; dual-linked content names both corpora while the selector may still tailor surrounding navigation.
- `/debate` may index its static explanatory landing content, but conversation state, API endpoints, command-palette results, and error/loading URLs are never indexable.
- Missing, draft, or archived slugs call `notFound()` and are excluded from metadata feeds. Draft/preview responses are explicitly `noindex`.
- `app/robots.ts` permits public content, disallows private/internal API and preview paths, and names the sitemap. `app/sitemap.ts` queries all published contradiction, article, and indexable map-list URLs and supplies `lastModified` from `updatedAt`; split with `generateSitemaps` before reaching search-engine limits. ([Next.js robots convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots), [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap))

### Structured, crawlable content

- The root emits `Organization` and `WebSite` JSON-LD. Detail routes emit an appropriate `Article`/`BlogPosting` object with headline, description, canonical URL, image, `datePublished`, `dateModified`, author attribution, publisher, and corpus/category keywords, plus `BreadcrumbList` for the visible breadcrumb trail. ([Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld))
- JSON-LD mirrors visible page facts, uses absolute URLs, and is serialized with `<` escaped to prevent script injection. Do not add FAQ, review, or rating markup unless the matching content is visibly present and eligible.
- Every page has one descriptive `h1`, a logical heading hierarchy, semantic landmarks, descriptive link text, accessible image alt text/captions/credits, and real HTML table headers and captions. Article pages add a table of contents where length warrants it.
- Related articles, linked contradictions, map entries, previous/next items, and corpus/category breadcrumbs form crawlable server-rendered internal links. The map includes the already-required server-rendered non-map list so its entries are discoverable without WebGL.
- The first list page and its detail links are server-rendered. Interactive cursor pagination is for users; all published detail URLs remain discoverable through internal links and the sitemap.

### Dynamic Open Graph cards

- Use `ImageResponse` from `next/og` to generate 1200×630 PNGs. The root uses `app/opengraph-image.tsx` with exported `alt`, `size`, and `contentType`; dynamic metadata points list and detail pages at a validated `app/og/route.ts` handler backed by a shared TSX renderer and carrying only stable category, corpus, slug, and content-version parameters. This is necessary because route-segment image functions receive dynamic path params but not the list page's `?text=` search parameter. ([Next.js generated OG-image convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image))
- The image route looks up all displayed content server-side rather than trusting title or image text from its URL. The content version in the image URL provides deterministic cache busting after edits. Twitter cards reuse the same tested image renderer and declare `summary_large_image`.
- A shared renderer enforces a recognizable fixed editorial design: Apolog mark, high-contrast category color, Bible/Quran label, restrained evidence/quotation motif, title, short supporting line, and domain. It uses bundled local fonts and no request-time dependency on remote font or logo servers.
- The root gets a durable brand card; list routes get category-and-corpus cards; every contradiction/article detail route gets a content-specific card sourced from the published record. `/debate` and `/map` get purpose-built route cards rather than inheriting a generic image. Long titles are clamped safely, optional hero art has a reliable fallback, and graphic article content is never shown by default.
- Social cards use a fixed light or dark art direction rather than the viewer's theme, remain legible at small feed sizes, and never render arbitrary HTML or unsanitized remote media URLs. Cache invalidation/revalidation follows the source record's version or `updatedAt` so an edit cannot leave stale social copy indefinitely.
- Visual tests render cards at 1200×630 for long titles, missing media, both corpora, every category, and non-ASCII text. Automated metadata tests assert canonical, robots, title, description, Open Graph image/alt/dimensions, Twitter card, and JSON-LD on every route class.

### Performance and measurement

- Target good Core Web Vitals: optimize and size editorial images, use local/subset fonts, reserve media dimensions, keep server/client boundaries narrow, and lazy-load MapLibre outside the map viewport. Metadata and primary copy must not wait for client hydration.
- Configure Search Console and privacy-conscious traffic/error measurement after deployment. Monitor indexed pages, sitemap failures, broken canonicals, rich-result errors, social-card response failures, and top zero-result searches without storing raw chat content.

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
| `articles` | Kind (`debunked`, `immoral`, or `evidence`), slug, title, dek, finding, content warnings, hero media, structured blocks, search text, status, version, `updatedAt`, publication time, import key |
| `articleCorpora` | Article ID, corpus key, projected article kind/status/creation/publication times, `updatedAt`; compound-indexed for efficient corpus/date lists |
| `tags` | Managed topic key, label, description, and content category |
| `articleTags` | Article ID, tag ID, and projected corpus key for indexed corpus/topic filtering |
| `media` | Convex storage ID, MIME type, dimensions, alt text, caption, credit, license, source URL |
| `mapEntryTypes` | Extensible type key, label, description, icon, and default styling |
| `mapEntries` | Slug, type ID, title, summary, chronology, passage references, comparison metrics, citations, certainty, status, version, import key |
| `mapEntryCorpora` | Map entry ID, corpus key, projected type/status; compound-indexed for corpus-scoped map queries |
| `geoFeatures` | GeoJSON geometry, label, current and historical place names, precision, uncertainty notes, provenance |
| `mapEntryFeatures` | Map entry ID, feature ID, role, display order, and styling overrides |
| `searchDocuments` | One denormalized document per content item and corpus, with content kind/ID, title, searchable text, status, source creation time, `updatedAt`, and ranking fields |
| `articleSearchState` | Article ID, corpus key, content hash, embedding model/version, active chunk version, indexing status/error, last indexed time, `updatedAt` |
| `articleChunks` | Search-state/article IDs, corpus key, article kind, chunk order, heading path, stored excerpt text, 1,536-dimensional embedding, chunk version/status, source creation time, `updatedAt` |
| `ingestionRuns` | Adapter, corpus key, source URL/hash, adapter/model/prompt versions, status, counts, errors, timestamps |

`articleCorpora`, `mapEntryCorpora`, `searchDocuments`, and the active article chunks deliberately duplicate small amounts of data. Convex mutations update or activate these projections atomically so corpus filtering and search remain indexed and do not scan array fields.

### Record timestamps

- Every document in an Apolog-owned Convex table uses Convex's automatic `_creationTime` as its canonical creation timestamp. Do not add a second `createdAt` field that could disagree with it. ([Convex system fields](https://docs.convex.dev/database/types#system-fields))
- Every Apolog-owned table requires an application-managed `updatedAt: number`, stored as UTC milliseconds and set to the same `Date.now()` value used by the enclosing mutation.
- Inserts set `updatedAt` immediately. Every mutation that changes a source record, relationship, status, projection, or ingestion result must update it atomically.
- System-managed Convex tables such as `_storage` and `_scheduled_functions` are excluded because their schemas are controlled by Convex.
- Re-importing an existing record preserves `_creationTime` and changes `updatedAt`; creating a genuinely new record receives a new `_creationTime`.
- Publication time remains a separate optional `publishedAt` field and must not replace either creation or update time.
- `articleCorpora.articleCreatedAt` and `searchDocuments.sourceCreatedAt` copy the source article's `_creationTime`. List sorting must use these projected values, not the link/projection document's own `_creationTime`.
- Add compound indexes for `articleCorpora` covering corpus key, article kind, publication status, and `articleCreatedAt`; query them ascending for oldest and descending for newest.
- `articleChunks.sourceCreatedAt` also copies the source article's `_creationTime`. `articleSearchState` and every chunk follow the same required `updatedAt` rule as all other Apolog-owned records.

### Hybrid article search and indexing

Convex provides indexed full-text and vector search, but it does not create embeddings. Apolog generates embeddings through Vercel AI Gateway and searches them from a Convex action, because Convex vector search is available only in actions. ([Convex vector search](https://docs.convex.dev/search/vector-search), [Convex search overview](https://docs.convex.dev/search/overview))

- Use `AI_EMBEDDING_MODEL=openai/text-embedding-3-small` through the AI SDK's `embed`/`embedMany` APIs. Store the model name, dimensions, chunking version, and content hash; the initial vector index has 1,536 dimensions. The model remains an environment setting, but a dimension change requires a new compatible index/version. ([AI Gateway embedding model](https://vercel.com/ai-gateway/models/text-embedding-3-small/faq))
- Before publication or a material article-version update, generate a deterministic plain-text document, then split it at paragraph/heading boundaries into roughly 600–900-token chunks with at most 100 tokens of overlap. Never split an exact passage quotation or table row merely to hit the target.
- Embed bounded batches with `embedMany`. Unchanged content hashes do not re-embed. Archiving an article deactivates its chunks and corpus search projections.
- Build the Convex vector index on `articleChunks.embedding`, with filter fields for `corpusKey`, article kind, and active status. Every query supplies the active corpus filter; kinds narrow the vector search when a list page or retrieval caller needs them.
- Stage embeddings under the same content version as the draft. Only after all chunks validate does one mutation publish the article/projections, activate the new chunk version, and deactivate the old one. A failed partial reindex records its error and leaves the last published content and matching search version serving traffic, so excerpts never describe a different revision than the article they open.
- Keyword search returns at most 200 article candidates. Semantic search requests at most 64 chunk matches, deduplicates them to their best article-level evidence, and retains the matched heading/excerpt.
- For relevance order, fuse keyword and semantic ranks with deterministic reciprocal-rank fusion using constant 60, then apply a documented exact-title boost and stable ID tie-breaker. Do not compare raw full-text and cosine scores directly. `newest` and `oldest` reorder the same bounded article candidate union by projected source creation time.
- Search results are navigation results, not AI-generated answers. Titles and excerpts come only from stored published content, and every item links to its canonical article.
- The debate retrieval path reuses this corpus-scoped hybrid service so command search, article lists, and debate context cannot drift into three different ranking/filtering implementations.

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
- `articles.list({ kind, corpusKey, query?, sort, tagKeys?, finding?, paginationOpts })`, where `sort` is `newest | oldest | relevance`
- `articles.getBySlug({ kind, slug })`
- `map.listEntries({ corpusKey, typeKeys?, topicKeys?, certainty? })`
- `map.getEntryBySlug({ slug })`
- `search.keywordArticles({ corpusKey, query, kinds?, limit })` as the low-latency public Convex query
- `search.hybridArticles({ corpusKey, query, kinds?, limit, sort? })` as the protected Convex action used by the web search bridge
- `retrieval.searchPublished({ corpusKey, query, kinds?, limit })`
- `home.getFeatured({ corpusKey })`

Import operations:

- A dedicated bearer-authenticated Convex HTTP action accepts bounded batches from `apps/ingest`; the secret is stored only in local/Convex environment configuration and is never a client-exposed value.
- Internal mutations upsert editions, passages, sources, citations, contradictions, articles, media, map entries, and features.
- `publishImportRun` publishes only records belonging to a fully validated run and atomically updates corpus links and search projections.
- Stable import keys preserve IDs and slugs across reruns.
- Validation rejects missing corpus links, unlicensed passage quotations, unverifiable quotation text, invalid GeoJSON, impossible coordinate ranges, and comparison metrics without methods and citations.

The public Next.js HTTP APIs are `POST /api/chat` and the bounded semantic-search bridge `GET /api/search/articles`. The search endpoint validates with Valibot, rate-limits anonymous sessions, accepts only known corpus/kind/sort values, caps query length and results, and calls the protected Convex action. All other content reads, including instant keyword typeahead, use typed Convex queries directly.

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
3. Implement passages, sources, citations, structured content, representative fixtures, and the shared server-rendered SEO/JSON-LD contract.
4. Build Contradictions, Debunked, Immoral, and Evidence list/detail experiences, including route-specific metadata and dynamic Open Graph cards.
5. Add full-text projections, chunk/version indexing, AI Gateway embeddings, Convex vector search, deterministic hybrid ranking, and the global Command-K palette.
6. Build the ingestion CLI, AI generation/scoring, quotation and citation verification, dry runs, idempotent staging, explicit publication, and embedding reindex commands.
7. Add AI Gateway debate, corpus-scoped hybrid retrieval, live-search citations, copy-ready responses, privacy controls, and abuse limits.
8. Build the generalized geography explorer with points, routes, regions, comparisons, deep links, filters, and accessible list mode.
9. Configure Vercel and Convex preview/production deployments, seed preview fixtures, submit sitemaps, and complete accessibility/performance/social-preview checks.

Test coverage includes:

- URL-versus-cookie precedence and selector persistence across every route.
- No Bible-only record appearing in Quran mode or Quran-only record appearing in Bible mode.
- Dual-linked articles and map entries appearing in both modes without duplicate cards.
- Corpus link/search projections remaining consistent after create, update, publish, archive, and re-import operations.
- Every Apolog-owned table exposing `_creationTime` and a required `updatedAt`, with `updatedAt` advancing on every mutation while `_creationTime` remains stable.
- Article corpus/search projections copying the source article creation time and preserving correct newest/oldest ordering even when links are rebuilt.
- Debunked, Immoral, and Evidence lists composing corpus, query, date sort, tags, findings, and pagination without dropping URL state.
- Article search sorting bounded candidates correctly by relevance, newest, and oldest, including the 200-candidate refinement state.
- Embedding jobs skipping unchanged hashes, activating only complete chunk versions, preserving the prior version after failures, and deactivating archived content.
- Hybrid search enforcing corpus/kind filters, deduplicating chunk hits by article, producing deterministic reciprocal-rank fusion, and never exposing draft content or text from the wrong corpus.
- Command-K/Control-K opening globally; focus restoration, keyboard/IME behavior, stale-response handling, recent items, route commands, result caps, and active-corpus preservation.
- Default contradiction pagination ordered by effective score and bounded search mode ordered by score.
- Claim groups containing valid passages and citation references.
- Rejection of invented, mismatched, unlicensed, or incorrectly attributed passage quotations.
- Citation coverage and broken-source handling.
- Immoral article filters, warnings, narrative/command distinctions, and apologetic-response blocks.
- GeoJSON validation for points, routes, polygon rings, and coordinate order.
- Map entries with multiple features, alternative hypotheses, and sourced comparisons.
- Debate retrieval enforcing the active corpus, prompt-injection resistance, source rendering, rate limits, cancellation, and provider errors.
- Server-rendered route content, responsive layouts, keyboard navigation, themes, accessible tables, and map list fallback.
- An SEO route matrix covering unique titles/descriptions, corpus-aware canonicals, `noindex,follow` query variants, robots rules, published-only sitemap entries, 404/draft behavior, internal links, and safe schema-valid JSON-LD.
- Dynamic Open Graph and Twitter metadata, including visual snapshots at 1200×630 for each route class, both corpora, long/non-ASCII titles, missing media, cache updates, and accessible alt text.
- Playwright journeys for every route, Bible/Quran switching, search deep links, debate copy flow, map deep links, and 404s.
- CI acceptance requires exact-dependency-policy validation, a frozen Bun install, formatting, linting, type checking, tests, and a production build from a clean checkout.

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
- `openai/text-embedding-3-small` through Vercel AI Gateway is the initial 1,536-dimensional embedding model; changing dimensions is a versioned migration, not an in-place configuration flip.
