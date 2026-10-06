import type {
  ArticleDocument,
  ContentBlock,
  InlineContent,
} from "@apolog/shared";
import { inlineContentSchema } from "@apolog/shared/content";
import type { JSONContent } from "@tiptap/core";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as Struct from "effect/Struct";

export type ContradictionClaim = {
  content: InlineContent;
  id: string;
  label: string;
  reference: string;
};

const contentIdAttributesSchema = Schema.Struct({
  contentId: Schema.optional(Schema.String),
}).mapFields(Struct.map(Schema.mutableKey));
const linkAttributesSchema = Schema.Struct({
  contentId: Schema.optional(Schema.String),
  href: Schema.String,
}).mapFields(Struct.map(Schema.mutableKey));
const calloutAttributesSchema = Schema.Struct({
  title: Schema.optional(Schema.String),
}).mapFields(Struct.map(Schema.mutableKey));
const scriptureAttributesSchema = Schema.Struct({
  edition: Schema.optional(Schema.String),
  reference: Schema.optional(Schema.String),
}).mapFields(Struct.map(Schema.mutableKey));
export const imageAttributesSchema = Schema.Struct({
  alt: Schema.optional(Schema.String),
  caption: Schema.optional(Schema.String),
  src: Schema.optional(Schema.String),
}).mapFields(Struct.map(Schema.mutableKey));
const storedContradictionClaimSchema = Schema.Struct({
  content: Schema.optional(inlineContentSchema),
  id: Schema.optional(Schema.String),
  label: Schema.String,
  reference: Schema.String,
  text: Schema.optional(Schema.String),
})
  .mapFields(Struct.map(Schema.mutableKey))
  .check(
    Schema.makeFilter(
      (claim) => claim.content !== undefined || claim.text !== undefined,
      {
        message:
          "A contradiction claim must have structured content or legacy text",
      }
    )
  );
const storedContradictionClaimsSchema = Schema.mutable(
  Schema.Array(storedContradictionClaimSchema)
);

export function emptyContradictionClaim(index: number): ContradictionClaim {
  return {
    content: [{ id: crypto.randomUUID(), text: " ", type: "text" }],
    id: crypto.randomUUID(),
    label: `Claim ${index + 1}`,
    reference: "",
  };
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function toTiptapInline(content: InlineContent): JSONContent[] {
  return content.map((node) => ({
    marks:
      node.type === "link"
        ? [
            {
              attrs: { contentId: node.id, href: node.href },
              type: "link",
            },
          ]
        : [
            { attrs: { contentId: node.id }, type: "contentId" },
            ...(node.marks?.map((mark) => ({
              type: mark === "strikethrough" ? "strike" : mark,
            })) ?? []),
          ],
    text: node.text,
    type: "text",
  }));
}

export function inlineContentText(content: InlineContent) {
  return content.map((node) => node.text).join("");
}

export function replaceInlineContentText(
  content: InlineContent,
  nextText: string
): InlineContent {
  const previousText = inlineContentText(content);
  const normalizedText = nextText || " ";
  if (previousText === normalizedText) {
    return content;
  }

  let prefixLength = 0;
  while (
    prefixLength < previousText.length &&
    prefixLength < normalizedText.length &&
    previousText[prefixLength] === normalizedText[prefixLength]
  ) {
    prefixLength += 1;
  }
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    suffixLength < normalizedText.length - prefixLength &&
    previousText[previousText.length - suffixLength - 1] ===
      normalizedText[normalizedText.length - suffixLength - 1]
  ) {
    suffixLength += 1;
  }

  const usedIds = new Set<string>();
  const slice = (start: number, end: number): InlineContent => {
    let offset = 0;
    return content.flatMap((node) => {
      const nodeStart = offset;
      const nodeEnd = offset + node.text.length;
      offset = nodeEnd;
      const sliceStart = Math.max(start, nodeStart);
      const sliceEnd = Math.min(end, nodeEnd);
      if (sliceStart >= sliceEnd) {
        return [];
      }
      const id = usedIds.has(node.id) ? createId(node.id) : node.id;
      usedIds.add(id);
      return [
        {
          ...node,
          id,
          text: node.text.slice(sliceStart - nodeStart, sliceEnd - nodeStart),
        },
      ];
    });
  };

  const insertedText = normalizedText.slice(
    prefixLength,
    normalizedText.length - suffixLength
  );
  return [
    ...slice(0, prefixLength),
    ...(insertedText
      ? [{ id: createId("text"), text: insertedText, type: "text" as const }]
      : []),
    ...slice(previousText.length - suffixLength, previousText.length),
  ];
}

