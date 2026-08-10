import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  ...core,
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/convex/_generated/**",
    ".github/agents/impeccable-*.agent.md",
    ".github/skills/impeccable/**",
  ],
  overrides: [
    ...(core.overrides ?? []),
    ...(react.overrides ?? []),
    ...(next.overrides ?? []),
    {
      files: ["packages/backend/convex/**/*.ts"],
      rules: { "unicorn/filename-case": "off" },
    },
  ],
  plugins: [
    ...(core.plugins ?? []),
    ...(react.plugins ?? []),
    ...(next.plugins ?? []),
  ],
  rules: {
    ...core.rules,
    ...react.rules,
    ...next.rules,
    "func-style": "off",
    "import/consistent-type-specifier-style": "off",
    "no-await-in-loop": "off",
    "no-nested-ternary": "off",
    "prefer-destructuring": "off",
    "react/button-has-type": "off",
    "react/function-component-definition": "off",
    "react/react-compiler": "off",
    "require-await": "off",
    "sort-keys": "off",
    "typescript/consistent-type-definitions": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-sort": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-document-cookie": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/prefer-export-from": "off",
  },
});
