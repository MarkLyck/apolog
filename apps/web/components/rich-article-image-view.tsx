import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import Image from "next/image";
import { useId } from "react";
import { FiAlertTriangle, FiImage, FiTrash2 } from "react-icons/fi";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export function ImageView({
  deleteNode,
  node,
  updateAttributes,
}: NodeViewProps) {
  const altHintId = useId();
  const src = String(node.attrs.src ?? "");
  const alt = String(node.attrs.alt ?? "");
  const missingAlt = alt.trim() === "";

  return (
    <NodeViewWrapper
      className="editor-special editor-image"
      contentEditable={false}
      data-missing-alt={missingAlt || undefined}
    >
      <div className="editor-contradiction-header" data-drag-handle>
        <span>
          <FiImage aria-hidden="true" /> Image
        </span>
        <button aria-label="Delete image" onClick={deleteNode} type="button">
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
      <div className="editor-image-body">
        <Image
          alt={alt}
          className="editor-image-preview"
          height={Number(node.attrs.height)}
          sizes="(min-width: 1024px) 900px, 100vw"
          src={src}
          width={Number(node.attrs.width)}
        />
        <div className="editor-special-fields">
          <label>
            Alt text (required)
            <input
              aria-describedby={missingAlt ? altHintId : undefined}
              aria-invalid={missingAlt}
              className={fieldClassName}
              onChange={(event) =>
                updateAttributes({ alt: event.target.value })
              }
              placeholder="Describe the image for readers who cannot see it"
              value={alt}
            />
          </label>
          <label>
            Caption (optional)
            <input
              className={fieldClassName}
              onChange={(event) =>
                updateAttributes({ caption: event.target.value || null })
              }
              placeholder="Shown below the image"
              value={String(node.attrs.caption ?? "")}
            />
          </label>
        </div>
        {missingAlt ? (
          <p className="editor-image-warning" id={altHintId}>
            <FiAlertTriangle aria-hidden="true" /> Add alt text before saving.
          </p>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}
