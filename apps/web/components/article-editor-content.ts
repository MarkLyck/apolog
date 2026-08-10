import type {
  ArticleDocument,
  ContentBlock,
  InlineContent,
} from "@apolog/shared";
import type { JSONContent } from "@tiptap/core";

export type ContradictionClaim = {
  content: InlineContent;
  id: string;
  label: string;
  reference: string;
};

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
  return typeof node.attrs?.contentId === "string" && node.attrs.contentId
    ? node.attrs.contentId
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
    if (link && typeof link.attrs?.href === "string") {
      const contentId = link.attrs.contentId;
      result.push({
        href: link.attrs.href,
        id:
          typeof contentId === "string" && contentId
            ? contentId
            : `${parentId}-link-${index}`,
        text: node.text,
        type: "link",
      });
      continue;
    }
    const contentId = node.marks?.find((mark) => mark.type === "contentId");
    const textContentId = contentId?.attrs?.contentId;
    const marks = node.marks
      ?.map((mark) => (mark.type === "strike" ? "strikethrough" : mark.type))
      .filter((mark): mark is "bold" | "italic" | "strikethrough" | "code" =>
        ["bold", "italic", "strikethrough", "code"].includes(mark)
      );
    result.push({
      id:
        typeof textContentId === "string" && textContentId
          ? textContentId
          : `${parentId}-text-${index}`,
      marks: marks?.length ? [...new Set(marks)] : undefined,
      text: node.text,
      type: "text",
    });
  }
  return result.length
    ? result
    : [{ id: `${parentId}-text-0`, text: " ", type: "text" }];
}

function normalizeClaims(value: unknown): ContradictionClaim[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((claim) => {
    if (!claim || typeof claim !== "object") {
      return [];
    }
    const item = claim as Record<string, unknown>;
    if (
      typeof item.label !== "string" ||
      typeof item.reference !== "string" ||
      !(Array.isArray(item.content) || typeof item.text === "string")
    ) {
      return [];
    }
    return [
      {
        content: Array.isArray(item.content)
          ? (item.content as InlineContent)
          : [
              {
                id: `${typeof item.id === "string" ? item.id : "claim"}-text-0`,
                text:
                  typeof item.text === "string" && item.text ? item.text : " ",
                type: "text" as const,
              },
            ],
        id: typeof item.id === "string" ? item.id : createId("claim"),
        label: item.label,
        reference: item.reference,
      },
    ];
  });
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

function tiptapNodeToBlock(
  node: JSONContent,
  index: number
): ContentBlock | null {
  const id = nodeId(node, `${node.type ?? "block"}-${index}`);
  switch (node.type) {
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
      return {
        content: fromTiptapInline(node.content, id),
        id,
        title:
          typeof node.attrs?.title === "string"
            ? node.attrs.title
            : "Key point",
        type: "callout",
      };
    }
    case "scripture": {
      return {
        content: fromTiptapInline(node.content, id),
        edition:
          typeof node.attrs?.edition === "string"
            ? node.attrs.edition
            : "Translation",
        id,
        reference:
          typeof node.attrs?.reference === "string"
            ? node.attrs.reference
            : "Reference",
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
