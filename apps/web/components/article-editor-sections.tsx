import {
  collectionKeys,
  collectionRegistry,
  corpusKeys,
  corpusLabel,
} from "@apolog/shared";
import type { ArticleDocument, CollectionKey, CorpusKey } from "@apolog/shared";
import { Button } from "@apolog/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiExternalLink,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

import { ensurePrimaryPlacements } from "./article-editor-model";
import type {
  EditorValues,
  Placement,
  Source,
  Status,
  UpdateValues,
} from "./article-editor-model";
import { RichArticleEditor } from "./rich-article-editor";

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20";
const labelClassName = "grid gap-2 text-sm font-bold";

function EditorSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
      <h2 className="text-2xl">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function StorySection({
  isNew,
  onTitleChange,
  update,
  values,
}: {
  isNew: boolean;
  onTitleChange: (title: string) => void;
  update: UpdateValues;
  values: EditorValues;
}) {
  return (
    <EditorSection title="Story">
      <div className="grid gap-5">
        <label className={labelClassName}>
          Title
          <input
            autoFocus={isNew}
            className={`${inputClassName} min-h-14 text-lg font-semibold`}
            maxLength={160}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="A clear, specific title"
            required
            value={values.title}
          />
        </label>
        <label className={labelClassName}>
          Summary
          <textarea
            className={`${inputClassName} min-h-28 resize-y py-3 leading-6`}
            maxLength={420}
            onChange={(event) => update("summary", event.target.value)}
            placeholder="What should readers understand before opening the article?"
            required
            value={values.summary}
          />
          <span className="text-right text-xs font-normal text-[var(--muted)]">
            {values.summary.length}/420
          </span>
        </label>
      </div>
    </EditorSection>
  );
}

export function ArticleBodySection({
  onChange,
  onReady,
  values,
}: {
  onChange: (document: ArticleDocument, wordCount: number) => void;
  onReady: () => void;
  values: EditorValues;
}) {
  return (
    <EditorSection
      description="Use the special blocks for content that needs a distinct, consistent presentation on the published site."
      title="Article body"
    >
      <RichArticleEditor
        document={values.document}
        onChange={onChange}
        onReady={onReady}
      />
      <p className="mt-3 text-right text-xs text-[var(--muted)]">
        Estimated reading time: {values.readingMinutes} min
      </p>
    </EditorSection>
  );
}

export function SourcesSection({
  sources,
  update,
}: {
  sources: Source[];
  update: UpdateValues;
}) {
  const changeSource = (index: number, patch: Partial<Source>) => {
    update(
      "sources",
      sources.map((source, sourceIndex) =>
        sourceIndex === index ? { ...source, ...patch } : source
      )
    );
  };
  return (
    <EditorSection title="Sources">
      <div className="grid gap-4">
        {sources.map((source, index) => (
          <div
            className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 md:grid-cols-2"
            key={source.editorId}
          >
            <label className={labelClassName}>
              Source title
              <input
                className={inputClassName}
                onChange={(event) =>
                  changeSource(index, { title: event.target.value })
                }
                required
                value={source.title}
              />
            </label>
            <label className={labelClassName}>
              Publisher
              <input
                className={inputClassName}
                onChange={(event) =>
                  changeSource(index, { publisher: event.target.value })
                }
                required
                value={source.publisher}
              />
            </label>
            <div className={`${labelClassName} md:col-span-2`}>
              <label htmlFor={`source-url-${source.editorId}`}>URL</label>
              <div className="flex gap-2">
                <input
                  className={inputClassName}
                  id={`source-url-${source.editorId}`}
                  onChange={(event) =>
                    changeSource(index, { url: event.target.value })
                  }
                  placeholder="https://…"
                  required
                  type="url"
                  value={source.url}
                />
                <button
                  aria-label="Remove source"
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] hover:border-red-500 hover:text-red-600"
                  onClick={() =>
                    update(
                      "sources",
                      sources.filter((_, sourceIndex) => sourceIndex !== index)
                    )
                  }
                  type="button"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line)] text-sm font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          onClick={() =>
            update("sources", [
              ...sources,
              {
                editorId: crypto.randomUUID(),
                publisher: "",
                title: "",
                url: "",
              },
            ])
          }
          type="button"
        >
          <FiPlus aria-hidden="true" /> Add source
        </button>
      </div>
    </EditorSection>
  );
}

export function PublishingSection({
  onSlugChange,
  update,
  values,
}: {
  onSlugChange: (slug: string) => void;
  update: UpdateValues;
  values: EditorValues;
}) {
  return (
    <EditorSection title="Publishing">
      <div className="grid gap-5">
        <label className={labelClassName}>
          URL slug
          <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--paper)] pl-3 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20">
            <span className="text-xs text-[var(--muted)]">/articles/</span>
            <input
              className="min-h-11 min-w-0 flex-1 bg-transparent px-1 pr-3 outline-none"
              onChange={(event) => onSlugChange(event.target.value)}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              value={values.slug}
            />
          </div>
        </label>
        <label className={labelClassName}>
          Tags
          <input
            className={inputClassName}
            onChange={(event) => update("tags", event.target.value)}
            placeholder="history, genesis, archaeology"
            value={values.tags}
          />
          <span className="text-xs font-normal text-[var(--muted)]">
            Separate tags with commas.
          </span>
        </label>
        <label className={labelClassName}>
          Finding{" "}
          <span className="font-normal text-[var(--muted)]">(optional)</span>
          <input
            className={inputClassName}
            onChange={(event) => update("finding", event.target.value)}
            placeholder="Unsupported, contradicted…"
            value={values.finding}
          />
        </label>
        <label className={labelClassName}>
          Content notice{" "}
          <span className="font-normal text-[var(--muted)]">(optional)</span>
          <textarea
            className={`${inputClassName} min-h-24 resize-y py-3`}
            onChange={(event) => update("contentWarning", event.target.value)}
            value={values.contentWarning}
          />
        </label>
      </div>
    </EditorSection>
  );
}

