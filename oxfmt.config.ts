import base from "ultracite/oxfmt";

export default {
  ...base,
  ignorePatterns: [
    ...(base.ignorePatterns ?? []),
    ".github/agents/impeccable-*.agent.md",
    ".github/skills/impeccable/**",
  ],
};
