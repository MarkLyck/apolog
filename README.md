# Apolog

Apolog is a source-first research experience for examining factual and moral claims in Bible and Quran content. The repository is a Bun/Turborepo monorepo with a Next.js web app, Convex backend, shared content contracts, UI components, and an ingestion CLI.

## Run locally

Requirements: Bun 1.3.13 and the project `.env` values.

```bash
bun install --frozen-lockfile
bun run dev
```

The web app starts at `http://localhost:${CONDUCTOR_PORT:-3000}` and the same command keeps the Convex development functions synchronized. The development database is already seeded with representative Bible and Quran content for every public content type.

Useful routes include `/debunked`, `/immoral`, `/evidence`, `/silly`, `/contradictions`, and `/debate`. Switch the active corpus in the header or use `?text=bible` / `?text=quran` explicitly.

Account creation and login are intentionally unlinked from the public interface. Visit `/signup` or `/login` directly. New accounts have the `user` role. To promote an account without exposing a browser-callable privilege escalation path, run:

```bash
bunx convex run userRoles:setByEmail '{"email":"you@example.com","role":"admin"}'
```

Add `--prod` to target the production deployment.

## Verify and maintain

```bash
bun test
bun run check
bun run convex:seed
bun run --cwd apps/ingest dry-run
```

`bun test` runs the unit and contract suite. `bun run check` additionally runs Oxfmt, Oxlint, Ultracite, React Doctor, Knip, exact-dependency validation, and TypeScript across every workspace. Run `bun run build` for the production build gate.

## App icons

`favicon.svg` is the source artwork: the header's white Newsreader semibold A, converted to paths, on Apolog's `#db3f27` accent. It needs no font at runtime. After editing it, run `bun run icons:generate` and include the generated files in your change.

The generator writes `apps/web/public/favicon.svg`, a 16/32/48px `favicon.ico`, the opaque 180px `apple-touch-icon.png` for iOS and iPadOS, and 192px/512px Android icons. `icon-maskable-512.png` adds padding for Android launcher masks. The root layout declares browser and Apple icons; `apps/web/app/manifest.ts` supplies the Android home-screen metadata.

The repository-root SVG lets [Conductor discover the icon](https://www.conductor.build/docs/faq#where-does-conductor-get-the-repo-icon) even though the web app lives in a monorepo. `t3.json` explicitly selects the same file for [T3 Code](https://github.com/pingdotgg/t3code/blob/main/packages/contracts/src/t3ProjectFile.ts). These files must be present in the checkout each tool opens. Existing installed home-screen shortcuts may need to be removed and added again to replace cached icons.

The bundled seed content is demonstrative. Fixture quotations that need licensed editorial verification are marked as such in their provenance metadata and must not be treated as publication-ready source text.
