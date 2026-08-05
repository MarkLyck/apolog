# Apolog

Apolog is a source-first research experience for examining factual, moral, and geographic claims in Bible and Quran content. The repository is a Bun/Turborepo monorepo with a Next.js web app, Convex backend, shared content contracts, UI components, and an ingestion CLI.

## Run locally

Requirements: Bun 1.3.13 and the project `.env` values.

```bash
bun install --frozen-lockfile
bun run dev
```

The web app starts at `http://localhost:${CONDUCTOR_PORT:-3000}` and the same command keeps the Convex development functions synchronized. The development database is already seeded with representative Bible and Quran content for every public content type.

Useful routes include `/debunked`, `/immoral`, `/evidence`, `/silly`, `/contradictions`, `/map`, and `/debate`. Switch the active corpus in the header or use `?text=bible` / `?text=quran` explicitly.

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

The bundled seed content is demonstrative. Fixture quotations that need licensed editorial verification are marked as such in their provenance metadata and must not be treated as publication-ready source text.