function nodeId(node: JSONContent, fallback: string) {
  const parsed = Schema.decodeUnknownResult(contentIdAttributesSchema)(
    node.attrs
  );
  return Result.isSuccess(parsed) && parsed.success.contentId
    ? parsed.success.contentId
    : fallback;
}

export function articleDocumentToTiptap(
  document: ArticleDocument | undefined
): JSONContent {
  if (!document) {
    return {
      content: [{ content: [], type: "paragraph" }],
      type: "doc",
    };
  }
  return {
    content: document.blocks.map((block) => {
      switch (block.type) {
        case "image": {
          return {
            attrs: {
              alt: block.alt,
              caption: block.caption ?? "",
              contentId: block.id,
              src: block.src,
            },
            type: "articleImage",
          };
        }
        case "paragraph": {
          return {
            attrs: { contentId: block.id },
            content: toTiptapInline(block.content),
            type: "paragraph",
          };
        }
        case "heading": {
          return {
            attrs: { contentId: block.id, level: block.level },
            content: toTiptapInline(block.content),
            type: "heading",
          };
        }
        case "list": {
          return {
            attrs: { contentId: block.id },
            content: block.items.map((item) => ({
              attrs: { contentId: item.id },
              content: [
                {
                  content: toTiptapInline(item.content),
                  type: "paragraph",
                },
              ],
              type: "listItem",
            })),
            type: "bulletList",
          };
        }
        case "callout": {
          return {
            attrs: { contentId: block.id, title: block.title },
            content: toTiptapInline(block.content),
            type: "callout",
          };
        }
        case "quote": {
          return {
            attrs: {
              contentId: block.id,
              edition: block.edition,
              reference: block.reference,
            },
            content: toTiptapInline(block.content),
            type: "scripture",
          };
        }
        case "claimComparison": {
          return {
            attrs: {
              claims: block.claims.map((claim) => ({
                content: claim.content,
                id: claim.id,
                label: claim.label,
                reference: claim.reference,
              })),
              contentId: block.id,
            },
            type: "contradiction",
          };
        }
        default: {
          const exhaustive: never = block;
          return exhaustive;
        }
      }
    }),
    type: "doc",
  };
}

function fromTiptapInline(
  content: JSONContent[] | undefined,
  parentId: string
): InlineContent {
  const result: InlineContent = [];
  for (const [index, node] of (content ?? []).entries()) {
    if (node.type !== "text" || !node.text) {
      continue;
    }
    const link = node.marks?.find((mark) => mark.type === "link");
    const linkAttributes = Schema.decodeUnknownResult(linkAttributesSchema)(
      link?.attrs
    );
    if (Result.isSuccess(linkAttributes)) {
      result.push({
        href: linkAttributes.success.href,
        id: linkAttributes.success.contentId || `${parentId}-link-${index}`,
        text: node.text,
        type: "link",
      });
      continue;
    }
    const contentId = node.marks?.find((mark) => mark.type === "contentId");
    const textAttributes = Schema.decodeUnknownResult(
      contentIdAttributesSchema
    )(contentId?.attrs);
    const marks = node.marks
      ?.map((mark) => (mark.type === "strike" ? "strikethrough" : mark.type))
      .filter((mark): mark is "bold" | "italic" | "strikethrough" | "code" =>
        ["bold", "italic", "strikethrough", "code"].includes(mark)
      );
    result.push({
      id:
        (Result.isSuccess(textAttributes) &&
          textAttributes.success.contentId) ||
        `${parentId}-text-${index}`,
      marks: marks?.length ? [...new Set(marks)] : undefined,
      text: node.text,
      type: "text",
    });
  }
  return result.length
    ? result
    : [{ id: `${parentId}-text-0`, text: " ", type: "text" }];
}

export function normalizeClaims(value: unknown): ContradictionClaim[] {
  const parsed = Schema.decodeUnknownResult(storedContradictionClaimsSchema)(
    value
  );
  if (Result.isFailure(parsed)) {
    return [];
  }
  return parsed.success.map((claim) => ({
    content: claim.content ?? [
      {
        id: `${claim.id ?? "claim"}-text-0`,
        text: claim.text || " ",
        type: "text",
      },
    ],
    id: claim.id ?? createId("claim"),
    label: claim.label,
    reference: claim.reference,
  }));
}

