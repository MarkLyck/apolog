import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";
import { UniqueID } from "@tiptap/extension-unique-id";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKitExtension from "@tiptap/starter-kit";

import { CalloutView } from "./rich-article-callout-view";
import { ContradictionView } from "./rich-article-contradiction-view";
import { ScriptureView } from "./rich-article-scripture-view";

const Callout = Node.create({
  addAttributes() {
    return { title: { default: "Key point" } };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
  content: "inline*",
  defining: true,
  group: "block",
  name: "callout",
  parseHTML() {
    return [{ tag: 'aside[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { "data-type": "callout" }),
      0,
    ];
  },
});

const Scripture = Node.create({
  addAttributes() {
    return { edition: { default: "" }, reference: { default: "" } };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ScriptureView);
  },
  content: "inline*",
  defining: true,
  group: "block",
  name: "scripture",
  parseHTML() {
    return [{ tag: 'figure[data-type="scripture"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-type": "scripture" }),
      0,
    ];
  },
});

const Contradiction = Node.create({
  addAttributes() {
    return { claims: { default: [] } };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ContradictionView);
  },
  atom: true,
  draggable: true,
  group: "block",
  name: "contradiction",
  parseHTML() {
    return [{ tag: 'section[data-type="contradiction"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, { "data-type": "contradiction" }),
    ];
  },
});

const ContentId = Mark.create({
  addAttributes() {
    return {
      contentId: {
        default: null,
        parseHTML: (element) => element.dataset.contentId,
        renderHTML: (attributes) =>
          attributes.contentId
            ? { "data-content-id": attributes.contentId }
            : {},
      },
    };
  },
  inclusive: true,
  name: "contentId",
  parseHTML() {
    return [{ tag: "span[data-content-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-content-id": HTMLAttributes.contentId,
      }),
      0,
    ];
  },
});

const PersistentLinkId = Extension.create({
  addGlobalAttributes() {
    return [
      {
        attributes: {
          contentId: {
            default: null,
            parseHTML: (element) => element.dataset.contentId,
            renderHTML: (attributes) =>
              attributes.contentId
                ? { "data-content-id": attributes.contentId }
                : {},
          },
        },
        types: ["link"],
      },
    ];
  },
  name: "persistentLinkId",
});

export const articleEditorExtensions = [
  StarterKitExtension.configure({
    blockquote: false,
    codeBlock: false,
    hardBreak: false,
    heading: { levels: [2, 3] },
    horizontalRule: false,
    link: { openOnClick: false },
    orderedList: false,
  }),
  ContentId,
  PersistentLinkId,
  UniqueID.configure({
    attributeName: "contentId",
    types: [
      "paragraph",
      "heading",
      "bulletList",
      "listItem",
      "callout",
      "scripture",
      "contradiction",
    ],
  }),
  Callout,
  Scripture,
  Contradiction,
];
