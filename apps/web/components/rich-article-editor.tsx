"use client";

import "./rich-article-editor.css";
import type { ArticleDocument } from "@apolog/shared";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiBold,
  FiBookOpen,
  FiCode,
  FiColumns,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiEdit3,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
} from "react-icons/fi";

import {
  articleDocumentToTiptap,
  emptyContradictionClaim,
  editorWordCount,
  tiptapToArticleDocument,
} from "./article-editor-content";
import { articleEditorExtensions } from "./rich-article-editor-extensions";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]";

function ToolbarButton({
  active = false,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className="editor-toolbar-button"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichArticleEditor({
  document,
  onChange,
  onReady,
}: {
  document?: ArticleDocument;
  onChange: (document: ArticleDocument, wordCount: number) => void;
  onReady?: () => void;
}) {
  const [linkHref, setLinkHref] = useState("https://");
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const editor = useEditor({
    content: articleDocumentToTiptap(document),
    editorProps: {
      attributes: {
        "aria-label": "Article body",
        class: "article-editor-surface",
      },
    },
    extensions: articleEditorExtensions,
    immediatelyRender: false,
    onCreate({ editor: instance }) {
      const json = instance.getJSON();
      onChange(tiptapToArticleDocument(json), editorWordCount(json));
      onReady?.();
    },
    onUpdate({ editor: instance }) {
      const json = instance.getJSON();
      onChange(tiptapToArticleDocument(json), editorWordCount(json));
    },
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance?.isActive("bold") ?? false,
      bulletList: instance?.isActive("bulletList") ?? false,
      code: instance?.isActive("code") ?? false,
      heading2: instance?.isActive("heading", { level: 2 }) ?? false,
      heading3: instance?.isActive("heading", { level: 3 }) ?? false,
      italic: instance?.isActive("italic") ?? false,
      link: instance?.isActive("link") ?? false,
      strike: instance?.isActive("strike") ?? false,
    }),
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (editor) {
          const previous = editor.getAttributes("link").href as
            | string
            | undefined;
          setLinkHref(previous ?? "https://");
          setLinkEditorOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!editor) {
    return <div className="article-editor-loading">Preparing editor…</div>;
  }

  const editLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkHref(previous ?? "https://");
    setLinkEditorOpen(true);
  };
  const applyLink = () => {
    if (linkHref.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkHref.trim() })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkEditorOpen(false);
  };

  return (
    <div className="article-editor-shell">
      <div
        aria-label="Text formatting"
        className="editor-toolbar"
        role="toolbar"
      >
        <div className="editor-toolbar-group">
          <ToolbarButton
            active={state?.bold}
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FiBold aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.italic}
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FiItalic aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.strike}
            label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <FiMinus aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.code}
            label="Inline code"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <FiCode aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.link}
            label="Link (⌘K)"
            onClick={editLink}
          >
            <FiLink aria-hidden="true" />
          </ToolbarButton>
        </div>
        <div className="editor-toolbar-group">
          <ToolbarButton
            active={state?.heading2}
            label="Heading 2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            active={state?.heading3}
            label="Heading 3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            active={state?.bulletList}
            label="Bulleted list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FiList aria-hidden="true" />
          </ToolbarButton>
        </div>
        <div className="editor-toolbar-group editor-toolbar-custom">
          <ToolbarButton
            label="Insert callout"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  attrs: { title: "Key point" },
                  content: [{ text: "Add the key point…", type: "text" }],
                  type: "callout",
                })
                .run()
            }
          >
            <FiAlertTriangle aria-hidden="true" /> <span>Callout</span>
          </ToolbarButton>
          <ToolbarButton
            label="Insert scripture phrase"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  attrs: { edition: "NRSVUE", reference: "Reference" },
                  content: [{ text: "Paste the passage…", type: "text" }],
                  type: "scripture",
                })
                .run()
            }
          >
            <FiBookOpen aria-hidden="true" /> <span>Scripture</span>
          </ToolbarButton>
          <ToolbarButton
            label="Insert contradiction comparison"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  attrs: {
                    claims: [
                      emptyContradictionClaim(0),
                      emptyContradictionClaim(1),
                    ],
                  },
                  type: "contradiction",
                })
                .run()
            }
          >
            <FiColumns aria-hidden="true" /> <span>Contradiction</span>
          </ToolbarButton>
        </div>
        <div className="editor-toolbar-group ml-auto">
          <ToolbarButton
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <FiCornerUpLeft aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <FiCornerUpRight aria-hidden="true" />
          </ToolbarButton>
        </div>
      </div>
      {linkEditorOpen ? (
        <div className="editor-link-panel">
          <label>
            Link URL
            <input
              autoFocus
              className={fieldClassName}
              onChange={(event) => setLinkHref(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === "Escape") {
                  setLinkEditorOpen(false);
                }
              }}
              placeholder="https://example.com"
              value={linkHref}
            />
          </label>
          <button onClick={applyLink} type="button">
            Apply link
          </button>
          <button onClick={() => setLinkEditorOpen(false)} type="button">
            Cancel
          </button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
      <div className="editor-help">
        <span>
          <FiEdit3 aria-hidden="true" /> Select text to format it
        </span>
        <span>Markdown shortcuts and ⌘K links supported</span>
      </div>
    </div>
  );
}