function listBlock(node: JSONContent, fallbackId: string): ContentBlock | null {
  const id = nodeId(node, fallbackId);
  const items = (node.content ?? []).flatMap((item, index) => {
    const paragraph = item.content?.find((child) => child.type === "paragraph");
    const itemId = nodeId(item, `${id}-item-${index}`);
    return paragraph
      ? [
          {
            content: fromTiptapInline(paragraph.content, itemId),
            id: itemId,
          },
        ]
      : [];
  });
  return items.length ? { id, items, type: "list" } : null;
}

function contradictionBlock(
  node: JSONContent,
  fallbackId: string
): ContentBlock | null {
  const claims = normalizeClaims(node.attrs?.claims);
  if (claims.length < 2) {
    return null;
  }
  return {
    claims: claims.map((claim) => ({
      content: claim.content,
      id: claim.id,
      label: claim.label || "Claim",
      reference: claim.reference || "Reference",
    })),
    id: nodeId(node, fallbackId),
    type: "claimComparison",
  };
}

function imageBlock(
  node: JSONContent,
  id: string
): Extract<ContentBlock, { type: "image" }> {
  const attributes = Schema.decodeUnknownResult(imageAttributesSchema)(
    node.attrs
  );
  const image = Result.isSuccess(attributes) ? attributes.success : {};
  return {
    alt: image.alt ?? "",
    caption: image.caption?.trim() ? image.caption : undefined,
    id,
    src: image.src ?? "",
    type: "image",
  };
}

function tiptapNodeToBlock(
  node: JSONContent,
  index: number
): ContentBlock | null {
  const id = nodeId(node, `${node.type ?? "block"}-${index}`);
  switch (node.type) {
    case "articleImage": {
      return imageBlock(node, id);
    }
    case "paragraph": {
      return {
        content: fromTiptapInline(node.content, id),
        id,
        type: "paragraph",
      };
    }
    case "heading": {
      return {
        content: fromTiptapInline(node.content, id),
        id,
        level: node.attrs?.level === 3 ? 3 : 2,
        type: "heading",
      };
    }
    case "bulletList": {
      return listBlock(node, id);
    }
    case "callout": {
      const attributes = Schema.decodeUnknownResult(calloutAttributesSchema)(
        node.attrs
      );
      return {
        content: fromTiptapInline(node.content, id),
        id,
        title:
          (Result.isSuccess(attributes) && attributes.success.title) ||
          "Key point",
        type: "callout",
      };
    }
    case "scripture": {
      const attributes = Schema.decodeUnknownResult(scriptureAttributesSchema)(
        node.attrs
      );
      return {
        content: fromTiptapInline(node.content, id),
        edition:
          (Result.isSuccess(attributes) && attributes.success.edition) ||
          "Translation",
        id,
        reference:
          (Result.isSuccess(attributes) && attributes.success.reference) ||
          "Reference",
        type: "quote",
      };
    }
    case "contradiction": {
      return contradictionBlock(node, id);
    }
    default: {
      return null;
    }
  }
}

export function tiptapToArticleDocument(json: JSONContent): ArticleDocument {
  const blocks = (json.content ?? [])
    .map(tiptapNodeToBlock)
    .filter((block): block is ContentBlock => block !== null);
  return {
    blocks: blocks.length
      ? blocks
      : [
          {
            content: [{ id: createId("text"), text: " ", type: "text" }],
            id: createId("paragraph"),
            type: "paragraph",
          },
        ],
    schemaVersion: 1,
  };
}

export function editorWordCount(json: JSONContent) {
  const text = (json.content ?? [])
    .flatMap((node) => {
      if (node.type === "articleImage") {
        const attributes = Schema.decodeUnknownResult(imageAttributesSchema)(
          node.attrs
        );
        return Result.isSuccess(attributes)
          ? [attributes.success.caption ?? ""]
          : [];
      }
      if (node.type === "contradiction") {
        return normalizeClaims(node.attrs?.claims).map((claim) =>
          inlineContentText(claim.content)
        );
      }
      const walk = (item: JSONContent): string[] => [
        item.text ?? "",
        ...(item.content?.flatMap(walk) ?? []),
      ];
      return walk(node);
    })
    .join(" ")
    .trim();
  return text ? text.split(/\s+/u).length : 0;
}
