import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export function ScriptureView({ node, updateAttributes }: NodeViewProps) {
  return (
    <NodeViewWrapper className="editor-special editor-scripture">
      <div className="editor-special-fields" contentEditable={false}>
        <label>
          Reference
          <input
            className={fieldClassName}
            onChange={(event) =>
              updateAttributes({ reference: event.target.value })
            }
            placeholder="Genesis 1:1"
            value={String(node.attrs.reference ?? "")}
          />
        </label>
        <label>
          Translation / edition
          <input
            className={fieldClassName}
            onChange={(event) =>
              updateAttributes({ edition: event.target.value })
            }
            placeholder="NRSVUE"
            value={String(node.attrs.edition ?? "")}
          />
        </label>
      </div>
      <NodeViewContent className="editor-special-content" />
    </NodeViewWrapper>
  );
}
