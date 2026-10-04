import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";

const messageSchema = Schema.Struct({
  content: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(4000)),
  role: Schema.Literals(["user", "assistant"]),
});

const chatRequestSchema = Schema.Struct({
  corpusKey: Schema.Literals(["bible", "quran"]),
  messages: Schema.mutable(Schema.Array(messageSchema)).check(
    Schema.isMinLength(1),
    Schema.isMaxLength(24),
    Schema.makeFilter(
      (messages) =>
        messages.reduce((sum, message) => sum + message.content.length, 0) <=
        16_000,
      { message: "Conversation context exceeds 16,000 characters." }
    )
  ),
});

export type ChatRequest = typeof chatRequestSchema.Type;

export function validateChatRequest(
  input: unknown
):
  | { success: true; output: ChatRequest }
  | { success: false; issues: string[] } {
  const parsed = Schema.decodeUnknownResult(chatRequestSchema, {
    errors: "all",
  })(input);
  return Result.isSuccess(parsed)
    ? { output: parsed.success, success: true }
    : {
        issues: SchemaIssue.makeFormatterStandardSchemaV1()(
          parsed.failure.issue
        ).issues.map((issue) => issue.message),
        success: false,
      };
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAnonymousSession(secret: string): string {
  const id = randomBytes(24).toString("base64url");
  return `${id}.${sign(id, secret)}`;
}

export function verifyAnonymousSession(value: string, secret: string): boolean {
  const separator = value.lastIndexOf(".");
  if (separator < 1) {
    return false;
  }
  const id = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(id, secret);
  if (signature.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function rotatingIpHash(
  ip: string,
  secret: string,
  now = new Date()
): string {
  const dateBucket = now.toISOString().slice(0, 10);
  return createHmac("sha256", secret)
    .update(`${dateBucket}:${ip}`)
    .digest("hex");
}
