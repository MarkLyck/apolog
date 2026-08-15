import base from "ultracite/oxfmt";

export default {
  ...base,
  ignorePatterns: [
    ...(base.ignorePatterns ?? []),
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".conductor/**",
    ".context/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".github/agents/impeccable-*.agent.md",
    ".github/skills/impeccable/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
    "tools/oxlint/anti-slop/**",
  ],
};
