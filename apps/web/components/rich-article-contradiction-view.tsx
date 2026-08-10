import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { FiColumns, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

import type { ContradictionClaim } from "./article-editor-content";
import {
  emptyContradictionClaim,
  inlineContentText,
  replaceInlineContentText,
} from "./article-editor-content";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export function ContradictionView({
  deleteNode,
  node,
  updateAttributes,
}: NodeViewProps) {
  const rawClaims = Array.isArray(node.attrs.claims)
    ? (node.attrs.claims as ContradictionClaim[])
    : [];
  const claims =
    rawClaims.length >= 2
      ? rawClaims
      : [emptyContradictionClaim(0), emptyContradictionClaim(1)];
  const updateClaim = (
    index: number,
    field: "label" | "reference",
    value: string
  ) => {
    updateAttributes({
      claims: claims.map((claim, claimIndex) =>
        claimIndex === index ? { ...claim, [field]: value } : claim
      ),
    });
  };
  const updateClaimText = (index: number, value: string) => {
    updateAttributes({
      claims: claims.map((claim, claimIndex) =>
        claimIndex === index
          ? {
              ...claim,
              content: replaceInlineContentText(claim.content, value),
            }
          : claim
      ),
    });
  };

  return (
    <NodeViewWrapper
      className="editor-special editor-contradiction"
      contentEditable={false}
    >
      <div className="editor-contradiction-header" data-drag-handle>
        <span>
          <FiColumns aria-hidden="true" /> Contradiction comparison
        </span>
        <button
          aria-label="Delete contradiction"
          onClick={deleteNode}
          type="button"
        >
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
      <div className="editor-claim-grid">
        {claims.map((claim, index) => (
          <div className="editor-claim" key={claim.id}>
            <label>
              Label
              <input
                className={fieldClassName}
                onChange={(event) =>
                  updateClaim(index, "label", event.target.value)
                }
                value={claim.label}
              />
            </label>
            <label>
              Passage or source
              <input
                className={fieldClassName}
                onChange={(event) =>
                  updateClaim(index, "reference", event.target.value)
                }
                placeholder="Genesis 1:20–27"
                value={claim.reference}
              />
            </label>
            <label>
              What it says
              <textarea
                className={`${fieldClassName} min-h-28 resize-y py-3`}
                onChange={(event) => updateClaimText(index, event.target.value)}
                value={
                  inlineContentText(claim.content) === " "
                    ? ""
                    : inlineContentText(claim.content)
                }
              />
            </label>
            {claims.length > 2 ? (
              <button
                className="editor-remove-claim"
                onClick={() =>
                  updateAttributes({
                    claims: claims.filter(
                      (_, claimIndex) => claimIndex !== index
                    ),
                  })
                }
                type="button"
              >
                <FiMinus aria-hidden="true" /> Remove claim
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <button
        className="editor-add-claim"
        onClick={() =>
          updateAttributes({
            claims: [...claims, emptyContradictionClaim(claims.length)],
          })
        }
        type="button"
      >
        <FiPlus aria-hidden="true" /> Add another claim
      </button>
    </NodeViewWrapper>
  );
}
