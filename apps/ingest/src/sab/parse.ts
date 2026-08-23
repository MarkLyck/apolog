const SAB_ORIGIN = "https://www.skepticsannotatedbible.com";
const verseReferencePattern =
  /^(?:\d+\s+)?[A-Za-z][A-Za-z.'’-]*(?:\s+[A-Za-z][A-Za-z.'’-]*)*\s+\d+[:.;]\d+/u;
const hrefReferencePattern =
  /(?:\.\.)?\/(?<book>[a-z0-9]+)\/(?<chapter>\d+)\.html#(?<verse>[^"'>\s]+)/iu;

const sabBookNames = {
  "1chr": "1 Chronicles",
  "1cor": "1 Corinthians",
  "1jn": "1 John",
  "1kg": "1 Kings",
  "1pet": "1 Peter",
  "1sam": "1 Samuel",
  "1th": "1 Thessalonians",
  "1tim": "1 Timothy",
  "2chr": "2 Chronicles",
  "2cor": "2 Corinthians",
  "2jn": "2 John",
  "2kg": "2 Kings",
  "2pet": "2 Peter",
  "2sam": "2 Samuel",
  "2th": "2 Thessalonians",
  "2tim": "2 Timothy",
  "3jn": "3 John",
  acts: "Acts",
  am: "Amos",
  col: "Colossians",
  dan: "Daniel",
  dt: "Deuteronomy",
  ec: "Ecclesiastes",
  eph: "Ephesians",
  est: "Esther",
  ex: "Exodus",
  ezek: "Ezekiel",
  ezr: "Ezra",
  gal: "Galatians",
  gen: "Genesis",
  hab: "Habakkuk",
  hag: "Haggai",
  heb: "Hebrews",
  hos: "Hosea",
  isa: "Isaiah",
  jas: "James",
  jer: "Jeremiah",
  jg: "Judges",
  jl: "Joel",
  jn: "John",
  job: "Job",
  joel: "Joel",
  jon: "Jonah",
  jos: "Joshua",
  jude: "Jude",
  lam: "Lamentations",
  lev: "Leviticus",
  lk: "Luke",
  mal: "Malachi",
  mic: "Micah",
  mk: "Mark",
  mt: "Matthew",
  nah: "Nahum",
  neh: "Nehemiah",
  num: "Numbers",
  ob: "Obadiah",
  phm: "Philemon",
  php: "Philippians",
  pr: "Proverbs",
  ps: "Psalms",
  rev: "Revelation",
  rom: "Romans",
  ru: "Ruth",
  sos: "Song of Solomon",
  tit: "Titus",
  zech: "Zechariah",
  zep: "Zephaniah",
} as const;

type SabBookCode = keyof typeof sabBookNames;

function isSabBookCode(value: string): value is SabBookCode {
  return Object.hasOwn(sabBookNames, value);
}

export type SabContradictionClaim = {
  label: string;
  references: string[];
};

export type SabContradictionEntry = {
  book: string;
  claims: SabContradictionClaim[];
  firstReference: string;
  path: string;
  position: number;
  title: string;
  url: string;
};

export type SabDetailPage = {
  claims: SabContradictionClaim[];
  title: string;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll(/&#x(?<hex>[0-9a-f]+);/giu, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replaceAll(/&#(?<code>\d+);/gu, (_match, code: string) =>
      String.fromCodePoint(Number(code))
    );
}

function collapseWhitespace(value: string): string {
  return decodeHtmlEntities(value).replaceAll(/\s+/gu, " ").trim();
}

function stripTags(value: string): string {
  return collapseWhitespace(value.replaceAll(/<[^>]+>/gu, " "));
}

export function normalizeVerseReference(value: string): string | null {
  const cleaned = collapseWhitespace(value)
    .replaceAll(/(?<letter>[A-Za-z])\.(?<digit>\d)/gu, "$<letter> $<digit>")
    .replaceAll(/(?<letter>[A-Za-z])(?=\d+[:.;])/gu, "$<letter> ")
    .replaceAll(/(?<left>\d+)\s*;\s*(?<right>\d+)/gu, "$<left>:$<right>")
    .replaceAll(/(?<left>\d+)\.(?<right>\d+)/gu, "$<left>:$<right>")
    .replaceAll(/[.:;]+$/gu, "");
  return verseReferencePattern.test(cleaned) ? cleaned : null;
}

export function isVerseReference(value: string): boolean {
  return normalizeVerseReference(value) !== null;
}

export function referenceFromHref(href: string): string | null {
  const match = hrefReferencePattern.exec(href);
  const bookCode = match?.groups?.book?.toLowerCase();
  const chapter = match?.groups?.chapter;
  const verse = match?.groups?.verse;
  if (!bookCode || !chapter || !verse || !isSabBookCode(bookCode)) {
    return null;
  }
  return `${sabBookNames[bookCode]} ${chapter}:${verse}`;
}

