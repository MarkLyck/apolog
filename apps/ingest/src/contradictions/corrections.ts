// The live index still links these deleted records. Neither was in the previous import.
export const unavailablePaths = new Set([
  "/contra/long_day.html",
  "/contra/temptgod.html",
]);

// Corrections are keyed to the exact bad citation so a changed source is checked again.
export const referenceCorrections = new Map([
  ["/contra/knows.html|Numbers 22:28-20", "Numbers 22:28-30"],
  ["/contra/seen.html|Numbers 12:7-1", "Numbers 12:7-8"],
  ["/contra/first.html|Matthew 9:50-53", "Matthew 27:50-53"],
]);

// The nineteenth-century Book of Moses is outside the two Bible datasets.
export const mosesPassage = {
  reference: "Moses 1:3",
  text: "And God spake unto Moses, saying: Behold, I am the Lord God Almighty, and Endless is my name; for I am without beginning of days or end of years; and is not this endless?",
  edition: "Pearl of Great Price, Book of Moses",
};

export const creationLabels = [
  "God the Father did it all by himself.",
  "Jesus did it.",
  "Both of them did it.",
];

export const creationPassages = new Map([
  [
    "Colossians 1:16",
    "By him [Jesus] were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him.",
  ],
  [
    "1 Corinthians 8:6",
    "Yet for us there is one God, the Father, from whom all things are and for whom we exist, and one Lord, Jesus Christ, through whom all things are and through whom we exist.",
  ],
]);