export function PlacementSection({
  addPlacement,
  placements,
  update,
  updatePlacement,
}: {
  addPlacement: () => void;
  placements: Placement[];
  update: UpdateValues;
  updatePlacement: (index: number, patch: Partial<Placement>) => void;
}) {
  return (
    <EditorSection
      description="Choose where this article appears. Each text needs one primary section."
      title="Placement"
    >
      <div className="grid gap-4">
        {placements.map((placement, index) => (
          <div
            className="grid gap-3 rounded-2xl border border-[var(--line)] p-4"
            key={placement.editorId}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClassName}>
                Text
                <select
                  className={inputClassName}
                  onChange={(event) =>
                    updatePlacement(index, {
                      corpusKey: event.target.value as CorpusKey,
                    })
                  }
                  value={placement.corpusKey}
                >
                  {corpusKeys.map((corpus) => (
                    <option key={corpus} value={corpus}>
                      {corpusLabel(corpus)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Section
                <select
                  className={inputClassName}
                  onChange={(event) =>
                    updatePlacement(index, {
                      collectionKey: event.target.value as CollectionKey,
                    })
                  }
                  value={placement.collectionKey}
                >
                  {collectionKeys.map((collection) => (
                    <option key={collection} value={collection}>
                      {collectionRegistry[collection].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {placement.collectionKey === "contradictions" ? (
              <label className={labelClassName}>
                Rank
                <input
                  className={inputClassName}
                  min={1}
                  onChange={(event) => {
                    const rank = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(rank)) {
                      updatePlacement(index, { position: rank });
                    }
                  }}
                  type="number"
                  value={placement.position}
                />
              </label>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                <input
                  checked={placement.isPrimary}
                  className="size-4 accent-[var(--accent)]"
                  name={`primary-${placement.corpusKey}`}
                  onChange={() => updatePlacement(index, { isPrimary: true })}
                  type="radio"
                />
                Primary
              </label>
              {placements.length > 1 ? (
                <button
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--muted)] hover:text-red-600"
                  onClick={() =>
                    update(
                      "placements",
                      ensurePrimaryPlacements(
                        placements.filter(
                          (_, placementIndex) => placementIndex !== index
                        )
                      )
                    )
                  }
                  type="button"
                >
                  <FiTrash2 aria-hidden="true" /> Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line)] text-sm font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-40"
          disabled={
            placements.length >= corpusKeys.length * collectionKeys.length
          }
          onClick={addPlacement}
          type="button"
        >
          <FiPlus aria-hidden="true" /> Add placement
        </button>
      </div>
    </EditorSection>
  );
}

export function DangerZone({
  deleteArmed,
  isDeleting,
  onCancel,
  onDelete,
  onRequestDelete,
}: {
  deleteArmed: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  onRequestDelete: () => void;
}) {
  const deleteLabel = isDeleting
    ? "Deleting…"
    : deleteArmed
      ? "Confirm permanent deletion"
      : "Delete article";
  return (
    <section className="rounded-3xl border border-red-500/25 p-5">
      <h2 className="font-sans text-sm font-bold text-red-700 dark:text-red-300">
        Danger zone
      </h2>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        Permanently remove the article and its search, tag, and placement
        records.
      </p>
      <button
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-red-500/40 px-4 text-sm font-bold text-red-700 hover:bg-red-500/10 dark:text-red-300"
        disabled={isDeleting}
        onClick={deleteArmed ? onDelete : onRequestDelete}
        type="button"
      >
        <FiTrash2 aria-hidden="true" /> {deleteLabel}
      </button>
      {deleteArmed && !isDeleting ? (
        <button
          className="ml-3 text-xs font-bold text-[var(--muted)]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      ) : null}
    </section>
  );
}

export function EditorTopbar({
  dirty,
  isSaving,
  message,
  update,
  values,
}: {
  dirty: boolean;
  isSaving: boolean;
  message: string | null;
  update: UpdateValues;
  values: EditorValues;
}) {
  return (
    <header className="sticky top-[69px] z-30 -mx-4 flex flex-wrap items-center gap-3 border-y border-[var(--line)] bg-[color:var(--paper)]/94 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
        href="/admin/articles"
      >
        <FiArrowLeft aria-hidden="true" /> Articles
      </Link>
      <span aria-hidden="true" className="h-6 w-px bg-[var(--line)]" />
      <div className="mr-auto min-w-0">
        <p className="truncate text-sm font-bold">
          {values.title || "Untitled article"}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {dirty ? "Unsaved changes" : (message ?? "All changes saved")}
        </p>
      </div>
      {values.status === "published" && values.slug ? (
        <Link
          className="hidden items-center gap-2 text-sm font-bold text-[var(--accent-strong)] sm:inline-flex"
          href={`/articles/${values.slug}`}
          target="_blank"
        >
          View live <FiExternalLink aria-hidden="true" />
        </Link>
      ) : null}
      <select
        aria-label="Publication status"
        className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold outline-none focus:border-[var(--accent)]"
        onChange={(event) => update("status", event.target.value as Status)}
        value={values.status}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <Button disabled={isSaving || !dirty} type="submit">
        {isSaving ? (
          "Saving…"
        ) : (
          <>
            <FiSave aria-hidden="true" className="mr-2" /> Save{" "}
            <span className="ml-2 hidden opacity-60 sm:inline">⌘S</span>
          </>
        )}
      </Button>
    </header>
  );
}
