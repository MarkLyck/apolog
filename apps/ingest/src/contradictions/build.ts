import { articleContentSchema } from "@apolog/shared";
import type {
  ArticleContent,
  ContentBlock,
  InlineContent,
} from "@apolog/shared";
import * as v from "valibot";

import type { Bible, CatalogEntry } from "./acquire";
import {
  creationLabels,
  creationPassages,
  mosesPassage,
  referenceCorrections,
} from "./corrections";
import { resolvePassages } from "./passages";

function inline(id: string, text: string): InlineContent {
  return [{ id, text, type: "text" }];
}

export function buildArticle(
  entry: CatalogEntry,
  bible: Bible,
  now: number
): ArticleContent {
  const slug = `bible-${entry.path
    .split("/")
    .at(-1)
    ?.replace(/\.html$/u, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")}`;
  const creation = entry.path === "/contra/who_created.html";
  const groups = entry.groups.map((group) =>
    group.references.flatMap((citation) => {
      if (
        citation.href === "/moses/1.html#3" &&
        citation.text === "Pearl of Great Price: Moses 1:3"
      ) {
        return [mosesPassage];
      }
      return resolvePassages(bible, {
        ...citation,
        text:
          referenceCorrections.get(`${entry.path}|${citation.text}`) ??
          citation.text,
      });
    })
  );
  const copiedWords = [entry.title, ...entry.groups.map((group) => group.label)]
    .join(" ")
    .split(/\s+/u).length;
  const blocks: ContentBlock[] = [];
  for (const [index, passages] of groups.entries()) {
    const id = `group-${index + 1}`;
    const sourceLabel = entry.groups[index]?.label;
    const label =
      (creation
        ? creationLabels[index]
        : copiedWords <= 25
          ? sourceLabel
          : undefined) || `Passage group ${index + 1}`;
    blocks.push({
      id,
      type: "heading",
      level: 2,
      content: inline(`${id}-text`, label),
    });
    for (const [offset, passage] of passages.entries()) {
      const quoteId = `${id}-passage-${offset + 1}`;
      const supplied = creation
        ? creationPassages.get(passage.reference)
        : undefined;
      blocks.push({
        id: quoteId,
        type: "quote",
        reference: passage.reference,
        edition: supplied
          ? passage.reference === "1 Corinthians 8:6"
            ? "Supplied quotation"
            : "King James Version, with supplied clarification"
          : passage.edition,
        content: inline(`${quoteId}-text`, supplied ?? passage.text),
      });
    }
  }
  const references = groups
    .map((group) => group[0]?.reference)
    .filter(Boolean)
    .join("; ");
  const summary = creation
    ? "Isaiah describes God creating alone; John and Colossians attribute creation to Jesus; 1 Corinthians distinguishes creation from the Father and through Jesus."
    : `Compare ${references}. Read the passages together to examine their different accounts of the question.`;
  const wordCount = blocks
    .flatMap((block) =>
      "content" in block ? block.content.map((node) => node.text) : []
    )
    .join(" ")
    .split(/\s+/u).length;
  const article = v.parse(articleContentSchema, {
    title: entry.title,
    slug,
    summary,
    document: { schemaVersion: 1, blocks },
    sources: [],
    tags: [
      "contradiction",
      ...new Set(
        groups.flatMap((group) =>
          group.map((passage) => passage.reference.replace(/\s+\d+:.*$/u, ""))
        )
      ),
    ],
    placements: [
      {
        collectionKey: "contradictions",
        corpusKey: "bible",
        isPrimary: true,
        position: entry.position,
      },
    ],
    publishedAt: now,
    updatedAt: now,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 200)),
  });
  if (
    /\bsab\b|skeptic['’]?s annotated|skepticsannotatedbible/iu.test(
      JSON.stringify(article)
    )
  ) {
    throw new Error(`Source branding in public article: ${entry.path}`);
  }
  return article;
}
