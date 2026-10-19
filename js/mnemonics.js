// Memory tricks (mnemonics) for tricky words.
//
// source: "common"    – a trick widely used in UK primary schools (found in
//                       school and local-authority spelling guides)
//         "suggested" – our own idea for a word with no well-known trick
//
// kind:   "acrostic"  – each word's first letter spells the word (or `part` of it)
//         "hidden"    – a smaller word hides inside (`hide`)
//         "letters"   – highlight particular letters (`marks`, every occurrence)
// picture: a little emoji scene to go with the trick.

export const TRICKS = {
  // ----- Year 1 -----
  said: { kind: "acrostic", text: "Snakes And Insects Dance", picture: "🐍🐜💃", source: "common" },
  come: { kind: "acrostic", text: "Can't Open My Eyes", picture: "😴", source: "common" },
  friend: { kind: "acrostic", text: "Fred Rushed In Eating Nine Doughnuts", picture: "🏃‍♂️🍩", source: "common" },
  here: { kind: "hidden", hide: "here", text: "Here, there and where all have 'here' in them – they're all about places.", picture: "📍", source: "common" },
  there: { kind: "hidden", hide: "here", text: "There's 'here' in there! Here, there and where are all about places.", picture: "📍", source: "common" },
  where: { kind: "hidden", hide: "here", text: "Where has 'here' in it – here, there and where are all about places.", picture: "🗺️", source: "common" },
  they: { kind: "hidden", hide: "the", text: "They starts with 'the'.", picture: "👫", source: "suggested" },
  your: { kind: "hidden", hide: "you", text: "Your starts with 'you' – it's yours!", picture: "🫵", source: "suggested" },

  // ----- Year 2 -----
  because: { kind: "acrostic", text: "Big Elephants Can Always Understand Small Elephants", picture: "🐘🐘", source: "common" },
  people: { kind: "acrostic", text: "People Eat Orange Peel Like Elephants", picture: "🍊🐘", source: "common" },
  could: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "common" },
  should: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "common" },
  would: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "common" },
  beautiful: { kind: "acrostic", part: "beau", text: "Big Elephants Are Usually beautiful", picture: "🐘🌸", source: "suggested" },
  eye: { kind: "letters", marks: ["e"], text: "Two e's are two eyes, with a nose (y) in the middle!", picture: "👀", source: "suggested" },
  whole: { kind: "hidden", hide: "hole", text: "A whole doughnut has a hole in it!", picture: "🍩", source: "suggested" },
  busy: { kind: "hidden", hide: "bus", text: "I'm busy on the bus!", picture: "🚌", source: "suggested" },
  many: { kind: "hidden", hide: "any", text: "Many has 'any' inside it.", picture: "🔢", source: "suggested" },
  money: { kind: "hidden", hide: "one", text: "There's 'one' in money – one coin!", picture: "🪙", source: "suggested" },
  clothes: { kind: "hidden", hide: "cloth", text: "Clothes are made of cloth.", picture: "👕🧵", source: "suggested" },
  hour: { kind: "letters", marks: ["h"], text: "The h is silent, so hour sounds just like 'our'. Our hour!", picture: "⏰", source: "suggested" },

  // ----- Years 3 & 4 -----
  island: { kind: "hidden", hide: "land", text: "An island is land with water all around it.", picture: "🏝️", source: "common" },
  believe: { kind: "hidden", hide: "lie", text: "Never believe a lie!", picture: "🤥", source: "common" },
  separate: { kind: "hidden", hide: "rat", text: "There's a rat in separate!", picture: "🐀", source: "common" },
  address: { kind: "hidden", hide: "dress", text: "I saw an ad for a dress at this address.", picture: "👗📬", source: "common" },
  heard: { kind: "hidden", hide: "ear", text: "You hear with your ear.", picture: "👂", source: "common" },
  heart: { kind: "hidden", hide: "ear", text: "There's an ear in heart – listen to your heart!", picture: "👂❤️", source: "suggested" },
  enough: { kind: "acrostic", text: "Even New Ostriches Use Green Hats", picture: "🐦🎩", source: "common" },
  height: { kind: "hidden", hide: "eight", text: "There's an eight in height!", picture: "8️⃣📏", source: "suggested" },
  weight: { kind: "hidden", hide: "eight", text: "There's an eight in weight!", picture: "8️⃣⚖️", source: "suggested" },
  eighth: { kind: "hidden", hide: "eight", text: "Eighth is eight with an h on the end.", picture: "8️⃣", source: "suggested" },
  business: { kind: "hidden", hide: "bus", text: "I go to my business on the bus.", picture: "🚌💼", source: "suggested" },
  February: { kind: "hidden", hide: "ru", text: "Feb-RU-ary: are you (R U) ready for February?", picture: "❄️📅", source: "suggested" },
  favourite: { kind: "hidden", hide: "our", text: "It's our favourite!", picture: "😍", source: "suggested" },
  library: { kind: "letters", marks: ["r"], text: "Library has two r's: Read and Return!", picture: "📚", source: "suggested" },
  answer: { kind: "letters", marks: ["w"], text: "The w is silent – say it the silly way: an-S-W-er.", picture: "🤫", source: "suggested" },
  knowledge: { kind: "hidden", hide: "ledge", text: "Know + ledge: I know about the ledge!", picture: "🧗", source: "suggested" },
  woman: { kind: "hidden", hide: "man", text: "One woman, like one man.", picture: "👩", source: "suggested" },
  women: { kind: "hidden", hide: "men", text: "Two women, like two men.", picture: "👩👩", source: "suggested" },

  // ----- Years 5 & 6 -----
  necessary: { kind: "letters", marks: ["c", "ss"], text: "One Collar and two Sleeves.", picture: "👔", source: "common" },
  accommodate: { kind: "letters", marks: ["cc", "mm"], text: "It's big enough to accommodate two Cots and two Mattresses.", picture: "🛏️🛏️", source: "common" },
  embarrass: { kind: "letters", marks: ["rr", "ss"], text: "I go Really Red and So Shy when I'm embarrassed.", picture: "😳", source: "common" },
  rhythm: { kind: "acrostic", text: "Rhythm Helps Your Two Hips Move", picture: "💃🥁", source: "common" },
  parliament: { kind: "hidden", hide: "iam", text: "I am in parliament!", picture: "🏛️🙋", source: "common" },
  familiar: { kind: "hidden", hide: "liar", text: "That liar looks familiar.", picture: "🤥", source: "common" },
  environment: { kind: "hidden", hide: "iron", text: "There's iron in environment.", picture: "🌍", source: "common" },
  secretary: { kind: "hidden", hide: "secret", text: "A secretary keeps a secret.", picture: "🤫📝", source: "suggested" },
  definite: { kind: "hidden", hide: "fin", text: "De-FIN-ite: a fish's fin is definitely there!", picture: "🐟", source: "suggested" },
  desperate: { kind: "hidden", hide: "rat", text: "A desperate rat! There's a rat in desperate too.", picture: "🐀", source: "suggested" },
  government: { kind: "hidden", hide: "govern", text: "The government governs the country.", picture: "🏛️", source: "suggested" },
  vegetable: { kind: "hidden", hide: "table", text: "Put your vegetables on the table.", picture: "🥦🍽️", source: "suggested" },
  temperature: { kind: "hidden", hide: "temper", text: "Don't lose your temper when the temperature's high!", picture: "🌡️😤", source: "suggested" },
  shoulder: { kind: "hidden", hide: "should", text: "You should carry it on your shoulder.", picture: "🎒", source: "suggested" },
  conscience: { kind: "hidden", hide: "science", text: "There's science in conscience.", picture: "🔬", source: "suggested" },
  neighbour: { kind: "hidden", hide: "our", text: "Our neighbour!", picture: "🏘️", source: "suggested" },
  marvellous: { kind: "letters", marks: ["ll"], text: "Marvellous has two lovely l's.", picture: "✨", source: "suggested" },
  queue: { kind: "letters", marks: ["ueue"], text: "Q, then u-e-u-e: four letters waiting in a queue!", picture: "🧍🧍🧍🧍", source: "suggested" },
  cemetery: { kind: "letters", marks: ["e"], text: "Cemetery has three e's – you get there with e's (ease)!", picture: "🪦", source: "suggested" },
  forty: { kind: "letters", marks: ["o"], text: "There's no u in forty, even though there is one in four!", picture: "4️⃣0️⃣", source: "suggested" },
  yacht: { kind: "acrostic", text: "Yellow Ants Can Hold Teacups", picture: "🐜☕", source: "suggested" },
  privilege: { kind: "hidden", hide: "leg", text: "It's a privilege to have a leg to stand on!", picture: "🦵", source: "suggested" },
};

