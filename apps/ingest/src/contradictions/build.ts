import type {
  ArticleContent,
  ContentBlock,
  InlineContent,
} from "@apolog/shared";
import {
  articleWordCount,
  estimateReadingMinutes,
} from "@apolog/shared/article-text";
import { articleContentSchema } from "@apolog/shared/content";
import * as Schema from "effect/Schema";

import type { Bible, CatalogEntry } from "./acquire";
import {
  creationLabels,
  creationPassages,
  mosesPassage,
  referenceCorrections,
} from "./corrections";
import { resolvePassages } from "./passages";

type PassageGroup = {
  label: string | undefined;
  passages: ReturnType<typeof resolvePassages>;
};

function inline(id: string, text: string): InlineContent {
  return [{ id, text, type: "text" }];
}

const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

function countWord(count: number) {
  return numberWords[count] ?? String(count);
}

function joinList(items: string[]) {
  return items.length <= 2
    ? items.join(" and ")
    : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function bookOf(reference: string) {
  return reference.replace(/\s+\d+:.*$/u, "");
}

function summarize(title: string, groups: PassageGroup[]) {
  const noun = title.trim().endsWith("?") ? "answers" : "accounts";
  const count = countWord(groups.length);
  const labelled = groups.flatMap(({ label, passages: [first] }) => {
    const answer = label?.replace(/[\s.,;:]+$/u, "");
    return answer && first ? [`“${answer}” (${first.reference})`] : [];
  });
  if (labelled.length === groups.length) {
    return `${count.charAt(0).toUpperCase()}${count.slice(1)} ${noun}: ${joinList(labelled)}.`;
  }
  const books = [
    ...new Set(
      groups.flatMap(({ passages }) =>
        passages.map((passage) => bookOf(passage.reference))
      )
    ),
  ];
  const subject =
    books.length > 3
      ? `Passages from ${countWord(books.length)} books`
      : joinList(books);
  return `${subject} ${books.length === 1 ? "gives" : "give"} ${count} different ${noun}.`;
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
  const copiedWords = [entry.title, ...entry.groups.map((group) => group.label)]
    .join(" ")
    .split(/\s+/u).length;
  const groups: PassageGroup[] = entry.groups.map((group, index) => ({
    label:
      (creation
        ? creationLabels[index]
        : copiedWords <= 25
          ? group.label
          : undefined) || undefined,
    passages: group.references.flatMap((citation) => {
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
    }),
  }));
  const blocks: ContentBlock[] = [];
  for (const [index, { label, passages }] of groups.entries()) {
    const id = `group-${index + 1}`;
    blocks.push({
      id,
      type: "heading",
      level: 2,
      content: inline(`${id}-text`, label ?? `Passage group ${index + 1}`),
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
  const summary = creation
    ? "Isaiah describes God creating alone; John and Colossians attribute creation to Jesus; 1 Corinthians distinguishes creation from the Father and through Jesus."
    : summarize(entry.title, groups);
  const article = Schema.decodeUnknownSync(articleContentSchema)({
    title: entry.title,
    slug,
    summary,
    document: { schemaVersion: 1, blocks },
    sources: [],
    tags: [
      "contradiction",
      ...new Set(
        groups.flatMap(({ passages }) =>
          passages.map((passage) => bookOf(passage.reference))
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
    readingMinutes: estimateReadingMinutes(articleWordCount(blocks)),
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
