import {
  bibleGatewayUrl,
  parseScriptureReference,
  scriptureEdition,
} from "./scripture-reference";

type ScriptureNote = {
  kind: "wording" | "context";
  passages: string[];
  text: string;
  readings: { reference: string; version: string }[];
};

const notes: ScriptureNote[] = [
  {
    kind: "context",
    passages: ["Luke 14:26", "Matthew 10:37"],
    text: 'Luke requires a disciple to "hate" family and even their own life. Matthew frames family loyalty as loving a parent or child more than Jesus. This affects whether the comparison concerns literal hostility or the priority demanded by discipleship; the wording of the two accounts remains different.',
    readings: [
      { reference: "Luke 14:25-33", version: "KJV" },
      { reference: "Matthew 10:34-39", version: "KJV" },
    ],
  },
  {
    kind: "context",
    passages: ["Job 4:1-21", "Job 5:1-27", "Job 15:1-35", "Job 22:1-30"],
    text: "These are Eliphaz's words in a debate with Job. In Job 42:7, God rebukes Eliphaz and his friends for speaking wrongly about him. Attributing every statement in this speech directly to God would change the argument.",
    readings: [
      { reference: "Job 4:1", version: "KJV" },
      { reference: "Job 42:7-8", version: "KJV" },
    ],
  },
  {
    kind: "wording",
    passages: ["Genesis 2:19"],
    text: 'The KJV says God "formed" the animals; the NIV says "had formed." That tense choice changes whether the sentence presents their creation as the next event or as an earlier event. Inspect it before treating the order of narration as a fixed chronology.',
    readings: [{ reference: "Genesis 2:18-22", version: "KJV;NIV" }],
  },
  {
    kind: "context",
    passages: ["Genesis 2:5"],
    text: "This verse describes plants of the field and connects their absence to rain and a person to till the ground. Whether that means all vegetation or cultivated plants affects comparisons with the vegetation in Genesis 1.",
    readings: [
      { reference: "Genesis 2:4-9", version: "KJV" },
      { reference: "Genesis 1:11-13", version: "KJV" },
    ],
  },
  {
    kind: "wording",
    passages: ["Genesis 22:1", "James 1:13"],
    text: 'The KJV says God "tempt" Abraham in Genesis 22:1; the NIV says "tested." James 1:13 specifically discusses temptation with evil. Whether the passages describe a test or an inducement to wrongdoing affects the claim that they deny and affirm the same action.',
    readings: [
      { reference: "Genesis 22:1", version: "KJV;NIV" },
      { reference: "James 1:13-15", version: "KJV" },
    ],
  },
  {
    kind: "wording",
    passages: ["Isaiah 45:7"],
    text: 'The KJV uses "evil" where the NIV uses "disaster." The verse pairs this with peace or prosperity. A claim about God causing suffering differs from a claim about God committing moral evil; the translation affects which claim this passage supports.',
    readings: [{ reference: "Isaiah 45:7", version: "KJV;NIV" }],
  },
  {
    kind: "wording",
    passages: ["Exodus 20:13", "Deuteronomy 5:17"],
    text: 'The KJV says "kill"; the NIV says "murder." A prohibition of murder has a narrower scope than a prohibition of every killing. That distinction affects comparisons with warfare or execution commands.',
    readings: [
      { reference: "Exodus 20:13", version: "KJV;NIV" },
      { reference: "Deuteronomy 5:17", version: "KJV;NIV" },
    ],
  },
  {
    kind: "wording",
    passages: ["Acts 9:7", "Acts 22:9"],
    text: "In Acts 22:9, the KJV says the companions did not hear the voice; the NIV says they did not understand it. Compare that choice with Acts 9:7, which describes them hearing a voice. Hearing and understanding are different claims.",
    readings: [
      { reference: "Acts 9:7", version: "KJV;NIV" },
      { reference: "Acts 22:9", version: "KJV;NIV" },
    ],
  },
  {
    kind: "context",
    passages: ["Proverbs 26:4-5"],
    text: "These opposite instructions appear in consecutive verses, each giving a different consequence to avoid. Their placement matters: the passage itself presents the tension as advice about answering a fool, rather than giving two unrelated accounts of an event.",
    readings: [{ reference: "Proverbs 26:4-5", version: "KJV" }],
  },
  {
    kind: "context",
    passages: ["Exodus 33:11", "Exodus 33:20-23"],
    text: "The same chapter describes face-to-face speech in verse 11, denies that a person can see God's face and live in verse 20, and permits a view of God's back in verse 23. The argument depends on whether the description of speech and the later restriction concern the same kind of seeing.",
    readings: [{ reference: "Exodus 33", version: "KJV" }],
  },
  {
    kind: "context",
    passages: ["1 Samuel 15:11", "1 Samuel 15:29", "1 Samuel 15:35"],
    text: "This chapter both describes God repenting over Saul's kingship and says God will not repent. Verse 29 occurs in Samuel's rejection of Saul's request to reverse the verdict. Inspect whether the statement concerns that verdict or makes a general claim about God changing his mind.",
    readings: [{ reference: "1 Samuel 15", version: "KJV" }],
  },
  {
    kind: "context",
    passages: ["Mark 11:12-21", "Matthew 21:18-20"],
    text: "Matthew describes the fig tree withering immediately. Mark separates the curse from the disciples' observation of the withered tree the next morning, with the temple episode between them. The time an event happens and the time someone notices it should be distinguished when comparing the sequences.",
    readings: [
      { reference: "Matthew 21:18-20", version: "KJV" },
      { reference: "Mark 11:12-21", version: "KJV" },
    ],
  },
  {
    kind: "context",
    passages: ["1 Corinthians 8:5"],
    text: 'Paul introduces these as beings "called gods" before contrasting them with "to us" one God in verse 6. Whether the passage reports other people\'s labels or affirms the existence of multiple gods affects the comparison.',
    readings: [{ reference: "1 Corinthians 8:4-6", version: "KJV" }],
  },
];

function overlaps(reference: string, target: string) {
  const passage = parseScriptureReference(reference);
  const range = parseScriptureReference(target);
  if (!passage || !range || passage.book !== range.book) {
    return false;
  }
  const before = (a: typeof passage.start, b: typeof passage.start) =>
    a.chapter < b.chapter || (a.chapter === b.chapter && a.verse < b.verse);
  return (
    !before(passage.finish, range.start) && !before(range.finish, passage.start)
  );
}

export function scriptureNotes(reference: string, edition: string) {
  if (scriptureEdition(edition).version !== "KJV") {
    return [];
  }
  return notes.flatMap((note) => {
    if (!note.passages.some((target) => overlaps(reference, target))) {
      return [];
    }
    return [
      {
        kind: note.kind,
        text: note.text,
        sources: note.readings.map(({ reference: reading, version }) => ({
          label: `${reading} (${version.replaceAll(";", " / ")})`,
          href: bibleGatewayUrl(reading, version),
        })),
      },
    ];
  });
}