export const trick = (word) => TRICKS[word] || null;
export const trickText = (word) => TRICKS[word]?.text || null;

/**
 * For each letter of the word, whether the trick highlights it.
 * Used to light up the hidden word, the marked letters or the acrostic letters.
 */
export function highlightMask(word) {
  const t = TRICKS[word];
  const mask = Array(word.length).fill(false);
  if (!t) return mask;
  const lower = word.toLowerCase();
  if (t.kind === "hidden") {
    const at = lower.indexOf(t.hide.toLowerCase());
    if (at >= 0) for (let i = at; i < at + t.hide.length; i++) mask[i] = true;
  } else if (t.kind === "letters") {
    for (const m of t.marks) {
      let from = 0, at;
      while ((at = lower.indexOf(m, from)) >= 0) {
        for (let i = at; i < at + m.length; i++) mask[i] = true;
        from = at + m.length;
      }
    }
  } else if (t.kind === "acrostic" && t.part) {
    // Only light up part of the word (e.g. "ould"); a whole-word acrostic is shown in the card instead.
    const part = t.part.toLowerCase();
    const at = lower.indexOf(part);
    if (at >= 0) for (let i = at; i < at + part.length; i++) mask[i] = true;
  }
  return mask;
}

/** The acrostic's words, each with its first letter separated out. */
export function acrosticWords(word) {
  const t = TRICKS[word];
  if (t?.kind !== "acrostic") return [];
  const n = (t.part || word).length;
  return t.text.replace(/[!.,]/g, "").split(/\s+/).slice(0, n).map((w) => ({ first: w[0], rest: w.slice(1) }));
}
