import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import * as v from "valibot";

const messageSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(4000)),
  role: v.picklist(["user", "assistant"]),
});

const chatRequestSchema = v.object({
  corpusKey: v.picklist(["bible", "quran"]),
  messages: v.pipe(v.array(messageSchema), v.minLength(1), v.maxLength(24)),
});

export type ChatRequest = v.InferOutput<typeof chatRequestSchema>;

export function validateChatRequest(
  input: unknown
):
  | { success: true; output: ChatRequest }
  | { success: false; issues: string[] } {
  const parsed = v.safeParse(chatRequestSchema, input);
  if (!parsed.success) {
    return {
      issues: parsed.issues.map((issue) => issue.message),
      success: false,
    };
  }
  const totalCharacters = parsed.output.messages.reduce(
    (sum, message) => sum + message.content.length,
    0
  );
  if (totalCharacters > 16_000) {
    return {
      issues: ["Conversation context exceeds 16,000 characters."],
      success: false,
    };
  }
  return { output: parsed.output, success: true };
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
