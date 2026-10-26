// Rewards that keep children coming back, all tied to spelling progress:
//  - garden AREAS that open as more words become fully grown, each with a shop
//  - VISITORS: animals that come to the garden for learning milestones
//    (earned, never bought), collected in a sticker book
//  - Hazel's WARDROBE: hats, glasses, scarves and things to hold
// Nothing is random, nothing expires, and nothing is lost by missing a day.

import { getGroups, allWords } from "./groups.js";
import { YEAR_GROUPS } from "./words.js";
import {
  wordState, MASTERED_BOX, daysPractised, comebacks, stats, visitorsEarned, addVisitor,
  areasSeen, markAreaSeen,
} from "./store.js";

// ---------- garden areas ----------

export const AREAS = [
  {
    id: "flowers", name: "Flower garden", icon: "🌷", need: 0, sky: "#e8f5e9", ground: "#a1887f",
    items: [], // the flower garden uses the original flower and decoration shop
  },
  {
    id: "meadow", name: "Meadow", icon: "🌼", need: 8, sky: "#fff8e1", ground: "#9ccc65",
    items: [
      ["🌾", "Wheat", 6], ["🪵", "Log", 6], ["🐇", "Rabbit", 10], ["🐑", "Sheep", 12], ["🐿️", "Squirrel", 12],
      ["🐄", "Cow", 15], ["🦔", "Hedgehog friend", 15], ["🧺", "Picnic basket", 18], ["🪁", "Kite", 20],
      ["🐎", "Horse", 25], ["🛖", "Hut", 30], ["🌞", "Sunshine", 35],
    ],
  },
  {
    id: "pond", name: "Pond", icon: "🦆", need: 20, sky: "#e1f5fe", ground: "#4fc3f7",
    items: [
      ["🐟", "Fish", 8], ["🦆", "Duck", 10], ["🪷", "Water lily", 10], ["🐠", "Bright fish", 12],
      ["🐢", "Turtle", 15], ["🛶", "Canoe", 18], ["🦫", "Beaver", 20], ["🦢", "Swan", 20],
      ["🦩", "Flamingo", 22], ["⛵", "Sailing boat", 25], ["🌉", "Bridge", 30], ["⛲", "Big fountain", 35],
    ],
  },
  {
    id: "woodland", name: "Woodland", icon: "🌲", need: 35, sky: "#e8f5e9", ground: "#558b2f",
    items: [
      ["🍂", "Autumn leaves", 6], ["🌲", "Pine tree", 10], ["🦊", "Fox", 15], ["🦉", "Owl", 15],
      ["🦡", "Badger", 18], ["🦌", "Deer", 20], ["🐗", "Wild boar", 20], ["🏕️", "Tent", 25],
      ["🐻", "Bear", 25], ["🐺", "Wolf", 25], ["🔥", "Campfire", 30], ["🏰", "Castle", 50],
    ],
  },
  {
    id: "seaside", name: "Seaside", icon: "🏖️", need: 55, sky: "#e0f7fa", ground: "#ffe082",
    items: [
      ["🐚", "Shell", 6], ["🪣", "Bucket", 8], ["🦀", "Crab", 10], ["🌊", "Wave", 10], ["⛱️", "Beach umbrella", 12],
      ["🐙", "Octopus", 15], ["🦞", "Lobster", 15], ["🦭", "Seal", 18], ["🏄", "Surfer", 20],
      ["🐬", "Dolphin", 22], ["🐳", "Whale", 30], ["🚢", "Ship", 35],
    ],
  },
  {
    id: "moon", name: "Moon garden", icon: "🚀", need: 80, sky: "#1a237e", ground: "#9e9e9e",
    items: [
      ["⭐", "Star", 10], ["🌙", "Moon", 15], ["🌠", "Shooting star", 18], ["👽", "Alien", 20],
      ["☄️", "Comet", 22], ["🪐", "Planet", 25], ["🔭", "Telescope", 25], ["🛰️", "Satellite", 28],
      ["🛸", "Flying saucer", 30], ["👩‍🚀", "Astronaut", 30], ["🚀", "Rocket", 35], ["🌌", "Galaxy", 40],
    ],
  },
].map((a) => ({ ...a, items: a.items.map(([item, name, cost]) => ({ item, name, cost })) }));

