import type {
  ArticlePlacement,
  CollectionKey,
  DemoContent,
  InlineContent,
} from "./content";
import type { CorpusKey } from "./corpus";

const now = Date.UTC(2026, 6, 28);
const day = 86_400_000;

const text = (id: string, value: string): InlineContent => [
  { id, text: value, type: "text" },
];

function place(
  corpusKeys: readonly CorpusKey[],
  collectionKeys: readonly CollectionKey[],
  position = 0
): ArticlePlacement[] {
  return corpusKeys.flatMap((corpusKey) =>
    collectionKeys.map((collectionKey, collectionIndex) => ({
      collectionKey,
      corpusKey,
      isPrimary: collectionIndex === 0,
      position,
    }))
  );
}

export const contentFixtures = {
  articles: [
    {
      document: {
        blocks: [
          {
            content: text(
              "global-flood-introduction-text",
              "A worldwide event in the recent human past would be expected to leave synchronized evidence across independent archives."
            ),
            id: "global-flood-introduction",
            type: "paragraph",
          },
          {
            content: text("global-flood-records-text", "Independent records"),
            id: "global-flood-records",
            level: 2,
            type: "heading",
          },
          {
            id: "global-flood-list",
            items: [
              {
                content: text(
                  "global-flood-ice-layers-text",
                  "Annual ice layers continue through the proposed dates."
                ),
                id: "global-flood-ice-layers",
              },
              {
                content: text(
                  "global-flood-archaeology-text",
                  "Archaeological sequences show no synchronized break."
                ),
                id: "global-flood-archaeology",
              },
              {
                content: text(
                  "global-flood-genetics-text",
                  "Genetic histories show no recent one-family bottleneck."
                ),
                id: "global-flood-genetics",
              },
            ],
            type: "list",
          },
        ],
        schemaVersion: 1,
      },
      finding: "contradicted",
      placements: place(["bible", "quran"], ["debunked"]),
      publishedAt: now - day * 2,
      readingMinutes: 8,
      slug: "global-flood-evidence",
      sources: [
        {
          publisher: "United States Geological Survey",
          title: "Geologic time",
          url: "https://www.usgs.gov/",
        },
      ],
      summary:
        "What geology, ice cores, and archaeology should preserve after a recent worldwide flood.",
      tags: ["geology", "flood", "dating methods"],
      title: "Would a global flood leave a global signal?",
      updatedAt: now - day,
    },
    {
      contentWarning: "Discussion of war and harm to children.",
      document: {
        blocks: [
          {
            content: text(
              "jericho-quotation-text",
              "The narrative describes the destruction of the city and its inhabitants."
            ),
            edition: "Demo paraphrase",
            id: "jericho-quotation",
            reference: "Joshua 6:21",
            type: "quote",
          },
          {
            content: text(
              "jericho-analysis-text",
              "Modern civilian-protection norms reject collective guilt and intentional harm to noncombatants."
            ),
            id: "jericho-analysis",
            type: "paragraph",
          },
        ],
        schemaVersion: 1,
      },
      placements: place(["bible"], ["immoral"]),
      publishedAt: now - day * 4,
      readingMinutes: 9,
      slug: "collective-punishment-jericho",
      sources: [
        {
          publisher: "International Committee of the Red Cross",
          title: "Protection of civilians in armed conflict",
          url: "https://www.icrc.org/en/war-and-law/protected-persons/civilians",
        },
      ],
      summary:
        "A moral analysis applying civilian distinction and proportionality to a conquest narrative.",
      tags: ["collective punishment", "war", "human rights"],
      title: "Jericho and the ethics of collective punishment",
      updatedAt: now - day,
    },
    {
      document: {
        blocks: [
          {
            content: text(
              "dating-introduction-text",
              "Radiometric ages are measurements with assumptions and uncertainty. Confidence increases when independent systems agree."
            ),
            id: "dating-introduction",
            type: "paragraph",
          },
          {
            id: "dating-checks",
            items: [
              {
                content: text(
                  "dating-isotopes-text",
                  "Use isotope systems with different decay rates."
                ),
                id: "dating-isotopes",
              },
              {
                content: text(
                  "dating-laboratories-text",
                  "Compare laboratories and sample minerals."
                ),
                id: "dating-laboratories",
              },
              {
                content: text(
                  "dating-independent-material-text",
                  "Test against independently dated material."
                ),
                id: "dating-independent-material",
              },
            ],
            type: "list",
          },
        ],
        schemaVersion: 1,
      },
      placements: place(["bible", "quran"], ["evidence", "debunked"]),
      publishedAt: now - day * 3,
      readingMinutes: 10,
      slug: "how-radiometric-dating-cross-checks-itself",
      sources: [
        {
          publisher: "United States Geological Survey",
          title: "Geologic age",
          url: "https://www.usgs.gov/programs/geology-energy-and-minerals-science-center/science/geologic-age",
        },
      ],
      summary:
        "How independent isotope systems, calibration, and uncertainty provide falsifiable checks.",
      tags: ["dating methods", "geology", "methods"],
      title: "How radiometric dating cross-checks itself",
      updatedAt: now,
    },
    {
      document: {
        blocks: [
          {
            content: text(
              "evolution-introduction-text",
              "Evolutionary theory makes related predictions across genetics, biogeography, anatomy, and the fossil record."
            ),
            id: "evolution-introduction",
            type: "paragraph",
          },
        ],
        schemaVersion: 1,
      },
      placements: place(["bible", "quran"], ["evidence"]),
      publishedAt: now - day * 7,
      readingMinutes: 11,
      slug: "evolution-predictions-and-evidence",
      sources: [
        {
          publisher: "National Academies",
          title: "Evolution resources",
          url: "https://www.nationalacademies.org/evolution",
        },
      ],
      summary:
        "How genetics, fossils, and observed change jointly test evolutionary explanations.",
      tags: ["evolution", "genetics", "fossils"],
      title: "Evolution: predictions, evidence, and open questions",
      updatedAt: now - day * 3,
    },
    {
      document: {
        blocks: [
          {
            content: text(
              "balaam-quotation-text",
              "The donkey is given speech and asks Balaam why he struck her."
            ),
            edition: "Demo paraphrase",
            id: "balaam-quotation",
            reference: "Numbers 22:28–30",
            type: "quote",
          },
          {
            content: text(
              "balaam-analysis-text",
              "The comic reversal is that the animal recognizes danger while the professional seer does not."
            ),
            id: "balaam-analysis",
            type: "paragraph",
          },
        ],
        schemaVersion: 1,
      },
      finding: "comic miracle narrative",
      placements: place(["bible"], ["silly"]),
      publishedAt: now - day,
      readingMinutes: 5,
      slug: "balaams-talking-donkey",
      sources: [
        {
          publisher: "Bible Gateway",
          title: "Numbers 22:21–35",
          url: "https://www.biblegateway.com/passage/?search=Numbers%2022%3A21-35",
        },
      ],
      summary:
        "A prophet argues with his donkey after it notices an angel the seer cannot see.",
      tags: ["talking animals", "Balaam", "comic reversal"],
      title: "A donkey debates a prophet—and spots the angel first",
      updatedAt: now,
    },
    {
      document: {
        blocks: [
          {
            content: text(
              "solomon-quotation-text",
              "An ant warns its colony about Solomon's army, and Solomon understands the message."
            ),
            edition: "Demo paraphrase",
            id: "solomon-quotation",
            reference: "Quran 27:18–19",
            type: "quote",
          },
        ],
        schemaVersion: 1,
      },
      finding: "whimsical wonder tale",
      placements: place(["quran"], ["silly"]),
      publishedAt: now - day * 2,
      readingMinutes: 5,
      slug: "solomon-understands-the-ant",
      sources: [
        {
          publisher: "Quran.com",
          title: "Surah An-Naml 27:18–19",
          url: "https://quran.com/27/18-19",
        },
      ],
      summary:
        "An ant gives its colony a traffic warning, and Solomon understands it.",
      tags: ["talking animals", "Solomon", "wonder tale"],
      title: "Solomon understands an ant's traffic warning",
      updatedAt: now - day,
    },
    {
      document: {
        blocks: [
          {
            claims: [
              {
                content: text(
                  "census-account-a-text",
                  "The action is attributed to the anger of the Lord."
                ),
                id: "census-account-a",
                label: "Account A",
                reference: "2 Samuel 24:1",
              },
              {
                content: text(
                  "census-account-b-text",
                  "The action is attributed to an adversary."
                ),
                id: "census-account-b",
                label: "Account B",
                reference: "1 Chronicles 21:1",
              },
            ],
            id: "census-comparison",
            type: "claimComparison",
          },
          {
            content: text(
              "census-response-heading-text",
              "Can the accounts be read together?"
            ),
            id: "census-response-heading",
            level: 2,
            type: "heading",
          },
          {
            content: text(
              "census-response-text",
              "A harmonization may treat one agent as permitting another. The surface narratives nevertheless answer the direct causal question differently."
            ),
            id: "census-response",
            type: "paragraph",
          },
        ],
        schemaVersion: 1,
      },
      placements: place(["bible"], ["contradictions"], 570),
      publishedAt: now,
      readingMinutes: 4,
      slug: "who-incited-davids-census",
      sources: [
        {
          publisher: "Bible Gateway",
          title: "Passage comparison demo",
          url: "https://www.biblegateway.com/",
        },
      ],
      summary:
        "Parallel accounts attribute the same decision to different agents.",
      tags: ["contradiction", "David", "census"],
      title: "Who incited David to take the census?",
      updatedAt: now,
    },
    {
      document: {
        blocks: [
          {
            claims: [
              {
                content: text(
                  "intercession-denied-text",
                  "No intercession is accepted in the warning."
                ),
                id: "intercession-denied",
                label: "Denied",
                reference: "Quran 2:48",
              },
              {
                content: text(
                  "intercession-permitted-text",
                  "Intercession may benefit one whom God permits."
                ),
                id: "intercession-permitted",
                label: "Permitted",
                reference: "Quran 20:109",
              },
            ],
            id: "intercession-comparison",
            type: "claimComparison",
          },
          {
            content: text(
              "intercession-response-text",
              "The standard reconciliation distinguishes independent intercession from intercession explicitly authorized by God."
            ),
            id: "intercession-response",
            type: "paragraph",
          },
        ],
        schemaVersion: 1,
      },
      placements: place(["quran"], ["contradictions"], 1),
      publishedAt: now - day,
      readingMinutes: 4,
      slug: "intercession-denied-and-permitted",
      sources: [
        {
          publisher: "Quran.com",
          title: "Quran passage comparison demo",
          url: "https://quran.com/",
        },
      ],
      summary:
        "Some passages deny intercession while others describe it with permission.",
      tags: ["contradiction", "intercession"],
      title: "Is intercession denied or permitted?",
      updatedAt: now - day,
    },
  ],
  corpora: [
    {
      description:
        "Hebrew Bible and New Testament texts, editions, claims, and reception.",
      key: "bible",
      name: "Bible",
    },
    {
      description:
        "Quranic text, translations, claims, historical setting, and reception.",
      key: "quran",
      name: "Quran",
    },
  ],
} satisfies DemoContent;
