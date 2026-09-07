---
name: thermos
description: "Launch both thermo-nuclear review passes in parallel, then synthesize their findings. Use for thermos, $thermos, double thermo review, or combined bug/security and code-quality branch audits."
disable-model-invocation: true
---

# Thermos

Run the two thermo review passes in parallel, then synthesize their results.

This skill is host-agnostic. Cursor has named review subagents. Codex CLI does not. Do not invent Cursor `Task` `subagent_type` names on a host that does not provide them.

## Workflow

1. Determine the review scope from the user request, PR, current branch, or relevant changed files. Default merge base is `main` (or `qa` when that is the repo's ship branch).
2. Gather the diff and the full contents of changed files so reviewers can evaluate the change without guessing. Typical commands: `git diff <base>...HEAD`, `git diff --stat <base>...HEAD`, and the contents of every changed file.
3. Run both review passes against that same scoped diff. Keep the two finding lists separate until synthesize.

   - Correctness / security / breakages / devex / feature-flag leaks: follow the sibling skill `thermo-nuclear-review` (`../thermo-nuclear-review/SKILL.md`, or `$HOME/.agents/skills/thermo-nuclear-review/SKILL.md`).
   - Maintainability / structure / 1k-line / spaghetti / code-judo: follow the sibling skill `thermo-nuclear-code-quality-review` (`../thermo-nuclear-code-quality-review/SKILL.md`, or `$HOME/.agents/skills/thermo-nuclear-code-quality-review/SKILL.md`).

   Host dispatch, in order:

   - If this host has named subagents `thermo-nuclear-review-subagent` and `thermo-nuclear-code-quality-review-subagent`, launch both in parallel (`run_in_background: true` when that exists) with the gathered diff and file contents.
   - Else if this host can spawn unnamed parallel child agents, spawn two. Give each the matching sibling `SKILL.md` as its full rubric plus the same `### Git / diff output` and `### Changed file contents` sections. Do not nest further agents.
   - Else run both sibling skills sequentially in this session. Do not mix findings across passes until the synthesize step.

4. After both finish, synthesize with findings first, deduplicated across reviewers. Weight overlapping findings more heavily, resolve disagreements with your own judgment, and keep summaries brief.

If individual background summaries are already visible to the user, do not restate them wholesale. Surface the unified verdict, the highest-signal findings, and any remaining uncertainty.
