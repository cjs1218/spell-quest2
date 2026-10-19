// Memory tricks (mnemonics) for tricky words.
//
// source: "known" – a well-known trick found in published school spelling
//                   resources (UK school and local-authority guides, plus a
//                   few widely shared ones)
//         "hazel" – our own idea, for a word with no well-known trick
//
// kind:   "acrostic" – each word's first letter spells the word (or `part` of it)
//         "hidden"   – a smaller word hides inside (`hide`)
//         "letters"  – highlight particular letters (`marks`, every occurrence)
// say:    optional "say it the silly way" spelling voice (e.g. Feb-roo-ar-y):
//         saying a word exactly as it's spelt, a technique used in UK schools.
// picture: a little emoji scene to go with the trick.
//
// Each trick should point at the part children usually get wrong.

export const TRICKS = {
  // ----- Year 1 -----
  said: { kind: "acrostic", text: "Snakes And Insects Dance", picture: "🐍🐜💃", source: "known" },
  come: { kind: "acrostic", text: "Can't Open My Eyes", picture: "😴", source: "known" },
  friend: { kind: "letters", marks: ["fri"], text: "My friend likes fries – we'll be friends to the end!", picture: "🍟🤝", source: "known" },
  here: { kind: "hidden", hide: "here", text: "Here, there and where all have 'here' in them – they're all about places.", picture: "📍", source: "known" },
  there: { kind: "hidden", hide: "here", text: "There's 'here' in there! Here, there and where are all about places.", picture: "📍", source: "known" },
  where: { kind: "hidden", hide: "here", text: "Where has 'here' in it – here, there and where are all about places.", picture: "🗺️", source: "known" },
  they: { kind: "hidden", hide: "the", text: "They starts with 'the'.", picture: "👫", source: "hazel" },
  your: { kind: "hidden", hide: "you", text: "Your starts with 'you' – it's yours!", picture: "🫵", source: "hazel" },

  // ----- Year 2 -----
  because: { kind: "acrostic", text: "Big Elephants Can Always Understand Small Elephants", picture: "🐘🐘", source: "known" },
  people: { kind: "acrostic", text: "People Eat Orange Peel Like Elephants", picture: "🍊🐘", source: "known" },
  could: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "known" },
  should: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "known" },
  would: { kind: "acrostic", part: "ould", text: "O U Lucky Duck!", picture: "🦆🍀", source: "known" },
  beautiful: { kind: "acrostic", part: "beau", text: "Big Elephants Aren't Ugly – they're beautiful!", picture: "🐘🌸", source: "known" },
  eye: { kind: "letters", marks: ["e"], text: "Two e's are two eyes, with a nose (y) in the middle!", picture: "👀", source: "hazel" },
  whole: { kind: "hidden", hide: "hole", text: "A whole doughnut has a hole in it!", picture: "🍩", source: "hazel" },
  busy: { kind: "hidden", hide: "bus", text: "I'm busy on the bus!", picture: "🚌", source: "hazel" },
  many: { kind: "hidden", hide: "any", text: "Many has 'any' inside it.", picture: "🔢", source: "hazel" },
  money: { kind: "hidden", hide: "one", text: "There's 'one' in money – one coin!", picture: "🪙", source: "hazel" },
  clothes: { kind: "hidden", hide: "cloth", text: "Clothes are made of cloth.", picture: "👕🧵", source: "hazel" },
  hour: { kind: "letters", marks: ["h"], text: "The h is silent, so hour sounds just like 'our'. Our hour!", say: "h-our", picture: "⏰", source: "hazel" },

  // ----- Years 3 & 4 -----
  island: { kind: "hidden", hide: "land", text: "An island is land with water all around it.", say: "is-land", picture: "🏝️", source: "known" },
  believe: { kind: "hidden", hide: "lie", text: "Never believe a lie!", say: "bel-eye-eve", picture: "🤥", source: "known" },
  separate: { kind: "hidden", hide: "rat", text: "There's a rat in separate!", say: "sep-a-rat-e", picture: "🐀", source: "known" },
  address: { kind: "letters", marks: ["dd", "ss"], text: "Add a dress to your address – two d's and two s's!", say: "add-dress", picture: "👗📬", source: "known" },
  heard: { kind: "hidden", hide: "ear", text: "You hear with your ear.", picture: "👂", source: "known" },
  heart: { kind: "hidden", hide: "ear", text: "There's an ear in heart – listen to your heart!", picture: "👂❤️", source: "hazel" },
  enough: { kind: "acrostic", text: "Even New Ostriches Use Green Hats", picture: "🐦🎩", source: "known" },
  caught: { kind: "acrostic", text: "Cats Always Use Great Heavy Toilets", picture: "🐱🚽", source: "known" },
  business: { kind: "hidden", hide: "bus", text: "Bus-in-ess: I go to my business on the bus.", say: "bus-in-ess", picture: "🚌💼", source: "known" },
  February: { kind: "letters", marks: ["br"], text: "Brrr! February is cold – don't forget the r after the b.", say: "Feb-roo-ar-y", picture: "🥶❄️", source: "known" },
  height: { kind: "hidden", hide: "eight", text: "There's an eight in height!", picture: "8️⃣📏", source: "hazel" },
  weight: { kind: "hidden", hide: "eight", text: "There's an eight in weight!", picture: "8️⃣⚖️", source: "hazel" },
  eighth: { kind: "hidden", hide: "eight", text: "Eighth is eight with an h on the end.", picture: "8️⃣", source: "hazel" },
  favourite: { kind: "hidden", hide: "our", text: "It's our favourite!", say: "fa-vour-ite", picture: "😍", source: "hazel" },
  library: { kind: "letters", marks: ["r"], text: "Library has two r's: Read and Return!", say: "li-brar-y", picture: "📚", source: "hazel" },
  answer: { kind: "letters", marks: ["w"], text: "The w is silent – say it the silly way to remember it.", say: "an-swer", picture: "🤫", source: "hazel" },
  knowledge: { kind: "hidden", hide: "ledge", text: "Know + ledge: I know about the ledge!", say: "k-now-ledge", picture: "🧗", source: "hazel" },
  woman: { kind: "hidden", hide: "man", text: "One woman, like one man.", picture: "👩", source: "hazel" },
  women: { kind: "hidden", hide: "men", text: "Two women, like two men.", say: "wo-men", picture: "👩👩", source: "hazel" },

  // ----- Years 5 & 6 -----
  necessary: { kind: "letters", marks: ["c", "ss"], text: "One Collar and two Sleeves.", picture: "👔", source: "known" },
  accommodate: { kind: "letters", marks: ["cc", "mm"], text: "Cosy Cottages and Magnificent Mansions – two c's and two m's.", picture: "🏡🏰", source: "known" },
  embarrass: { kind: "letters", marks: ["rr", "ss"], text: "I go Really Red and So Shy when I'm embarrassed.", picture: "😳", source: "known" },
  interrupt: { kind: "letters", marks: ["rr"], text: "It's Really Rude to interrupt!", picture: "🙊", source: "known" },
  rhythm: { kind: "acrostic", text: "Rhythm Helps Your Two Hips Move", picture: "💃🥁", source: "known" },
  parliament: { kind: "hidden", hide: "iam", text: "I am in parliament!", say: "par-li-a-ment", picture: "🏛️🙋", source: "known" },
  familiar: { kind: "hidden", hide: "liar", text: "That liar looks familiar.", say: "fam-i-liar", picture: "🤥", source: "known" },
  environment: { kind: "hidden", hide: "iron", text: "There's iron in environment.", say: "en-vi-ron-ment", picture: "🌍", source: "known" },
  definite: { kind: "hidden", hide: "finite", text: "Definite has 'finite' inside it – so it ends in -ite, not -ate.", say: "de-fin-ite", picture: "✅", source: "known" },
  vegetable: { kind: "hidden", hide: "table", text: "Vege + table: put your vegetables on the table.", say: "veg-e-table", picture: "🥦🍽️", source: "known" },
  government: { kind: "hidden", hide: "govern", text: "The government governs – don't forget the n.", say: "gov-ern-ment", picture: "🏛️", source: "known" },
  stomach: { kind: "letters", marks: ["ach"], text: "My stomach aches! Stom + ach.", say: "sto-match", picture: "🤢", source: "known" },
  vehicle: { kind: "letters", marks: ["h"], text: "There's a hidden h – say it the silly way.", say: "ve-hick-le", picture: "🚗", source: "known" },
  bargain: { kind: "hidden", hide: "gain", text: "A bargain is a gain!", say: "bar-gain", picture: "🏷️", source: "known" },
  secretary: { kind: "hidden", hide: "secret", text: "A secretary keeps a secret.", say: "sec-re-tar-y", picture: "🤫📝", source: "hazel" },
  desperate: { kind: "hidden", hide: "per", text: "Say it the silly way: des-PER-ate – it's per, not par.", say: "des-per-ate", picture: "😫", source: "hazel" },
  temperature: { kind: "hidden", hide: "temper", text: "Don't lose your temper when the temperature's high!", say: "tem-per-a-ture", picture: "🌡️😤", source: "hazel" },
  shoulder: { kind: "hidden", hide: "should", text: "You should carry it on your shoulder.", picture: "🎒", source: "hazel" },
  conscience: { kind: "hidden", hide: "science", text: "There's science in conscience.", say: "con-science", picture: "🔬", source: "hazel" },
  neighbour: { kind: "hidden", hide: "neigh", text: "The horse says “neigh” to our neighbour!", say: "neigh-bour", picture: "🐴🏡", source: "hazel" },
  marvellous: { kind: "letters", marks: ["ll"], text: "Marvellous has two lovely l's.", picture: "✨", source: "hazel" },
  queue: { kind: "letters", marks: ["ueue"], text: "Q, then u-e-u-e: four letters waiting in a queue!", picture: "🧍🧍🧍🧍", source: "hazel" },
  cemetery: { kind: "letters", marks: ["e"], text: "Cemetery has three e's – you get there with e's (ease)!", picture: "🪦", source: "known" },
  forty: { kind: "letters", marks: ["o"], text: "There's no u in forty, even though there is one in four!", picture: "4️⃣0️⃣", source: "known" },
  yacht: { kind: "acrostic", text: "Yellow Ants Can Hold Teacups", picture: "🐜☕", source: "hazel" },
  privilege: { kind: "hidden", hide: "leg", text: "Two i's, then an e – and it's a privilege to have a leg to stand on!", say: "priv-i-leg-e", picture: "🦵", source: "hazel" },
  apparent: { kind: "hidden", hide: "parent", text: "There's a parent in apparent.", say: "ap-par-ent", picture: "👨‍👧", source: "hazel" },
  pronunciation: { kind: "hidden", hide: "nun", text: "There's no 'noun' in pronunciation – there's a nun!", say: "pro-nun-ci-a-tion", picture: "🗣️", source: "known" },
  recommend: { kind: "letters", marks: ["c", "mm"], text: "I recommend one cake and many muffins: one c, two m's.", picture: "🍰🧁🧁", source: "hazel" },
  exaggerate: { kind: "letters", marks: ["gg"], text: "Two g's – a Gigantic Giraffe! (But don't exaggerate.)", picture: "🦒", source: "hazel" },
  lightning: { kind: "hidden", hide: "light", text: "Lightning is light – and too quick to stop for an e!", say: "light-ning", picture: "⚡", source: "hazel" },
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