// ---------- Hazel's wardrobe ----------

export const WARDROBE = {
  hat: { label: "Hats", items: [["🎀", "Bow", 8], ["🧢", "Cap", 10], ["🌸", "Flower", 10], ["🎩", "Top hat", 15], ["🎓", "Graduation cap", 30], ["👑", "Crown", 40]] },
  face: { label: "Glasses", items: [["👓", "Glasses", 10], ["🕶️", "Sunglasses", 15]] },
  neck: { label: "Scarves and medals", items: [["🧣", "Scarf", 12], ["🏅", "Medal", 25]] },
  held: { label: "Things to hold", items: [["🎈", "Balloon", 8], ["🍭", "Lollipop", 10], ["🌻", "Sunflower", 10], ["☂️", "Umbrella", 12], ["📚", "Books", 15], ["🪄", "Magic wand", 20]] },
};
for (const part of Object.values(WARDROBE)) part.items = part.items.map(([item, name, cost]) => ({ item, name, cost }));

// ---------- progress used by areas and visitors ----------

export function progressSnapshot() {
  const groups = getGroups();
  const seen = new Set();
  let grown = 0;
  for (const g of Object.values(groups)) for (const w of allWords(g)) {
    if (seen.has(w)) continue;
    seen.add(w);
    if (wordState(w).box >= MASTERED_BOX) grown += 1;
  }
  const families = Object.values(groups).flatMap((g) => g.families);
  const familiesComplete = families.filter((f) => f.words.length && f.words.every((w) => wordState(w).box >= MASTERED_BOX)).length;
  const familiesWithFlower = families.filter((f) => f.words.some((w) => wordState(w).box >= MASTERED_BOX)).length;
  const yearComplete = Object.values(YEAR_GROUPS).some((g) => allWords(g).every((w) => wordState(w).box >= MASTERED_BOX));
  const schoolGrown = groups.school ? allWords(groups.school).filter((w) => wordState(w).box >= MASTERED_BOX).length : 0;
  const practised = [...seen].some((w) => wordState(w).seen > 0);
  return { grown, familiesComplete, familiesWithFlower, yearComplete, schoolGrown, practised, days: daysPractised(), comebacks: comebacks(), ...stats() };
}

export const areaOpen = (area, p = progressSnapshot()) => p.grown >= area.need;

// ---------- visitors (earned, never bought) ----------

