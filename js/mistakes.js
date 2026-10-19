// Works out what KIND of mistake a spelling attempt was, so the app can spot
// patterns (e.g. "often misses double letters") and suggest the right family.

const VOWELS = /[aeiouy]/g;
const SILENT_WORDS = new Set([
  "answer", "build", "guard", "guide", "island", "knowledge", "reign", "muscle", "yacht",
  "rhyme", "rhythm", "foreign", "government", "conscience", "conscious", "climb", "hour",
  "half", "who", "whole", "listen", "write", "know", "knee", "lamb", "thumb", "sign", "wrong",
]);

export const MISTAKE_TYPES = {
  double: {
    label: "Double letters",
    advice: "Clap the syllables and listen for where the double letter sits.",
    familyMatch: (id) => id.includes("double"),
  },
  silent: {
    label: "Silent letters",
    advice: "Say the word the 'silly' way, sounding out the hidden letter.",
    familyMatch: (id) => id.includes("silent"),
  },
  vowel: {
    label: "Vowel sounds",
    advice: "The consonants were right! Look closely at the a, e, i, o, u letters.",
    familyMatch: (id) => /^y\d+-(e|o|i|ear-eigh|ie-ei|o-u|u-oo|o-oo|a-ar|e-ea|o-y)$/.test(id),
  },
  order: {
    label: "Letters in the wrong order",
    advice: "All the right letters were there. Chop the word into beats and spell one chunk at a time.",
    familyMatch: () => false,
  },
  ending: {
    label: "Word endings",
    advice: "The start was right. Practise endings like -tion, -ous, -ence and -ally.",
    familyMatch: (id) => /-(tion|al-ar|ence|ous|ise|ould)$/.test(id),
  },
  start: {
    label: "First sounds",
    advice: "Say the first sound slowly and think which letters make it.",
    familyMatch: () => false,
  },
  other: {
    label: "Other tricky bits",
    advice: "Use 'Spell it with me' and a memory trick for these.",
    familyMatch: () => false,
  },
};

const doubles = (w) => (w.match(/(.)\1/g) || []).map((d) => d.toLowerCase());

export function classifyMistake(answer, word) {
  const a = (answer || "").toLowerCase().trim();
  const w = word.toLowerCase();
  if (!a || a === w) return [];
  const types = new Set();

  const wd = doubles(w);
  const ad = doubles(a);
  if (wd.some((d) => !ad.includes(d)) || ad.some((d) => !wd.includes(d))) types.add("double");

  if (SILENT_WORDS.has(w) && a.length < w.length) types.add("silent");

  if (a.length === w.length && [...a].sort().join("") === [...w].sort().join("")) types.add("order");

  if (a.replace(VOWELS, "*") === w.replace(VOWELS, "*") ||
      a.replace(VOWELS, "") === w.replace(VOWELS, "")) types.add("vowel");

  if (a[0] !== w[0]) types.add("start");

  // Same start (most of the word) but a different ending.
  let prefix = 0;
  while (prefix < Math.min(a.length, w.length) && a[prefix] === w[prefix]) prefix++;
  if (types.size === 0 && prefix >= Math.max(2, w.length - 4) && prefix < w.length) types.add("ending");

  if (types.size === 0) types.add("other");
  return [...types];
}