export function parseSabListPage(
  html: string
): Omit<SabContradictionEntry, "claims">[] {
  const listStart = html.indexOf('<div class="list">');
  const listHtml = listStart === -1 ? html : html.slice(listStart);
  const entries: Omit<SabContradictionEntry, "claims">[] = [];
  let book = "Bible";
  const tokenPattern =
    /<h3\b[^>]*>(?<heading>[\s\S]*?)<\/h3>|<li\b[^>]*>(?<item>[\s\S]*?)<\/li>/giu;

  for (const match of listHtml.matchAll(tokenPattern)) {
    const heading = match.groups?.heading;
    const item = match.groups?.item;
    if (heading !== undefined) {
      const label = stripTags(heading);
      if (label && !label.startsWith("Contradictions by First Occurrence")) {
        book = label;
      }
      continue;
    }
    if (item === undefined) {
      continue;
    }
    const contraMatch =
      /<a\b[^>]*href="(?<path>\/contra\/[^"]+)"[^>]*>(?<title>[\s\S]*?)<\/a>/iu.exec(
        item
      );
    const path = contraMatch?.groups?.path;
    if (!path || contraMatch?.groups?.title === undefined) {
      continue;
    }
    const firstReference = [
      ...item.matchAll(/<a\b[^>]*>(?<text>[\s\S]*?)<\/a>/giu),
    ]
      .map((link) =>
        normalizeVerseReference(stripTags(link.groups?.text ?? ""))
      )
      .find((reference) => reference !== null);
    if (!firstReference) {
      continue;
    }
    entries.push({
      book,
      firstReference,
      path,
      position: entries.length + 1,
      title: stripTags(contraMatch.groups.title),
      url: new URL(path, SAB_ORIGIN).href,
    });
  }

  return entries;
}

function extractContraBody(html: string): string {
  const start = html.indexOf('<div class="contra">');
  if (start === -1) {
    return "";
  }
  const from = start + '<div class="contra">'.length;
  const linkStart = html.indexOf('<div class="links"', from);
  const commentsStart = html.indexOf('id="comments-section"', from);
  const boundaries = [linkStart, commentsStart].filter((index) => index !== -1);
  const end = boundaries.length > 0 ? Math.min(...boundaries) : html.length;
  return html.slice(from, end);
}

function extractReferences(html: string): string[] {
  const found: string[] = [];
  for (const link of html.matchAll(
    /<a\b(?<attrs>[^>]*)>(?<text>[\s\S]*?)<\/a>/giu
  )) {
    const fromText = normalizeVerseReference(
      stripTags(link.groups?.text ?? "")
    );
    const href = /href="(?<href>[^"]+)"/iu.exec(link.groups?.attrs ?? "")
      ?.groups?.href;
    const fromHref = href ? referenceFromHref(href) : null;
    if (fromText) {
      found.push(fromText);
    } else if (fromHref) {
      found.push(fromHref);
    }
  }
  if (found.length === 0) {
    for (const href of html.matchAll(/href="(?<href>[^"]+)"/giu)) {
      const fromHref = referenceFromHref(href.groups?.href ?? "");
      if (fromHref) {
        found.push(fromHref);
      }
    }
  }
  return [...new Set(found)];
}

export function parseSabDetailPage(html: string): SabDetailPage {
  const body = extractContraBody(html);
  const titleMatch = /<h2\b[^>]*>(?<title>[\s\S]*?)<\/h2>/iu.exec(body);
  const title = titleMatch?.groups?.title
    ? stripTags(titleMatch.groups.title)
    : "";
  const headings = [...body.matchAll(/<h3\b[^>]*>(?<label>[\s\S]*?)<\/h3>/giu)];
  const claims: SabContradictionClaim[] = [];

  for (const [index, heading] of headings.entries()) {
    const label = stripTags(heading.groups?.label ?? "");
    const from = (heading.index ?? 0) + heading[0].length;
    const next = headings[index + 1];
    const section = body.slice(from, next?.index ?? body.length);
    const references = extractReferences(section);
    if (!label || references.length === 0) {
      continue;
    }
    claims.push({ label, references });
  }

  if (claims.length < 2) {
    const looseReferences = extractReferences(body);
    if (looseReferences.length >= 2) {
      return {
        claims: looseReferences.map((reference, index) => ({
          label: `Account ${String.fromCodePoint(65 + index)}`,
          references: [reference],
        })),
        title,
      };
    }
  }

  return { claims, title };
}

export function mergeSabEntry(
  listing: Omit<SabContradictionEntry, "claims">,
  detail: SabDetailPage
): SabContradictionEntry {
  return {
    ...listing,
    claims: detail.claims,
    title: listing.title || detail.title,
  };
}
