// National Curriculum (England) common exception words (Years 1 and 2) and
// statutory spelling lists (Years 3–6), grouped into
// spelling families so children learn by pattern rather than by random list.
// Each family has a short child-friendly tip. Every statutory word appears
// in exactly one family (checked by tools/check-words.mjs).

export const YEAR_GROUPS = {
  y1: {
    label: "Year 1",
    families: [
      {
        id: "y1-tiny",
        name: "Little words that trick you",
        tip: "These words are short but don't sound how they look. Say them the 'silly' way: sa-ID, o-F.",
        words: ["the", "a", "do", "to", "today", "of", "said", "says"],
      },
      {
        id: "y1-was",
        name: "is, was and were",
        tip: "In these words the s often says 'z': hiZ, haZ, waZ.",
        words: ["is", "his", "has", "was", "were", "are"],
      },
      {
        id: "y1-people",
        name: "Me, you and them",
        tip: "Capital I is always tall when it means you!",
        words: ["I", "you", "your", "they", "our"],
      },
      {
        id: "y1-e",
        name: "e says its name",
        tip: "At the end of a little word, e says 'ee': be, he, me, she, we.",
        words: ["be", "he", "me", "she", "we"],
      },
      {
        id: "y1-o-y",
        name: "o and y at the end",
        tip: "o at the end says 'oh': no, go, so. y at the end says 'eye': by, my.",
        words: ["no", "go", "so", "by", "my"],
      },
      {
        id: "y1-here",
        name: "here, there, where",
        tip: "All three have 'here' inside them – here is a place, so are there and where!",
        words: ["here", "there", "where"],
      },
      {
        id: "y1-o-u",
        name: "o that says 'u'",
        tip: "In these words o says 'u' as in up: l-o-ve, c-o-me.",
        words: ["love", "come", "some", "one", "once"],
      },
      {
        id: "y1-u-oo",
        name: "u that says 'oo'",
        tip: "Push, pull, put – these are all things you do with your hands!",
        words: ["put", "push", "pull", "full"],
      },
      {
        id: "y1-tricky",
        name: "Tricky words",
        tip: "Draw a picture clue for each one.",
        words: ["ask", "friend", "school", "house"],
      },
    ],
  },
  y2: {
    label: "Year 2",
    families: [
      {
        id: "y2-oor",
        name: "'oor' says 'or'",
        tip: "Open the door, walk on the floor.",
        words: ["door", "floor", "poor"],
      },
      {
        id: "y2-i",
        name: "i says its name",
        tip: "Before nd or ld, i often says 'eye': kind, wild. But watch out for children!",
        words: ["find", "kind", "mind", "behind", "child", "children", "wild", "climb"],
      },
      {
        id: "y2-o",
        name: "o says its name",
        tip: "Before ld, st or th, o often says 'oh': old, most, both.",
        words: ["old", "cold", "gold", "hold", "told", "most", "only", "both"],
      },
      {
        id: "y2-e-ea",
        name: "e and ea surprises",
        tip: "ea usually says 'ee', but in great, break and steak it says 'ay'.",
        words: ["every", "everybody", "even", "great", "break", "steak"],
      },
      {
        id: "y2-a-ar",
        name: "a in fast, grass and path",
        tip: "Some people say 'ar' in these words and some say 'a' – however you say it, you just write a.",
        words: ["after", "fast", "last", "past", "father", "class", "grass", "pass", "plant", "path", "bath"],
      },
      {
        id: "y2-o-oo",
        name: "o that says 'oo'",
        tip: "Move, prove, improve – they all end the same way.",
        words: ["move", "prove", "improve", "who"],
      },
      {
        id: "y2-ould",
        name: "could, should, would",
        tip: "O U Lucky Duck! All three end in -ould.",
        words: ["could", "should", "would"],
      },
      {
        id: "y2-s-sh",
        name: "s that says 'sh'",
        tip: "Are you sure there's sugar in it? Both start with s that sounds like 'sh'.",
        words: ["sure", "sugar"],
      },
      {
        id: "y2-tricky-a",
        name: "Tricky words – set A",
        tip: "Make up a silly sentence for each one.",
        words: ["because", "pretty", "beautiful", "eye", "hour", "any", "many", "whole"],
      },
      {
        id: "y2-tricky-b",
        name: "Tricky words – set B",
        tip: "Chop them into beats and say each part: peo-ple, wa-ter.",
        words: ["clothes", "busy", "people", "water", "again", "half", "money", "parents", "Christmas", "Mr", "Mrs"],
      },
    ],
  },
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

// Memory tricks live in mnemonics.js.
