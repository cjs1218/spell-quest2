// National Curriculum (England) statutory spelling lists, grouped into
// spelling families so children learn by pattern rather than by random list.
// Each family has a short child-friendly tip. Every statutory word appears
// in exactly one family (checked by tools/check-words.mjs).

export const YEAR_GROUPS = {
  y34: {
    label: "Years 3 & 4",
    families: [
      {
        id: "y34-silent",
        name: "Sneaky silent letters",
        tip: "Some letters hide and make no sound. Say the word the 'silly' way to remember them: an-S-wer, K-now-ledge.",
        words: ["answer", "build", "guard", "guide", "island", "knowledge", "reign"],
      },
      {
        id: "y34-ough",
        name: "The tricky 'ough' & 'augh' gang",
        tip: "'ough' can make lots of different sounds. Learn these words as a team.",
        words: ["although", "though", "thought", "through", "enough", "caught", "naughty"],
      },
      {
        id: "y34-ear-eigh",
        name: "'ear' and 'eigh'",
        tip: "'ear' doesn't always sound like the ear on your head! 'eigh' often says 'ay' or 'eye'.",
        words: ["early", "earth", "heard", "heart", "learn", "eight", "eighth", "height", "weight"],
      },
      {
        id: "y34-soft-c",
        name: "Soft 'c' (sounds like 's')",
        tip: "When c is followed by e, i or y it usually says 's'.",
        words: ["accident", "bicycle", "centre", "century", "certain", "circle", "decide", "exercise", "experience", "medicine", "notice", "recent", "sentence"],
      },
      {
        id: "y34-double",
        name: "Double trouble letters",
        tip: "Clap the syllables and listen for where the double letter sits: ap-pear, dif-fer-ent.",
        words: ["address", "appear", "arrive", "different", "difficult", "disappear", "opposite", "possible", "suppose", "possess", "possession"],
      },
      {
        id: "y34-tion",
        name: "'shun' and 'zhun' endings",
        tip: "The end sound 'shun' can be spelt -tion, -sion or -ssion. 'pressure' joins them with -ssure.",
        words: ["mention", "question", "position", "occasion", "occasionally", "pressure"],
      },
      {
        id: "y34-al-ar",
        name: "Endings: -al, -ally and -ar",
        tip: "Add -ly to -al words to get -ally: natural → naturally.",
        words: ["actual", "actually", "accidentally", "natural", "special", "material", "calendar", "grammar", "particular", "peculiar", "popular", "regular"],
      },
      {
        id: "y34-split",
        name: "Long sounds with a magic e",
        tip: "The e at the end makes the vowel say its name: compl-E-te, ext-R-E-me.",
        words: ["complete", "extreme", "describe", "imagine", "increase", "purpose", "promise", "believe", "breathe", "breath"],
      },
      {
        id: "y34-tricky-a",
        name: "Tricky words – set A",
        tip: "Make up your own silly sentence or picture for each of these.",
        words: ["busy", "business", "consider", "continue", "experiment", "famous", "favourite", "February", "forward", "forwards", "fruit", "group"],
      },
      {
        id: "y34-tricky-b",
        name: "Tricky words – set B",
        tip: "Chop them into syllables and say each part clearly: Feb-ru-ar-y, li-brar-y.",
        words: ["history", "important", "interest", "length", "strength", "library", "minute", "often", "ordinary", "perhaps", "potatoes", "probably"],
      },
      {
        id: "y34-tricky-c",
        name: "Tricky words – set C",
        tip: "Look for words inside words: 'there' + 'fore', 'separate' has 'a rat' in it!",
        words: ["quarter", "remember", "separate", "straight", "strange", "surprise", "therefore", "various", "woman", "women"],
      },
    ],
  },
  y56: {
    label: "Years 5 & 6",
    families: [
      {
        id: "y56-double-c-m",
        name: "Double 'c' and double 'm'",
        tip: "accommodate is extra greedy – it has two c's AND two m's!",
        words: ["accommodate", "accompany", "according", "committee", "communicate", "community", "recommend", "occupy", "occur"],
      },
      {
        id: "y56-double-other",
        name: "More double letters",
        tip: "Stretch the word out slowly and find the doubled sound.",
        words: ["aggressive", "appreciate", "attached", "apparent", "correspond", "embarrass", "exaggerate", "immediate", "immediately", "interrupt", "necessary", "opportunity", "suggest", "sufficient", "harass", "excellent"],
      },
      {
        id: "y56-silent",
        name: "Silent letters",
        tip: "Say the hidden letter out loud when you practise: mus-C-le, gover-N-ment.",
        words: ["muscle", "yacht", "rhyme", "rhythm", "foreign", "government", "conscience", "conscious"],
      },
      {
        id: "y56-ie-ei",
        name: "'ie' and 'ei'",
        tip: "'i before e, except after c' works for some words – but watch out for leisure!",
        words: ["achieve", "ancient", "leisure", "mischievous", "soldier", "variety", "neighbour"],
      },
      {
        id: "y56-ence",
        name: "-ence, -ance and -ent",
        tip: "These sound alike. Link them to a word you know: exist → existence.",
        words: ["convenience", "existence", "hindrance", "relevant", "nuisance", "secretary", "sincere", "sincerely"],
      },
      {
        id: "y56-ise",
        name: "British -ise and -ice",
        tip: "In British English we usually write -ise: recognise, criticise.",
        words: ["criticise", "recognise", "sacrifice", "prejudice", "privilege"],
      },
      {
        id: "y56-ous",
        name: "-ous and -ious",
        tip: "disastrous loses the 'e' from disaster. marvellous doubles the l.",
        words: ["disastrous", "marvellous", "curiosity", "definite", "desperate", "determined"],
      },
      {
        id: "y56-tricky-a",
        name: "Tricky words – set A",
        tip: "Draw a picture clue or make up a silly sentence for each word.",
        words: ["amateur", "available", "average", "awkward", "bargain", "bruise", "category", "cemetery", "competition", "controversy", "develop", "dictionary"],
      },
      {
        id: "y56-tricky-b",
        name: "Tricky words – set B",
        tip: "Chop each word into syllables: en-vi-ron-ment, es-pe-cial-ly.",
        words: ["environment", "equip", "equipped", "equipment", "especially", "explanation", "familiar", "forty", "frequently", "guarantee", "identity", "individual", "interfere"],
      },
      {
        id: "y56-tricky-c",
        name: "Tricky words – set C",
        tip: "Look for a word inside the word: par-LIAM-ent, light-NING (no 'e').",
        words: ["language", "lightning", "parliament", "persuade", "physical", "profession", "programme", "pronunciation", "queue", "restaurant", "shoulder", "signature"],
      },
      {
        id: "y56-tricky-d",
        name: "Tricky words – set D",
        tip: "Make your own memory trick – the sillier, the better!",
        words: ["stomach", "symbol", "system", "temperature", "thorough", "twelfth", "vegetable", "vehicle"],
      },
    ],
  },
};

// Built-in memory tricks for some of the trickiest words.
export const MNEMONICS = {
  separate: "There's A RAT in sepARATe!",
  necessary: "One Collar, two Sleeves – one c, two s's.",
  island: "An island IS LAND surrounded by water.",
  believe: "Never beLIEve a LIE.",
  February: "Feb-RU-ary – are you (RU) ready for February?",
  embarrass: "Two Red cheeks and Two Shy smiles – double r, double s.",
  accommodate: "It's big enough to accommodate two c's AND two m's.",
  rhythm: "Rhythm Helps Your Two Hips Move.",
  height: "Eight is in heIGHT.",
  weight: "Eight is in wEIGHT.",
  heart: "You HEAR with your EAR, and there's EAR in hEARt.",
  government: "To GOVERN the country.",
  environment: "There's IRON in envIRONment.",
  definite: "There's FINITE in deFINITE.",
  queue: "Q and four letters waiting in a queue: q-ueue.",
};
