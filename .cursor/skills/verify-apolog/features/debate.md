# Debate a claim

Readers choose a suggested question or write their own, submit it, and receive a response or a clear service error.

## Sub-features

- `debate-prompt` fills the composer from a suggested question.
- `debate-empty` disables submission for an empty message.
- `debate-unconfigured` reports missing service configuration without consuming a rate limit.
- `debate-stream` displays an assistant response from the configured service.
- `debate-copy` copies the response text.

## How to get to it (user POV)

- Choose `Debate` in the header, footer, homepage, or search palette.
- Open `/debate?text=bible` or `/debate?text=quran` directly.
- Choose a suggested question or type into `Debate message`, then choose `Send message`.

## Driving it with T3 preview

Preconditions: default launch leaves `SESSION_SECRET`, `IP_HASH_SECRET`, and `AI_GATEWAY_API_KEY` empty. The success branch requires a deliberately configured test service and permission for its external usage cost.

- **Entry and empty state.** Navigate to `/debate?text=bible`. Require `Active library: Bible`, an empty `role=textbox[name="Debate message"]`, and a disabled `role=button[name="Send message"]`. Record the exact entry link when testing navigation instead of direct routing.
- **Prompt.** Click `role=button[name="How should I respond to a global flood claim?"]`. Require that exact text in the composer and an enabled Send button.
- **Unconfigured submit.** Save the parent skill's environment-isolated `convex data rateLimits` output before submission. Start browser recording, then click `role=button[name="Send message"]`. Wait for `role=alert` containing `The debate service is not configured.`. Require the user message to remain visible and no empty assistant response. Record the actual `/api/chat` response with status 503 and matching JSON error. Run the same table-read command again and require both snapshots to be empty.
- **Recovery.** Fill `Debate message` with another question. Require Send to become enabled again. Change to Quran with the header corpus control and require `Active library: Quran`.
- **Configured stream.** Only for a run intentionally configured for external AI use, submit one question and capture the streamed response followed by the idle composer state. Require a nonempty assistant response and `Copy response`. Record the rate-limit mutation and `apolog-session` response cookie from network evidence; do not publish the cookie value.
- **Copy.** Click `role=button[name="Copy response"]` after a successful response. Check the resulting clipboard value where permissions allow, or paste into a disposable local field. Compare it with the visible response. A clicked button alone is not proof of a clipboard write.

## Gotchas

- The default 503 branch is not proof that streaming works. Report configured response and clipboard checks as skipped when credentials are absent.
- Configured submission writes a rate-limit record and makes a paid external AI request. Avoid repeated submits during browser retries.
- Chat history is component state. A page reload does not prove server-side conversation persistence.
- Preserve response and database evidence before removing the disposable runtime.
