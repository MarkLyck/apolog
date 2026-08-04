"use client";

import type { CorpusKey } from "@apolog/shared";
import { Button } from "@apolog/ui";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { FiArrowUp, FiCopy, FiMessageCircle, FiUser } from "react-icons/fi";

import { AssistantMessage } from "./assistant-message";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const prompts = [
  "How should I respond to a global flood claim?",
  "What makes a contradiction more than a translation difference?",
  "How can I discuss morality without attacking believers?",
];

async function responseError(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return "Debate request failed.";
}

export function DebateClient({ corpusKey }: { corpusKey: CorpusKey }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const content = input.trim();
    if (!content || loading) {
      return;
    }
    const nextMessages: Message[] = [
      ...messages,
      { content, id: crypto.randomUUID(), role: "user" },
    ];
    const assistantId = crypto.randomUUID();
    setMessages([
      ...nextMessages,
      { content: "", id: assistantId, role: "assistant" },
    ]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        body: JSON.stringify({
          corpusKey,
          messages: nextMessages.map(({ content: text, role }) => ({
            content: text,
            role,
          })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok || !response.body) {
        throw new Error(await responseError(response));
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        answer += decoder.decode(value, { stream: true });
        setMessages([
          ...nextMessages,
          { content: answer, id: assistantId, role: "assistant" },
        ]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Debate request failed."
      );
      setMessages(nextMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_30px_90px_-50px_rgba(0,0,0,0.4)]">
      <div className="border-b border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)]">
        Active library:{" "}
        <strong className="text-[var(--ink)]">
          {corpusKey === "bible" ? "Bible" : "Quran"}
        </strong>
        <span className="ml-2">· Conversations stay in this browser.</span>
      </div>
      <div className="min-h-[28rem] p-5 sm:p-7">
        {messages.length === 0 ? (
          <div className="mx-auto grid max-w-2xl place-items-center py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-[var(--surface-strong)] text-2xl text-[var(--accent-strong)]">
              <FiMessageCircle aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-3xl">Build a clear, sourced response.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Ask about a claim or paste an argument. The response starts
              concise, then preserves reasoning and caveats.
            </p>
            <div className="mt-8 grid w-full gap-2 sm:grid-cols-3">
              {prompts.map((prompt) => (
                <button
                  className="rounded-xl border border-[var(--line)] p-3 text-left text-xs font-semibold leading-5 hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]"
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="mx-auto grid max-w-3xl gap-6">
            {messages.map((message) => (
              <li className="flex gap-3" key={message.id}>
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-strong)]">
                  {message.role === "user" ? (
                    <FiUser aria-hidden="true" />
                  ) : (
                    "A"
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    {message.role === "user" ? "You" : "Apolog"}
                  </div>
                  {message.role === "assistant" && message.content ? (
                    <AssistantMessage content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-7">
                      {message.content || "Thinking through the evidence…"}
                    </div>
                  )}
                  {message.role === "assistant" && message.content ? (
                    <button
                      className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                      onClick={() =>
                        navigator.clipboard.writeText(message.content)
                      }
                      type="button"
                    >
                      <FiCopy aria-hidden="true" /> Copy response
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      <form
        className="border-t border-[var(--line)] p-4 sm:p-5"
        onSubmit={handleSubmit}
      >
        <label className="flex items-end gap-3 rounded-[1.3rem] bg-[var(--surface-strong)] p-2 pl-4">
          <span className="sr-only">Debate message</span>
          <textarea
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-3 text-sm outline-none placeholder:text-[var(--muted)]"
            maxLength={4000}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Paste a claim or ask a question…"
            rows={1}
            value={input}
          />
          <Button
            aria-label="Send message"
            className="size-11 p-0"
            disabled={!input.trim() || loading}
            type="submit"
          >
            <FiArrowUp aria-hidden="true" />
          </Button>
        </label>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        ) : null}
        <p className="mt-3 text-xs text-[var(--muted)]">
          AI can be wrong. Follow the visible sources and verify important
          claims.
        </p>
      </form>
    </div>
  );
}
