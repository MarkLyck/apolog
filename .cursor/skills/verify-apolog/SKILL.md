---
name: verify-apolog
description: Verify Apolog's web UI after changes to browsing, search, article reading, contradictions, or debate. Launch isolated Next.js and Convex instances, drive user flows with the T3 browser, and retain evidence.
---

# Verify Apolog

Read the [feature map](features/README.md), then run the affected recipes. For a first smoke check, use collection search or corpus switching. Finish with evidence and cleanup, including after a failed attempt.

## Launch

Use Bun 1.3.13, Python 3, rsync, curl, and lsof. Run from the checkout root. The first Convex launch downloads its backend binary and needs network access.

The default run copies the current working files into a disposable directory, installs the locked dependencies, and starts a local anonymous Convex deployment. This tests uncommitted changes too. It excludes environment files and deployment credentials. Keep evidence in the original checkout, outside the runtime directory.

1. Choose three free ports. The commands below use 48163 for Next.js, 48164 for Convex queries, and 48165 for Convex HTTP actions. Check each with `lsof -nP -iTCP:48163 -sTCP:LISTEN`, substituting the other ports. Require no listeners on any address family. If occupied, choose another set and use it throughout. Do not stop another run's processes.
2. Check that `~/.convex/anonymous-convex-backend-state/anonymous-agent` does not exist. Convex 1.43.0 can reuse that legacy directory across projects. If it exists, use a separately provisioned development backend instead of this anonymous recipe. Do not delete someone else's state.
3. Create the runtime and evidence directories. Keep the printed evidence path for every later shell invocation.

```bash
verify_evidence="$PWD/.context/verification/$(date -u +%Y%m%dT%H%M%SZ)-$$"
verify_runtime=$(mktemp -d "${TMPDIR:-/tmp/}apolog-verify.XXXXXX")
mkdir -p "$verify_evidence"
printf '%s\n' "$verify_runtime" > "$verify_evidence/runtime-path.txt"
git rev-parse HEAD > "$verify_evidence/revision.txt"
git diff --binary HEAD > "$verify_evidence/working-tree.patch"
rsync -a --exclude=.git --exclude=node_modules --exclude=.next \
  --exclude=.turbo --exclude=.context --exclude=.convex \
  --exclude=.vercel --exclude='.env*' ./ "$verify_runtime/"
printf 'Evidence: %s\nRuntime: %s\n' "$verify_evidence" "$verify_runtime"
cd "$verify_runtime"
bun install --frozen-lockfile
```

4. Start Convex in an owned PTY session from the runtime directory. Save the session ID. Clear inherited deployment selectors even if the checkout already has a configured cloud deployment.

```bash
env CONVEX_AGENT_MODE=anonymous CONVEX_DEPLOYMENT= CONVEX_DEPLOY_KEY= CONVEX_DEPLOYMENT_TOKEN= \
  CONVEX_SELF_HOSTED_URL= CONVEX_SELF_HOSTED_ADMIN_KEY= \
  bunx convex dev --local-cloud-port 48164 --local-site-port 48165 \
  --codegen disable --typecheck disable > "$verify_evidence/convex.log" 2>&1
```

Wait for `Convex functions ready!` in the log. This command stays running. The runtime copy owns `.convex/local/default` and `.env.local`. Type checks are a separate gate; these flags do not make a type-check claim.

5. In a second shell, restore `verify_evidence` to the printed absolute path, then seed only this local instance.

```bash
verify_runtime=$(cat "$verify_evidence/runtime-path.txt")
cd "$verify_runtime"
env CONVEX_AGENT_MODE=anonymous CONVEX_DEPLOYMENT=anonymous:anonymous-agent \
  CONVEX_DEPLOY_KEY= CONVEX_DEPLOYMENT_TOKEN= CONVEX_SELF_HOSTED_URL= CONVEX_SELF_HOSTED_ADMIN_KEY= \
  bunx convex run seed:seed > "$verify_evidence/seed.json"
```

Require a successful exit and an article count in `seed.json`. The current fixture set contains eight articles across Bible and Quran. Seeding reconciles and overwrites matching fixture records. Never run this command against a shared deployment as routine verification.

6. Start the web app in another owned PTY session from the runtime directory. Save its session ID.

```bash
env CONDUCTOR_PORT=48163 SITE_URL=http://localhost:48163 \
  NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:48164 \
  CONVEX_SITE_URL=http://127.0.0.1:48165 \
  SESSION_SECRET= IP_HASH_SECRET= AI_GATEWAY_API_KEY= \
  bun run dev:web > "$verify_evidence/server.log" 2>&1
```

Wait for Next.js `Ready` in `server.log`. The root `dev:web` script loads `.env`; this disposable copy has none. Empty chat secrets intentionally exercise the unconfigured-service path. Do not copy production secrets into the runtime.

For an already provisioned development backend, start only `dev:web` with its matching URLs. Record that backend in the proof and report its shared state. Root `bun run dev` also pushes Convex functions, so it is not the default verification command. An old deployment may lack functions used by this checkout. A schema mismatch is a failed prerequisite, not an empty collection.

## Doctor

Run these read-only checks after launch and whenever a browser result looks wrong.

1. Inspect the three listeners with `lsof -nP -iTCP:48163 -sTCP:LISTEN` and the other two ports. For each PID, use `ps -p PID -o pid,ppid,comm` and `lsof -a -p PID -d cwd`. Require the runtime directory or its local Convex state directory. Save the actual PIDs and output in `doctor.txt`. Use `comm`, not the full argument list; Convex passes a local instance secret as a process argument.
2. Request the public search endpoint and retain the result.

