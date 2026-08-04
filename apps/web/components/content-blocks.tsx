import type { ContentBlock } from "@apolog/shared";
import { FiAlertTriangle, FiBookOpen } from "react-icons/fi";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-apolog">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return <h2 key={block.id}>{block.text}</h2>;
        }
        if (block.type === "paragraph") {
          return <p key={block.id}>{block.text}</p>;
        }
        if (block.type === "list") {
          return (
            <ul key={block.id}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "callout") {
          return (
            <div
              className="my-8 rounded-[1.3rem] border border-[var(--accent)]/40 bg-[color:var(--accent)]/8 p-6"
              key={block.id}
              role="note"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]">
                <FiAlertTriangle aria-hidden="true" /> {block.title}
              </div>
              <p className="mb-0 mt-3 text-base!">{block.text}</p>
            </div>
          );
        }
        return (
          <figure
            className="my-8 rounded-[1.3rem] border-l-4 border-[var(--teal)] bg-[var(--surface-strong)] p-6"
            key={block.id}
          >
            <FiBookOpen
              aria-hidden="true"
              className="mb-4 text-[var(--teal)]"
            />
            <blockquote className="m-0 font-display text-xl leading-8">
              {block.text}
            </blockquote>
            <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {block.reference} · {block.edition}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
