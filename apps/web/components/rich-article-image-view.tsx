import { articleImageUrlSchema } from "@apolog/shared/content";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import { imageAttributesSchema } from "./article-editor-content";
import { ImageBlock } from "./content-block-renderers";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export function ArticleImageView({ node, updateAttributes }: NodeViewProps) {
  const attributes = Schema.decodeUnknownResult(imageAttributesSchema)(
    node.attrs
  );
  const image = Result.isSuccess(attributes) ? attributes.success : {};
  const url = Schema.decodeUnknownResult(articleImageUrlSchema)(image.src);

  return (
    <NodeViewWrapper className="editor-special" contentEditable={false}>
      <div className="grid gap-3">
        <label>
          Image URL
          <input
            className={fieldClassName}
            onChange={(event) => updateAttributes({ src: event.target.value })}
            type="url"
            value={image.src ?? ""}
          />
        </label>
        <label>
          Image description
          <input
            className={fieldClassName}
            onChange={(event) => updateAttributes({ alt: event.target.value })}
            value={image.alt ?? ""}
          />
        </label>
        <label>
          Caption
          <input
            className={fieldClassName}
            onChange={(event) =>
              updateAttributes({ caption: event.target.value })
            }
            value={image.caption ?? ""}
          />
        </label>
      </div>
      {Result.isSuccess(url) ? (
        <ImageBlock
          block={{
            alt: image.alt ?? "",
            caption: image.caption,
            id: "image-preview",
            src: url.success,
            type: "image",
          }}
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Enter an HTTPS image URL to preview the image.
        </p>
      )}
    </NodeViewWrapper>
  );
}
