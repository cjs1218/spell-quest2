// Word building: how prefixes and suffixes join a base word.
// Each challenge shows the parts; the child builds the target word.
// `rule` explains anything that changes when the parts join.

export const BUILDS = [
  // Year 1–2
  { base: "every", add: ["body"], word: "everybody" },
  { base: "prove", add: ["im"], word: "improve", prefix: true },
  { base: "child", add: ["ren"], word: "children", rule: "child + ren makes more than one child." },
  { base: "to", add: ["day"], word: "today" },
  // Years 3 & 4
  { base: "appear", add: ["dis"], word: "disappear", prefix: true, rule: "dis + appear: keep every letter, so it's s then a." },
  { base: "accident", add: ["al", "ly"], word: "accidentally", rule: "accident + al + ly – that's why there's a double l." },
  { base: "actual", add: ["ly"], word: "actually", rule: "actual ends in l, add ly and you get a double l." },
  { base: "occasion", add: ["al", "ly"], word: "occasionally" },
  { base: "possess", add: ["ion"], word: "possession" },
  { base: "forward", add: ["s"], word: "forwards" },
  { base: "probable", add: ["ly"], word: "probably", rule: "With -able words, drop the le and add ly: probable → probably." },
  { base: "nature", add: ["al"], word: "natural", rule: "Drop the e from nature before adding al." },
  { base: "differ", add: ["ent"], word: "different" },
  { base: "there", add: ["fore"], word: "therefore" },
  { base: "though", add: ["al"], word: "although", prefix: true, rule: "all + though drops one l: although." },
  { base: "mention", add: ["ed"], word: "mentioned" },
  { base: "imagine", add: ["ation"], word: "imagination", rule: "Drop the e before adding ation." },
  { base: "important", add: ["un"], word: "unimportant", prefix: true },
  { base: "possible", add: ["im"], word: "impossible", prefix: true, rule: "Use im- before words starting with p." },
  { base: "regular", add: ["ir"], word: "irregular", prefix: true, rule: "Use ir- before words starting with r." },
  { base: "complete", add: ["ly"], word: "completely" },
  { base: "special", add: ["ly"], word: "specially" },
  { base: "certain", add: ["un"], word: "uncertain", prefix: true },
  { base: "continue", add: ["dis"], word: "discontinue", prefix: true },
  { base: "famous", add: ["in"], word: "infamous", prefix: true },
  // Years 5 & 6
  { base: "equip", add: ["ped"], word: "equipped", rule: "equip + ed: double the p to keep the i short." },
  { base: "equip", add: ["ment"], word: "equipment" },
  { base: "immediate", add: ["ly"], word: "immediately", rule: "Keep the e: immediate + ly." },
  { base: "sincere", add: ["ly"], word: "sincerely", rule: "Keep the e: sincere + ly." },
  { base: "frequent", add: ["ly"], word: "frequently" },
  { base: "develop", add: ["ment"], word: "development" },
  { base: "exist", add: ["ence"], word: "existence" },
  { base: "convenient", add: ["in"], word: "inconvenient", prefix: true },
  { base: "relevant", add: ["ir"], word: "irrelevant", prefix: true, rule: "ir + relevant makes a double r." },
  { base: "necessary", add: ["un"], word: "unnecessary", prefix: true, rule: "un + necessary makes a double n." },
  { base: "appear", add: ["ance"], word: "appearance" },
  { base: "persuade", add: ["sion"], word: "persuasion", rule: "persuade drops the de and adds sion." },
  { base: "explain", add: ["ation"], word: "explanation", rule: "Careful! The i disappears: explain → explanation." },
  { base: "marvel", add: ["lous"], word: "marvellous", rule: "In British English, marvel doubles the l: marvellous." },
  { base: "disaster", add: ["ous"], word: "disastrous", rule: "disaster loses its e: disastrous." },
  { base: "communicate", add: ["ion"], word: "communication", rule: "Drop the e before adding ion." },
  { base: "individual", add: ["ly"], word: "individually" },
  { base: "recognise", add: ["able"], word: "recognisable", rule: "Drop the e before adding able." },
  { base: "occur", add: ["red"], word: "occurred", rule: "occur + ed doubles the r: occurred." },
  { base: "embarrass", add: ["ment"], word: "embarrassment" },
  { base: "accompany", add: ["ment"], word: "accompaniment", rule: "Change y to i before adding ment." },
];

// Extra pieces used as wrong choices, so the child has to think.
export const DISTRACTORS = {
  prefix: ["un", "dis", "im", "in", "ir", "re", "mis", "pre"],
  suffix: ["ly", "ful", "ment", "ness", "ed", "ing", "er", "est", "al", "less", "ous", "tion", "s"],
};
