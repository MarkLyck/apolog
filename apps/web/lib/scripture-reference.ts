const bibleBooks = new Set(
  "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation".split(
    "|"
  )
);
const deuterocanonicalBooks = new Set(
  "Tobit|Judith|Wisdom|Ecclesiasticus|Baruch|1 Maccabees|2 Maccabees".split("|")
);

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
  const supported =
    version === "Moses"
      ? book === "Moses" && finish.chapter <= 8
      : bibleBooks.has(book) ||
        (version === "DRA" && deuterocanonicalBooks.has(book));
  if (!supported) {
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
