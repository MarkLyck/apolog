import type { Bible, CatalogEntry } from "./acquire";

const codes =
  "gen ex lev num dt jos jg ru 1sam 2sam 1kg 2kg 1chr 2chr ezr neh est job ps pr ec sos isa jer lam ezek dan hos jl am ob jon mic nah hab zep hag zech mal mt mk lk jn acts rom 1cor 2cor gal eph php col 1th 2th 1tim 2tim tit phm heb jas 1pet 2pet 1jn 2jn 3jn jude rev".split(
    " "
  );

export type Passage = { reference: string; text: string; edition: string };

function referenceFromLink(
  bookNames: string[],
  citation: CatalogEntry["groups"][number]["references"][number]
) {
  const url = new URL(citation.href, "https://www.skepticsannotatedbible.com");
  const match = /^\/(?<code>\w+)\/(?<chapter>\d+)\.html$/u.exec(url.pathname);
  const code = match?.groups?.code;
  const book =
    bookNames[
      codes.indexOf(
        code === "is" ? "isa" : code === "joel" ? "jl" : (code ?? "")
      )
    ];
  const hash = url.hash.replaceAll(/(?<=\d)[ab]\b/gu, "");
  if (!book || !match?.groups?.chapter || !/^(?:#\d+(?:-\d+)?)?$/u.test(hash)) {
    throw new Error(`Unrecognized citation: ${JSON.stringify(citation)}`);
  }
  return `${book} ${match.groups.chapter}${hash ? `:${hash.slice(1)}` : ""}`;
}

function readVerses(
  book: Bible["books"][number],
  chapterNumber: number,
  lastChapter: number,
  firstVerse: number,
  lastVerse: number
) {
  const verses: string[] = [];
  for (let chapter = chapterNumber; chapter <= lastChapter; chapter += 1) {
    const found = book.chapters.find(
      (candidate) => candidate.chapter === chapter
    );
    if (!found) {
      throw new Error(`Missing chapter: ${book.name} ${chapter}`);
    }
    const from = chapter === chapterNumber ? firstVerse : 1;
    const to =
      chapter === lastChapter ? lastVerse : (found.verses.at(-1)?.verse ?? 0);
    if (from < 1 || from > to) {
      throw new Error(
        `Invalid verse range: ${book.name} ${chapter}:${from}-${to}`
      );
    }
    for (let verse = from; verse <= to; verse += 1) {
      const foundVerse = found.verses.find(
        (candidate) => candidate.verse === verse
      );
      if (!foundVerse?.text) {
        throw new Error(`Missing verse: ${book.name} ${chapter}:${verse}`);
      }
      verses.push(foundVerse.text);
    }
  }
  return verses;
}

function expandLastVerse(
  firstVerse: number,
  last: string | undefined,
  sameChapter: boolean
) {
  let lastVerse = last ? Number(last) : firstVerse;
  if (
    sameChapter &&
    last &&
    lastVerse < firstVerse &&
    last.length < String(firstVerse).length
  ) {
    lastVerse = Number(`${String(firstVerse).slice(0, -last.length)}${last}`);
  }
  return lastVerse;
}

function resolveBook(book: Bible["books"][number], tail: string): Passage[] {
  const passages: Passage[] = [];
  let chapterNumber: number | undefined =
    book.chapters.length === 1 ? 1 : undefined;
  for (const part of tail.split(/\s*[,;]\s*|\s+and\s+/u)) {
    const range =
      /^(?:(?<chapter>\d+):)?(?<first>\d+)(?:\s*-\s*(?:(?<lastChapter>\d+):)?(?<last>\d+))?$/u.exec(
        part.trim()
      );
    if (!range?.groups?.first) {
      throw new Error(`Unrecognized range: ${book.name} ${tail}`);
    }
    const explicitChapter = range.groups.chapter
      ? Number(range.groups.chapter)
      : undefined;
    const currentChapter = explicitChapter ?? chapterNumber;
    if (currentChapter === undefined) {
      const from = Number(range.groups.first);
      const to = range.groups.last ? Number(range.groups.last) : from;
      for (let chapter = from; chapter <= to; chapter += 1) {
        const found = book.chapters.find(
          (candidate) => candidate.chapter === chapter
        );
        if (!found) {
          throw new Error(`Missing chapter: ${book.name} ${chapter}`);
        }
        passages.push({
          reference: `${book.name} ${chapter}:1-${found.verses.length}`,
          text: found.verses.map((verse) => verse.text).join(" "),
          edition: book.edition,
        });
      }
      continue;
    }
    chapterNumber = currentChapter;
    const lastChapter = range.groups.lastChapter
      ? Number(range.groups.lastChapter)
      : chapterNumber;
    const firstVerse = Number(range.groups.first);
    const lastVerse = expandLastVerse(
      firstVerse,
      range.groups.last,
      lastChapter === chapterNumber
    );
    if (
      lastChapter < chapterNumber ||
      (lastChapter === chapterNumber && lastVerse < firstVerse)
    ) {
      throw new Error(`Reversed range: ${book.name} ${tail}`);
    }
    const verses = readVerses(
      book,
      chapterNumber,
      lastChapter,
      firstVerse,
      lastVerse
    );
    const end =
      lastChapter === chapterNumber
        ? String(lastVerse)
        : `${lastChapter}:${lastVerse}`;
    passages.push({
      reference: `${book.name} ${chapterNumber}:${firstVerse}${lastChapter === chapterNumber && lastVerse === firstVerse ? "" : `-${end}`}`,
      text: verses.join(" "),
      edition: book.edition,
    });
    chapterNumber = lastChapter;
  }
  return passages;
}

export function resolvePassages(
  bible: Bible,
  citation: CatalogEntry["groups"][number]["references"][number]
): Passage[] {
  const bookNames = bible.books.map((book) => book.name);
  let reference = citation.text
    .replaceAll(/\bIII\s+/gu, "3 ")
    .replaceAll(/\bII\s+/gu, "2 ")
    .replaceAll(/\bI\s+/gu, "1 ")
    .replaceAll(/\bPsalm\b/giu, "Psalms")
    .replaceAll(/\bRevelations\b/giu, "Revelation")
    .replaceAll(/\bMachabees\b/giu, "Maccabees")
    .replaceAll(/[–—]/gu, "-")
    .replaceAll(/(?<=[A-Za-z])\.(?=\d)/gu, " ")
    .replaceAll(/(?<=\d)\.(?=\d)/gu, ":")
    .replaceAll(/(?<=\d)[ab]\b/gu, "")
    .replaceAll(/:+$/gu, "")
    .trim();
  const bookPattern = new RegExp(`(${bookNames.join("|")})\\s*(?=\\d)`, "giu");
  let matches = [...reference.matchAll(bookPattern)];
  if (matches.length === 0) {
    reference = referenceFromLink(bookNames, citation);
    matches = [...reference.matchAll(bookPattern)];
  }
  const passages: Passage[] = [];
  for (const [index, match] of matches.entries()) {
    const book = bible.books.find(
      (candidate) => candidate.name.toLowerCase() === match[1]?.toLowerCase()
    );
    if (!book) {
      throw new Error(`Unknown book: ${reference}`);
    }
    const tail = reference
      .slice(match.index + match[0].length, matches[index + 1]?.index)
      .trim()
      .replaceAll(/[.;,]+$/gu, "");
    passages.push(...resolveBook(book, tail));
  }
  if (passages.length === 0) {
    throw new Error(`Empty passage: ${reference}`);
  }
  return passages;
}
