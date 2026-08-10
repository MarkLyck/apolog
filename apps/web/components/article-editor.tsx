"use client";

import { api } from "@apolog/backend/api";
import type { Id } from "@apolog/backend/data-model";
import { collectionKeys, corpusKeys } from "@apolog/shared";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

import {
  ensurePrimaryPlacements,
  initialEditorValues,
  slugify,
  sourcesForSave,
} from "./article-editor-model";
import type { EditorValues, Placement } from "./article-editor-model";
import {
  ArticleBodySection,
  DangerZone,
  EditorTopbar,
  PlacementSection,
  PublishingSection,
  SourcesSection,
  StorySection,
} from "./article-editor-sections";

function ArticleEditorForm({
  id,
  startingValues,
  startingVersion,
}: {
  id?: Id<"articles">;
  startingValues: EditorValues;
  startingVersion?: number;
}) {
  const saveArticle = useMutation(api.articles.save);
  const removeArticle = useMutation(api.articles.remove);
  const router = useRouter();
  const [values, setValues] = useState(startingValues);
  const [dirty, setDirty] = useState(false);
  const editorReady = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const slugWasEdited = useRef(Boolean(id));
  const version = useRef(startingVersion);

  useEffect(() => {
    const preventLoss = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [dirty]);

  const update = <Key extends keyof EditorValues>(
    key: Key,
    value: EditorValues[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  };

  const handleTitle = (title: string) => {
    setValues((current) => ({
      ...current,
      slug: slugWasEdited.current ? current.slug : slugify(title),
      title,
    }));
    setDirty(true);
    setMessage(null);
  };

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }
    setErrorMessage(null);
    setMessage(null);
    setIsSaving(true);
    try {
      const result = await saveArticle({
        contentWarning: values.contentWarning || undefined,
        document: values.document,
        expectedVersion: id ? version.current : undefined,
        finding: values.finding || undefined,
        id,
        placements: values.placements.map(
          ({ collectionKey, corpusKey, isPrimary, position }) => ({
            collectionKey,
            corpusKey,
            isPrimary,
            position,
          })
        ),
        readingMinutes: values.readingMinutes,
        slug: values.slug,
        sources: sourcesForSave(values.sources),
        status: values.status,
        summary: values.summary,
        tags: values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        title: values.title,
      });
      setDirty(false);
      version.current = result.version;
      setMessage(values.status === "published" ? "Published" : "Changes saved");
      if (!id) {
        router.replace(`/admin/articles/${result.id}`);
      }
      router.refresh();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save article."
      );
    } finally {
      setIsSaving(false);
    }
  }, [id, isSaving, router, saveArticle, values]);

  useEffect(() => {
    const saveShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", saveShortcut);
    return () => window.removeEventListener("keydown", saveShortcut);
  }, [handleSave]);

  const updatePlacement = (index: number, patch: Partial<Placement>) => {
    const placements = values.placements.map((placement, placementIndex) => {
      if (placementIndex !== index) {
        if (
          patch.isPrimary &&
          patch.corpusKey === undefined &&
          placement.corpusKey === values.placements[index]?.corpusKey
        ) {
          return { ...placement, isPrimary: false };
        }
        return placement;
      }
      const next = { ...placement, ...patch };
      return {
        ...next,
        position:
          next.collectionKey === "contradictions"
            ? Math.max(1, next.position || 1)
            : 0,
      };
    });
    update("placements", ensurePrimaryPlacements(placements));
  };

  const addPlacement = () => {
    const candidate = corpusKeys
      .flatMap((corpusKey) =>
        collectionKeys.map((collectionKey) => ({ collectionKey, corpusKey }))
      )
      .find(
        (option) =>
          !values.placements.some(
            (placement) =>
              placement.corpusKey === option.corpusKey &&
              placement.collectionKey === option.collectionKey
          )
      );
    if (!candidate) {
      return;
    }
    update(
      "placements",
      ensurePrimaryPlacements([
        ...values.placements,
        {
          ...candidate,
          editorId: crypto.randomUUID(),
          isPrimary: false,
          position: candidate.collectionKey === "contradictions" ? 1 : 0,
        },
      ])
    );
  };

  const handleDelete = async () => {
    if (!id || isDeleting) {
      return;
    }
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await removeArticle({ id });
      router.replace("/admin/articles");
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete article."
      );
      setIsDeleting(false);
    }
  };

  return (
    <form
      action={handleSave}
      className="mx-auto max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8"
    >
      <EditorTopbar
        dirty={dirty}
        isSaving={isSaving}
        message={message}
        update={update}
        values={values}
      />

      {errorMessage ? (
        <div
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/8 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-300"
          role="alert"
        >
          <FiX aria-hidden="true" className="mt-0.5 shrink-0" /> {errorMessage}
        </div>
      ) : null}

      <div className="mt-8 grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="grid gap-7">
          <StorySection
            isNew={!id}
            onTitleChange={handleTitle}
            update={update}
            values={values}
          />
          <ArticleBodySection
            onChange={(document, wordCount) => {
              setValues((current) => ({
                ...current,
                document,
                readingMinutes: Math.max(1, Math.ceil(wordCount / 225)),
              }));
              if (editorReady.current) {
                setDirty(true);
                setMessage(null);
              }
            }}
            onReady={() => {
              editorReady.current = true;
            }}
            values={values}
          />
          <SourcesSection sources={values.sources} update={update} />
        </div>

        <aside className="grid gap-7 xl:sticky xl:top-40">
          <PublishingSection
            onSlugChange={(slug) => {
              slugWasEdited.current = true;
              update("slug", slugify(slug));
            }}
            update={update}
            values={values}
          />
          <PlacementSection
            addPlacement={addPlacement}
            placements={values.placements}
            update={update}
            updatePlacement={updatePlacement}
          />
          {id ? (
            <DangerZone
              deleteArmed={deleteArmed}
              isDeleting={isDeleting}
              onCancel={() => setDeleteArmed(false)}
              onDelete={handleDelete}
              onRequestDelete={() => setDeleteArmed(true)}
            />
          ) : null}
        </aside>
      </div>

      {message ? (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-[var(--paper)] shadow-xl"
        >
          <FiCheck aria-hidden="true" /> {message}
        </div>
      ) : null}
    </form>
  );
}

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const id = articleId as Id<"articles"> | undefined;
  const article = useQuery(api.articles.getForAdmin, id ? { id } : "skip");

  if (id && article === undefined) {
    return (
      <p className="mx-auto max-w-6xl px-5 py-24 text-[var(--muted)]">
        Loading article…
      </p>
    );
  }
  if (id && article === null) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl">Article not found</h1>
        <Link
          className="mt-6 inline-block font-bold text-[var(--accent-strong)]"
          href="/admin/articles"
        >
          Return to articles
        </Link>
      </div>
    );
  }

  const startingValues: EditorValues = article
    ? {
        contentWarning: article.contentWarning ?? "",
        document: article.document,
        finding: article.finding ?? "",
        placements: article.placements.map((placement) => ({
          ...placement,
          editorId: crypto.randomUUID(),
        })),
        readingMinutes: article.readingMinutes,
        slug: article.slug,
        sources: article.sources.map((source) => ({
          ...source,
          editorId: crypto.randomUUID(),
        })),
        status: article.status,
        summary: article.summary,
        tags: article.tags.join(", "),
        title: article.title,
      }
    : initialEditorValues();
  return (
    <ArticleEditorForm
      id={id}
      startingValues={startingValues}
      startingVersion={article?.version}
    />
  );
}