export const VISITORS = [
  { id: "snail", icon: "🐌", name: "Sid the snail", how: "Practise your first word", test: (p) => p.practised },
  { id: "bee", icon: "🐝", name: "Buzz the bee", how: "Grow your first flower", test: (p) => p.grown >= 1 },
  { id: "ladybird", icon: "🐞", name: "Dotty the ladybird", how: "Practise on 3 different days", test: (p) => p.days >= 3 },
  { id: "frog", icon: "🐸", name: "Hoppy the frog", how: "Play 5 word games", test: (p) => (p.games || 0) >= 5 },
  { id: "squirrel", icon: "🐿️", name: "Nutty the squirrel", how: "Bring back a word you found tricky", test: (p) => p.comebacks >= 1 },
  { id: "robin", icon: "🐦", name: "Ruby the robin", how: "Practise on 7 different days", test: (p) => p.days >= 7 },
  { id: "peacock", icon: "🦚", name: "Percy the peacock", how: "Do rainbow writing for 5 words", test: (p) => (p.rainbow || 0) >= 5 },
  { id: "butterfly", icon: "🦋", name: "Flutter the butterfly", how: "Grow every word in a spelling family", test: (p) => p.familiesComplete >= 1 },
  { id: "tortoise", icon: "🐢", name: "Toby the tortoise", how: "Get every word right in 3 practice sessions", test: (p) => (p.perfect || 0) >= 3 },
  { id: "dolphin", icon: "🐬", name: "Splash the dolphin", how: "Spell 8 words right in a row", test: (p) => (p.bestStreak || 0) >= 8 },
  { id: "giraffe", icon: "🦒", name: "Gerry the giraffe", how: "Spell a word with 10 or more letters", test: (p) => (p.longestWord || 0) >= 10 },
  { id: "penguin", icon: "🐧", name: "Pip the penguin", how: "Finish 3 weekly missions", test: (p) => (p.missions || 0) >= 3 },
  { id: "rabbit", icon: "🐇", name: "Bella the bunny", how: "Grow 25 flowers", test: (p) => p.grown >= 25 },
  { id: "parrot", icon: "🦜", name: "Polly the parrot", how: "Grow 5 words from your school list", test: (p) => p.schoolGrown >= 5 },
  { id: "octopus", icon: "🐙", name: "Ollie the octopus", how: "Grow a flower in 8 different spelling families", test: (p) => p.familiesWithFlower >= 8 },
  { id: "hedgehog", icon: "🦔", name: "Cousin Hector", how: "Bring back 5 words you found tricky", test: (p) => p.comebacks >= 5 },
  { id: "owl", icon: "🦉", name: "Professor Owl", how: "Practise on 20 different days", test: (p) => p.days >= 20 },
  { id: "fox", icon: "🦊", name: "Felix the fox", how: "Grow every word in 5 spelling families", test: (p) => p.familiesComplete >= 5 },
  { id: "unicorn", icon: "🦄", name: "Sparkle the unicorn", how: "Grow 100 flowers", test: (p) => p.grown >= 100 },
  { id: "dragon", icon: "🐉", name: "Ember the dragon", how: "Grow every word in a whole year group", test: (p) => p.yearComplete },
];

/**
 * Award any visitors and garden areas newly earned. Returns what's new, so the
 * end of a practice session or game can celebrate it.
 */
export function checkRewards() {
  const p = progressSnapshot();
  const have = visitorsEarned();
  const visitors = VISITORS.filter((v) => !have[v.id] && v.test(p));
  visitors.forEach((v) => addVisitor(v.id));
  const areas = AREAS.filter((a) => a.need > 0 && areaOpen(a, p) && !areasSeen().includes(a.id));
  areas.forEach((a) => markAreaSeen(a.id));
  return { visitors, areas };
}

/** A celebration card for new rewards (empty string if none). */
export function rewardsHtml({ visitors, areas }, { link = true } = {}) {
  if (!visitors.length && !areas.length) return "";
  return `<div class="reward-card card" role="status">
    ${areas.map((a) => `<p class="reward-line"><span class="reward-icon" aria-hidden="true">${a.icon}</span><span><strong>New place in your garden: the ${a.name}!</strong><br><small>It has its own shop to explore.</small></span></p>`).join("")}
    ${visitors.map((v) => `<p class="reward-line"><span class="reward-icon" aria-hidden="true">${v.icon}</span><span><strong>${v.name} has come to visit!</strong><br><small>Because you did this: ${v.how.toLowerCase()}.</small></span></p>`).join("")}
    ${link ? `<a class="btn" href="#/garden">🏡 Go to my garden</a>` : ""}
  </div>`;
}

/** Words to say aloud for new rewards. */
export function rewardsSpeech({ visitors, areas }) {
  const parts = [];
  for (const a of areas) parts.push(`A new place has opened in your garden: the ${a.name}!`);
  for (const v of visitors) parts.push(`${v.name} has come to visit!`);
  return parts.join(" ");
}
