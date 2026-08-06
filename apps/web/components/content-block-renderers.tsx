import type { ContentBlock, InlineContent } from "@apolog/shared";
import type { ReactNode } from "react";
import { FiAlertTriangle, FiBookOpen } from "react-icons/fi";

function applyMarks(content: ReactNode, marks: string[] | undefined) {
  let result = content;
  for (const mark of marks ?? []) {
    if (mark === "bold") {
      result = <strong>{result}</strong>;
    } else if (mark === "italic") {
      result = <em>{result}</em>;
    } else if (mark === "strikethrough") {
      result = <s>{result}</s>;
    } else {
      result = <code>{result}</code>;
    }
  }
  return result;
}

export function RichText({ content }: { content: InlineContent }) {
  return (
    <>
      {content.map((node) =>
        node.type === "link" ? (
          <a href={node.href} key={node.id} rel="noreferrer">
            {node.text}
          </a>
        ) : (
          <span key={node.id}>{applyMarks(node.text, node.marks)}</span>
        )
      )}
    </>
  );
}

export function ParagraphBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "paragraph" }>;
}) {
  return (
    <p>
      <RichText content={block.content} />
    </p>
  );
}

export function HeadingBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "heading" }>;
}) {
  return block.level === 2 ? (
    <h2>
      <RichText content={block.content} />
    </h2>
  ) : (
    <h3>
      <RichText content={block.content} />
    </h3>
  );
}

export function ListBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "list" }>;
}) {
  return (
    <ul>
      {block.items.map((item) => (
        <li key={item.id}>
          <RichText content={item.content} />
        </li>
      ))}
    </ul>
  );
}

export function CalloutBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
}) {
  return (
    <div
      className="my-8 rounded-[1.3rem] border border-[var(--accent)]/40 bg-[color:var(--accent)]/8 p-6"
      role="note"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]">
        <FiAlertTriangle aria-hidden="true" /> {block.title}
      </div>
      <p className="mb-0 mt-3 text-base!">
        <RichText content={block.content} />
      </p>
    </div>
  );
}

export function QuoteBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "quote" }>;
}) {
  return (
    <figure className="my-8 rounded-[1.3rem] border-l-4 border-[var(--teal)] bg-[var(--surface-strong)] p-6">
      <FiBookOpen aria-hidden="true" className="mb-4 text-[var(--teal)]" />
      <blockquote className="m-0 font-display text-xl leading-8">
        <RichText content={block.content} />
      </blockquote>
      <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {block.reference} · {block.edition}
      </figcaption>
    </figure>
  );
}

export function ClaimComparisonBlock({
  block,
}: {
  block: Extract<ContentBlock, { type: "claimComparison" }>;
}) {
  return (
    <section
      className="not-prose my-10 border-y border-[var(--line)] bg-[var(--surface-strong)]/55 py-8"
      aria-label="Claims compared"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {block.claims.map((claim) => (
          <div
            className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-7"
            key={claim.id}
          >
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              {claim.label}
            </div>
            <h2 className="mt-5 text-3xl">{claim.reference}</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              <RichText content={claim.content} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
