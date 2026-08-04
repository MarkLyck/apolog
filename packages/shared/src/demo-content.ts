import type { DemoContent } from "./content";

const now = Date.UTC(2026, 6, 28);
const day = 86_400_000;

export const contentFixtures = {
  articles: [
    {
      blocks: [
        {
          id: "global-flood-introduction",
          type: "paragraph",
          text: "This editorial demo separates a testable global event from local-flood and literary interpretations. A worldwide event in the recent human past would be expected to leave synchronized evidence across independent archives.",
        },
        {
          id: "global-flood-independent-records",
          type: "heading",
          text: "Independent records",
        },
        {
          id: "global-flood-record-list",
          type: "list",
          items: [
            "Annual ice layers continue through the proposed dates.",
            "Regional archaeological sequences do not show one synchronized break.",
            "Genetic histories do not converge on a recent bottleneck of one family.",
          ],
        },
        {
          id: "global-flood-finding",
          type: "callout",
          title: "Finding",
          text: "The global, recent reading conflicts with several independent evidence streams. This does not evaluate every local or metaphorical interpretation.",
        },
      ],
      corpusKeys: ["bible", "quran"],
      finding: "contradicted",
      publishedAt: now - day * 2,
      readingMinutes: 8,
      slug: "global-flood-evidence",
      sources: [
        {
          title: "Ice cores and climate history",
          publisher: "National Science Foundation",
          url: "https://www.nsf.gov/",
        },
        {
          title: "Geologic time",
          publisher: "United States Geological Survey",
          url: "https://www.usgs.gov/",
        },
      ],
      summary:
        "A demo analysis of what geology, ice cores, and archaeology would be expected to preserve after a recent worldwide flood.",
      tags: ["geology", "flood", "dating methods"],
      title: "Would a global flood leave a global signal?",
      type: "debunked",
      updatedAt: now - day,
    },
    {
      blocks: [
        {
          id: "exodus-introduction",
          type: "paragraph",
          text: "The question is not whether people moved between Egypt and Canaan, but whether the scale and timeline of a particular reading are independently supported.",
        },
        {
          id: "exodus-evidence-heading",
          type: "heading",
          text: "What the evidence can establish",
        },
        {
          id: "exodus-evidence-limits",
          type: "paragraph",
          text: "Material evidence is incomplete, so absence must be weighed cautiously. The strongest conclusion should match the strength of the surviving record.",
        },
      ],
      corpusKeys: ["bible"],
      finding: "unsupported",
      publishedAt: now - day * 8,
      readingMinutes: 7,
      slug: "exodus-scale-and-archaeology",
      sources: [
        {
          title: "Ancient Near Eastern collections",
          publisher: "The Metropolitan Museum of Art",
          url: "https://www.metmuseum.org/toah/",
        },
      ],
      summary:
        "A careful demo of the evidential questions raised by a mass migration through Sinai.",
      tags: ["archaeology", "exodus", "chronology"],
      title: "Exodus at scale: text, logistics, and archaeology",
      type: "debunked",
      updatedAt: now - day * 3,
    },
    {
      blocks: [
        {
          id: "mountains-introduction",
          type: "paragraph",
          text: "Mountains can have deep crustal roots, but they form through tectonic processes that also produce earthquakes. A metaphorical reading and a technical geological claim require different standards of evaluation.",
        },
        {
          id: "mountains-interpretive-caution",
          type: "callout",
          title: "Interpretive caution",
          text: "A later scientific analogy does not by itself establish that a premodern passage encoded a modern mechanism.",
        },
      ],
      corpusKeys: ["quran"],
      finding: "physically implausible",
      publishedAt: now - day * 5,
      readingMinutes: 6,
      slug: "mountains-as-pegs",
      sources: [
        {
          title: "This Dynamic Earth",
          publisher: "United States Geological Survey",
          url: "https://pubs.usgs.gov/gip/dynamic/",
        },
      ],
      summary:
        "A demo analysis distinguishing poetic imagery from modern claims about mountain roots and earthquake stability.",
      tags: ["geology", "mountains", "interpretation"],
      title: "Mountains as pegs: metaphor or geology?",
      type: "debunked",
      updatedAt: now - day * 2,
    },
    {
      blocks: [
        {
          id: "jericho-quotation",
          type: "quote",
          reference: "Joshua 6:21",
          edition:
            "Demo quotation — verify licensed edition before publication",
          text: "The narrative describes the destruction of the city and its inhabitants.",
        },
        {
          id: "jericho-ethical-framework",
          type: "heading",
          text: "Ethical framework",
        },
        {
          id: "jericho-ethical-analysis",
          type: "paragraph",
          text: "The analysis asks whether guilt can be assigned collectively and whether noncombatants can be intentionally harmed. Modern civilian-protection norms reject both ideas.",
        },
        {
          id: "jericho-context-caution",
          type: "callout",
          title: "Context is necessary, not exculpatory by itself",
          text: "Ancient literary convention may affect how the passage is interpreted. It does not make the ethical question disappear.",
        },
      ],
      contentWarning: "Discussion of war and harm to children.",
      corpusKeys: ["bible"],
      publishedAt: now - day * 4,
      readingMinutes: 9,
      slug: "collective-punishment-jericho",
      sources: [
        {
          title: "Protection of civilians in armed conflict",
          publisher: "International Committee of the Red Cross",
          url: "https://www.icrc.org/en/war-and-law/protected-persons/civilians",
        },
      ],
      summary:
        "A demo moral analysis applying harm, civilian distinction, and proportionality to a conquest narrative.",
      tags: ["collective punishment", "war", "human rights"],
      title: "Jericho and the ethics of collective punishment",
      type: "immoral",
      updatedAt: now - day,
    },
    {
      blocks: [
        {
          id: "coercion-introduction",
          type: "paragraph",
          text: "Interpretations range from historically limited conflict instructions to continuing legal rules. The ethical judgment depends on what conduct is claimed and who is placed at risk.",
        },
        {
          id: "coercion-transparent-standard",
          type: "heading",
          text: "A transparent standard",
        },
        {
          id: "coercion-conscience-standard",
          type: "paragraph",
          text: "Freedom of conscience protects belief, nonbelief, conversion, and peaceful expression on equal terms.",
        },
      ],
      corpusKeys: ["quran"],
      publishedAt: now - day * 6,
      readingMinutes: 8,
      slug: "religious-coercion-and-conscience",
      sources: [
        {
          title: "Universal Declaration of Human Rights",
          publisher: "United Nations",
          url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
        },
      ],
      summary:
        "A Quran-focused demo examining disputed passages through consent, equality, and modern freedom-of-belief standards.",
      tags: ["religious intolerance", "consent", "human rights"],
      title: "Religious coercion and freedom of conscience",
      type: "immoral",
      updatedAt: now - day * 2,
    },
    {
      blocks: [
        {
          id: "dating-introduction",
          type: "paragraph",
          text: "Radiometric ages are measurements with assumptions and uncertainty, not dates read from a single instrument. Confidence increases when independent systems agree.",
        },
        {
          id: "dating-checks-heading",
          type: "heading",
          text: "Checks that matter",
        },
        {
          id: "dating-check-list",
          type: "list",
          items: [
            "Use isotope systems with different decay rates.",
            "Compare laboratories and sample minerals.",
            "Test against tree rings, ice layers, and historically dated material where ranges overlap.",
          ],
        },
        {
          id: "dating-method-note",
          type: "callout",
          title: "Limitations stay visible",
          text: "Contamination, open-system behavior, and calibration choices are tested rather than assumed away.",
        },
      ],
      corpusKeys: ["bible", "quran"],
      publishedAt: now - day * 3,
      readingMinutes: 10,
      slug: "how-radiometric-dating-cross-checks-itself",
      sources: [
        {
          title: "Geologic age",
          publisher: "United States Geological Survey",
          url: "https://www.usgs.gov/programs/geology-energy-and-minerals-science-center/science/geologic-age",
        },
      ],
      summary:
        "A visual-first demo explaining independent isotope systems, calibration, uncertainty, and falsifiable checks.",
      tags: ["dating methods", "geology", "methods"],
      title: "How radiometric dating cross-checks itself",
      type: "evidence",
      updatedAt: now,
    },
    {
      blocks: [
        {
          id: "evolution-introduction",
          type: "paragraph",
          text: "Evolutionary theory is supported by predictions shared across genetics, biogeography, comparative anatomy, and the fossil record.",
        },
        {
          id: "evolution-falsification-heading",
          type: "heading",
          text: "What would count against it?",
        },
        {
          id: "evolution-falsification",
          type: "paragraph",
          text: "A scientific account must risk being wrong. Grossly out-of-order fossils, incompatible inheritance patterns, or persistent failure of predicted relationships would create serious problems.",
        },
      ],
      corpusKeys: ["bible", "quran"],
      publishedAt: now - day * 7,
      readingMinutes: 11,
      slug: "evolution-predictions-and-evidence",
      sources: [
        {
          title: "Evolution resources",
          publisher: "National Academies",
          url: "https://www.nationalacademies.org/evolution",
        },
      ],
      summary:
        "A demo evidence guide connecting genetics, fossils, observed change, and the limits of evolutionary claims.",
      tags: ["evolution", "genetics", "fossils"],
      title: "Evolution: predictions, evidence, and open questions",
      type: "evidence",
      updatedAt: now - day * 3,
    },
    {
      blocks: [
        {
          id: "balaam-quotation",
          type: "quote",
          reference: "Numbers 22:28–30",
          edition:
            "Demo paraphrase — verify licensed edition before publication",
          text: "The donkey is given speech and asks Balaam why he has struck her; Balaam answers as though the exchange itself needs no explanation.",
        },
        {
          id: "balaam-silly-heading",
          type: "heading",
          text: "Why the scene reads as silly",
        },
        {
          id: "balaam-comic-reversal",
          type: "paragraph",
          text: "The comedy comes from reversal: the supposedly irrational animal recognizes the danger, while the professional seer does not. The story pauses for an argument between a man and his donkey before revealing the angel in the road.",
        },
        {
          id: "balaam-literary-response",
          type: "callout",
          title: "Strongest literary response",
          text: "A defender can reasonably say the absurdity is deliberate satire. That explains the scene's function, but it does not make a naturally talking donkey less extraordinary or less funny to a modern reader.",
        },
      ],
      corpusKeys: ["bible"],
      finding: "comic miracle narrative",
      publishedAt: now - day,
      readingMinutes: 5,
      slug: "balaams-talking-donkey",
      sources: [
        {
          title: "Numbers 22:21–35",
          publisher: "Bible Gateway",
          url: "https://www.biblegateway.com/passage/?search=Numbers%2022%3A21-35",
        },
      ],
      summary:
        "A prophet argues with his donkey after the animal notices an angel that the human seer cannot see.",
      tags: ["talking animals", "Balaam", "comic reversal"],
      title: "A donkey debates a prophet—and spots the angel first",
      type: "silly",
      updatedAt: now,
    },
    {
      blocks: [
        {
          id: "solomon-quotation",
          type: "quote",
          reference: "Quran 27:18–19",
          edition:
            "Demo paraphrase — verify licensed translation before publication",
          text: "An ant warns the colony to enter their homes before Solomon's army crushes them, and Solomon smiles after understanding its speech.",
        },
        {
          id: "solomon-silly-heading",
          type: "heading",
          text: "Why the scene reads as silly",
        },
        {
          id: "solomon-scale-analysis",
          type: "paragraph",
          text: "The scene gives a tiny ant military awareness, individual speech, and a warning loud or meaningful enough for a king to understand. The sudden shift from marching army to insect traffic report creates an unmistakably whimsical image.",
        },
        {
          id: "solomon-literary-response",
          type: "callout",
          title: "Strongest literary response",
          text: "Within the narrative, Solomon's unusual knowledge is a divine gift and the ant episode displays gratitude rather than zoology. That literary purpose can coexist with recognizing how fanciful the scene sounds when read literally.",
        },
      ],
      corpusKeys: ["quran"],
      finding: "whimsical wonder tale",
      publishedAt: now - day * 2,
      readingMinutes: 5,
      slug: "solomon-understands-the-ant",
      sources: [
        {
          title: "Surah An-Naml 27:18–19",
          publisher: "Quran.com",
          url: "https://quran.com/27/18-19",
        },
      ],
      summary:
        "An ant gives its colony a traffic warning about Solomon's army, and Solomon understands the message.",
      tags: ["talking animals", "Solomon", "wonder tale"],
      title: "Solomon understands an ant's traffic warning",
      type: "silly",
      updatedAt: now - day,
    },
  ],
  contradictions: [
    {
      claims: [
        {
          label: "Account A",
          reference: "2 Samuel 24:1",
          text: "The action is attributed to the anger of the Lord.",
        },
        {
          label: "Account B",
          reference: "1 Chronicles 21:1",
          text: "The action is attributed to an adversary.",
        },
      ],
      corpusKey: "bible",
      rank: 1,
      response:
        "A harmonization may treat one agent as permitting another. The surface narratives nevertheless answer the direct causal question differently.",
      slug: "who-incited-davids-census",
      sources: [
        {
          title: "Passage comparison demo",
          url: "https://www.biblegateway.com/",
        },
      ],
      summary:
        "Parallel accounts attribute the same decision to different agents.",
      title: "Who incited David to take the census?",
      updatedAt: now,
    },
    {
      claims: [
        {
          label: "Matthew",
          reference: "Matthew 27:5",
          text: "Judas is described as hanging himself.",
        },
        {
          label: "Acts",
          reference: "Acts 1:18",
          text: "Judas falls and his body bursts open.",
        },
      ],
      corpusKey: "bible",
      rank: 2,
      response:
        "A common reconciliation proposes a hanging followed by a fall. That sequence is possible, but it is supplied rather than stated by either account.",
      slug: "judas-death-accounts",
      sources: [
        {
          title: "Passage comparison demo",
          url: "https://www.biblegateway.com/",
        },
      ],
      summary:
        "Matthew and Acts emphasize different sequences and causes in their death accounts.",
      title: "How did Judas die?",
      updatedAt: now - day,
    },
    {
      claims: [
        {
          label: "Creation",
          reference: "Quran 7:54",
          text: "Creation is described in six days.",
        },
        {
          label: "Divine measure",
          reference: "Quran 22:47",
          text: "A day with God is compared to a thousand human years.",
        },
      ],
      corpusKey: "quran",
      rank: 1,
      response:
        "The terms can be read analogically rather than as identical units. This demo flags an interpretive tension, not a settled formal contradiction.",
      slug: "creation-days-and-divine-time",
      sources: [
        { title: "Quran passage comparison demo", url: "https://quran.com/" },
      ],
      summary:
        "Passages use six-day creation language alongside days measured as very long human periods.",
      title: "Six days of creation and differently measured divine days",
      updatedAt: now - day * 2,
    },
    {
      claims: [
        {
          label: "Denied",
          reference: "Quran 2:48",
          text: "No intercession is accepted in the warning described.",
        },
        {
          label: "Permitted",
          reference: "Quran 20:109",
          text: "Intercession may benefit one whom God permits.",
        },
      ],
      corpusKey: "quran",
      rank: 2,
      response:
        "The standard reconciliation distinguishes independent intercession from intercession explicitly authorized by God.",
      slug: "intercession-denied-and-permitted",
      sources: [
        { title: "Quran passage comparison demo", url: "https://quran.com/" },
      ],
      summary:
        "Some passages deny intercession while others describe it with divine permission.",
      title: "Is intercession denied or permitted?",
      updatedAt: now - day * 3,
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
  mapEntries: [
    {
      certainty: "disputed",
      comparison:
        "A direct modern route is far shorter than the narrative's forty-year duration; it is a scale comparison, not a reconstruction.",
      corpusKeys: ["bible"],
      latitude: 29.5,
      longitude: 33.8,
      period: "Late Bronze Age (proposed)",
      slug: "exodus-route",
      summary:
        "Traditional and alternative route hypotheses across Egypt and Sinai.",
      title: "Proposed Exodus routes",
      type: "journey",
      updatedAt: now,
    },
    {
      certainty: "traditional",
      comparison:
        "Archaeological dating debates are shown separately from the traditional identification of the site.",
      corpusKeys: ["bible"],
      latitude: 31.871,
      longitude: 35.444,
      period: "Late Bronze Age (disputed dating)",
      slug: "jericho",
      summary:
        "Traditional location associated with the conquest narrative and a long archaeological sequence.",
      title: "Jericho",
      type: "claimed-event",
      updatedAt: now - day,
    },
    {
      certainty: "traditional",
      comparison:
        "The geographic comparison shows the modern straight-line scale while preserving the narrative's claimed supernatural character.",
      corpusKeys: ["quran"],
      latitude: 21.422,
      longitude: 39.826,
      period: "Early 7th century CE",
      slug: "night-journey",
      summary:
        "Traditional route from Mecca to Jerusalem associated with the Isra and Mi'raj narratives.",
      title: "The Night Journey",
      type: "claimed-miracle",
      updatedAt: now - day * 2,
    },
    {
      certainty: "disputed",
      comparison:
        "The map treats each proposed location as a hypothesis rather than selecting one as established.",
      corpusKeys: ["quran"],
      latitude: 31.923,
      longitude: 35.942,
      period: "Late antiquity",
      slug: "people-of-the-cave",
      summary:
        "Several locations are traditionally associated with the sleepers narrative.",
      title: "Competing sites for the People of the Cave",
      type: "geographic-claim",
      updatedAt: now - day * 3,
    },
  ],
} satisfies DemoContent;
