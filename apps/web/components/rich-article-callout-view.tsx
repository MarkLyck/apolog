import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { FiAlertTriangle } from "react-icons/fi";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export function CalloutView({ node, updateAttributes }: NodeViewProps) {
  return (
    <NodeViewWrapper className="editor-special editor-callout">
      <label className="editor-special-label" contentEditable={false}>
        <FiAlertTriangle aria-hidden="true" /> Callout title
        <input
          className={fieldClassName}
          onChange={(event) => updateAttributes({ title: event.target.value })}
          value={String(node.attrs.title ?? "")}
        />
      </label>
      <NodeViewContent className="editor-special-content" />
    </NodeViewWrapper>
  );
}
