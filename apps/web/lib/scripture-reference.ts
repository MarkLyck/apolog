const bibleChapters = new Map<string, number>([
  ["Genesis", 50],
  ["Exodus", 40],
  ["Leviticus", 27],
  ["Numbers", 36],
  ["Deuteronomy", 34],
  ["Joshua", 24],
  ["Judges", 21],
  ["Ruth", 4],
  ["1 Samuel", 31],
  ["2 Samuel", 24],
  ["1 Kings", 22],
  ["2 Kings", 25],
  ["1 Chronicles", 29],
  ["2 Chronicles", 36],
  ["Ezra", 10],
  ["Nehemiah", 13],
  ["Esther", 10],
  ["Job", 42],
  ["Psalms", 150],
  ["Proverbs", 31],
  ["Ecclesiastes", 12],
  ["Song of Solomon", 8],
  ["Isaiah", 66],
  ["Jeremiah", 52],
  ["Lamentations", 5],
  ["Ezekiel", 48],
  ["Daniel", 12],
  ["Hosea", 14],
  ["Joel", 3],
  ["Amos", 9],
  ["Obadiah", 1],
  ["Jonah", 4],
  ["Micah", 7],
  ["Nahum", 3],
  ["Habakkuk", 3],
  ["Zephaniah", 3],
  ["Haggai", 2],
  ["Zechariah", 14],
  ["Malachi", 4],
  ["Matthew", 28],
  ["Mark", 16],
  ["Luke", 24],
  ["John", 21],
  ["Acts", 28],
  ["Romans", 16],
  ["1 Corinthians", 16],
  ["2 Corinthians", 13],
  ["Galatians", 6],
  ["Ephesians", 6],
  ["Philippians", 4],
  ["Colossians", 4],
  ["1 Thessalonians", 5],
  ["2 Thessalonians", 3],
  ["1 Timothy", 6],
  ["2 Timothy", 4],
  ["Titus", 3],
  ["Philemon", 1],
  ["Hebrews", 13],
  ["James", 5],
  ["1 Peter", 5],
  ["2 Peter", 3],
  ["1 John", 5],
  ["2 John", 1],
  ["3 John", 1],
  ["Jude", 1],
  ["Revelation", 22],
]);
const douayChapters = new Map<string, number>([
  ...bibleChapters,
  ["Tobit", 14],
  ["Judith", 16],
  ["Esther", 16],
  ["Wisdom", 19],
  ["Ecclesiasticus", 51],
  ["Baruch", 6],
  ["Daniel", 14],
  ["1 Maccabees", 16],
  ["2 Maccabees", 15],
]);

export function parseScriptureReference(reference: string) {
  const match =
    /^(?<book>.+) (?<chapter>[1-9]\d{0,2})(?::(?<verse>[1-9]\d{0,2}))?(?:[-–](?:(?<endChapter>[1-9]\d{0,2}):)?(?<end>[1-9]\d{0,2}))?$/u.exec(
      reference.trim()
    );
  if (!match?.groups) {
    return null;
  }
  const { book, chapter, verse, endChapter, end } = match.groups;
  if (!book || !chapter) {
    return null;
  }
  const start = { chapter: Number(chapter), verse: Number(verse ?? 1) };
  const finish = {
    chapter: Number(endChapter ?? (verse ? chapter : (end ?? chapter))),
    verse: verse ? Number(end ?? verse) : Infinity,
  };
  if (
    finish.chapter > 150 ||
    finish.chapter < start.chapter ||
    (finish.chapter === start.chapter && finish.verse < start.verse) ||
    (!verse && endChapter)
  ) {
    return null;
  }
  return { book: book === "Psalm" ? "Psalms" : book, start, finish };
}

export function bibleGatewayUrl(reference: string, version: string) {
  const url = new URL("https://www.biblegateway.com/passage/");
  url.searchParams.set("search", reference);
  url.searchParams.set("version", version);
  return url.href;
}

export function scriptureEdition(edition: string) {
  switch (edition) {
    case "King James Version":
    case "KJV": {
      return { version: "KJV", label: "King James Version (KJV)", note: null };
    }
    case "King James Version, with supplied clarification": {
      return {
        version: "KJV",
        label: "King James Version (KJV), with supplied clarification",
        note: "This quotation includes an editorial clarification. The linked chapter contains the unmodified KJV text.",
      };
    }
    case "Douay-Rheims, Challoner revision": {
      return {
        version: "DRA",
        label: "Douay-Rheims, Challoner revision (DRA)",
        note: null,
      };
    }
    case "Pearl of Great Price, Book of Moses": {
      return {
        version: "Moses",
        label: edition,
        note: "The Book of Moses is part of the Latter-day Saint Pearl of Great Price, not a book of the Bible.",
      };
    }
    case "Supplied quotation": {
      return {
        version: null,
        label: edition,
        note: "The translation of this supplied quotation is not identified. Its wording should not be attributed to a named Bible edition.",
      };
    }
    default: {
      return { version: null, label: edition, note: null };
    }
  }
}

export function fullChapterLinks(reference: string, edition: string) {
  const passage = parseScriptureReference(reference);
  const { version } = scriptureEdition(edition);
  if (!passage || !version) {
    return [];
  }
  const { book, start, finish } = passage;
  const chapterLimit =
    version === "Moses"
      ? book === "Moses"
        ? 8
        : 0
      : ((version === "DRA" ? douayChapters : bibleChapters).get(book) ?? 0);
  if (finish.chapter > chapterLimit) {
    return [];
  }
  return Array.from(
    { length: finish.chapter - start.chapter + 1 },
    (_, index) => {
      const chapter = start.chapter + index;
      const label = `${book} ${chapter}`;
      return {
        label,
        href:
          version === "Moses"
            ? `https://www.churchofjesuschrist.org/study/scriptures/pgp/moses/${chapter}?lang=eng`
            : bibleGatewayUrl(label, version),
      };
    }
  );
}
