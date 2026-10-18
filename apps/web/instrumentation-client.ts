import {
  defaultTrustedTypePolicy,
  isStaticChunkUrl,
} from "@/lib/trusted-types";

declare global {
  var trustedTypes:
    | {
        createPolicy: (
          name: string,
          rules: { createScriptURL: (input: string) => string | null }
        ) => { readonly name: string };
      }
    | undefined;
}

// Turbopack loads lazy chunks by assigning a plain string to script.src, then
// finds each chunk by its literal src attribute, so the input must pass through
// unchanged.
globalThis.trustedTypes?.createPolicy(defaultTrustedTypePolicy, {
  createScriptURL: (input) =>
    isStaticChunkUrl(input, new URL(globalThis.location.href)) ? input : null,
});