```bash
curl --fail --silent --show-error \
  'http://localhost:48163/api/search/articles?text=bible&q=flood' \
  > "$verify_evidence/doctor-search.json"
cat "$verify_evidence/doctor-search.json"
```

Require a `results` array containing slug `global-flood-evidence` and title `Would a global flood leave a global signal?`. An HTTP 200 alone is insufficient; Next.js can stream an error page with status 200.
3. Run `preview_status`. If no automation-capable tab exists, run `preview_open`. Navigate the owned tab with `preview_navigate({target:{kind:"environment-port",port:48163,path:"/contradictions?text=bible"}})`. Require heading `Where the accounts pull apart.` and populated comparison links after loading. The heading `The evidence is still here.` means an application failure. Inspect both logs before driving further.

## Drive

Use the T3 `preview_*` tools when available. Retain the returned `tabId` and pass it to every call. A new tab is not a separate browser profile; the unique port provides a distinct origin, but cookies can still cross localhost ports. Use explicit corpus URLs and avoid account sign-in in the default smoke check.

Call `preview_snapshot({tabId,includeImage:false})` before interaction. Use its semantic names with `preview_click`, `preview_type`, and `preview_press`. Wait for a locator, text, or URL with `preview_wait_for`. Use `preview_evaluate` only to observe DOM, URL, cookies, or browser state. Do not inject application state or call internal setters to make a check pass.

If a click reports coordinates outside the viewport, scroll with `preview_scroll`, take another snapshot, and retry its locator. Confirm the resulting state even when a tool reports success. Scope the collection's Search button to its form so it cannot resolve to the header's search trigger.

The feature recipes show tool arguments with `tabId` omitted for readability; add the owned ID. Navigate through the UI for entry-point coverage. A direct URL is a separate entry point, not proof that its link works.

If T3 preview tools are absent or `preview_open` explicitly reports unsupported or unavailable, the existing `scripts/verify-design.py` provides an agent-browser route and layout sweep. It needs the agent-browser CLI, writes `.context/site-design-review`, and shares the fixed session name `apolog-design-check`. Run it alone, close that session afterward, and copy its artifacts into this run's evidence directory. It does not replace the action-and-result recipes here. Do not switch browser systems after an ordinary locator failure.

## Evidence

Start `preview_recording_start({tabId})` before the feature action. If recording fails after a retry, record that limitation and retain a sequence of action records and before/after snapshots instead. Save snapshot text with feature IDs and entry points. Use `preview_snapshot({tabId,save:true})` for PNG files. Copy the returned screenshot paths into `verify_evidence`. If recording started, stop it with `preview_recording_stop({tabId})` and copy its returned file there too.

Record the action, expected state, actual state, and pass/fail result in `results.md`. Include the checkout revision, working-tree patch, runtime URL, viewport, backend mode, and skipped entry points. For untracked application files, list the copied files in the report too. Preserve console errors, relevant response bodies, server logs, and exit codes. Do not publish credentials or `.convex` config files.

Exercise the real user path. Verify side effects separately from the final screen. Corpus switching writes `apolog-text`; confirm both the cookie and selected content. Current public article reading and search are read-only. Auth, editorial writes, and configured debate require their own mutation checks. Use real local Convex data; mocks belong only at an existing external-system boundary.

For debate's unconfigured path, record the actual `/api/chat` 503 and error body. From the runtime directory, run this read-only command before and after submission, saving each output. Require the table to remain empty. A simulated alert does not establish that external work was skipped.

```bash
env CONVEX_AGENT_MODE=anonymous CONVEX_DEPLOYMENT=anonymous:anonymous-agent \
  CONVEX_DEPLOY_KEY= CONVEX_DEPLOYMENT_TOKEN= CONVEX_SELF_HOSTED_URL= CONVEX_SELF_HOSTED_ADMIN_KEY= \
  bunx convex data rateLimits
```

## Cleanup

1. Stop any recording and copy its file, screenshots, and snapshots into the evidence directory before teardown.
2. Clear the owned browser tab with `preview_evaluate({tabId,expression:'location.replace("about:blank")'})`. Confirm `about:blank` with `preview_status`, even if the evaluation reports an error during navigation. Stop the web PTY with Ctrl-C, then stop the Convex PTY with Ctrl-C. Wait for both sessions to exit. These sessions own their child processes; never kill by process name. If a listener remains, confirm its saved PID and runtime cwd before terminating that specific process.
3. Repeat the listener checks for all three ports. Require no remaining owned listeners. If another process has acquired a port, identify it and leave it alone.
4. Read `runtime-path.txt`, confirm it is the disposable `apolog-verify.*` directory created for this run, then remove that directory. Keep the original checkout's `.context/verification` directory. Do not delete shared Convex caches or other runs' state.
5. Confirm that `results.md`, screenshots, action records or recording, and logs still exist in the evidence directory. Report the evidence path and any cleanup failure.

## Helpers and other checks

This skill uses the repository's existing commands and T3 tools; it adds no dependency or browser runner. `bun test`, `bun run check`, and `bun run build` remain separate code-quality gates documented in the root README. Run gates appropriate to the application change. The ingestion CLI is a secondary surface and is not covered by this browser map. Inspect its mode's file, network, and database effects before treating `dry-run` as read-only.

Use `/maintain-verification-skill` when routes, accessible names, fixtures, or launch behavior change.
