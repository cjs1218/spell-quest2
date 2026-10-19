// The child's garden: every word they've started grows here, and seeds
// earned from practice buy new flower types and decorations.

import { getGroups, allWords } from "./groups.js";
import { wordState, MASTERED_BOX, seeds, spendSeeds, owned, ownItem, garden, setGarden } from "./store.js";
import { companionHtml } from "./companion.js";
import { app, h, on, header, PLANTS, toast, keepScroll } from "./ui.js";
import { say } from "./speech.js";

export const FLOWERS = [
  { item: "🌻", name: "Sunflower", cost: 0 },
  { item: "🌷", name: "Tulip", cost: 10 },
  { item: "🌼", name: "Daisy", cost: 10 },
  { item: "🌸", name: "Blossom", cost: 15 },
  { item: "🌹", name: "Rose", cost: 15 },
  { item: "🪻", name: "Lavender", cost: 20 },
  { item: "🌺", name: "Hibiscus", cost: 20 },
];

export const DECOR = [
  { item: "🪨", name: "Pebble", cost: 3 },
  { item: "🐌", name: "Snail", cost: 4 },
  { item: "🐝", name: "Bee", cost: 5 },
  { item: "🐞", name: "Ladybird", cost: 5 },
  { item: "🍄", name: "Mushroom", cost: 6 },
  { item: "🦋", name: "Butterfly", cost: 8 },
  { item: "🐸", name: "Frog", cost: 10 },
  { item: "🪺", name: "Bird's nest", cost: 12 },
  { item: "🌳", name: "Tree", cost: 15 },
  { item: "🏡", name: "Cottage", cost: 25 },
  { item: "⛲", name: "Fountain", cost: 30 },
  { item: "🌈", name: "Rainbow", cost: 40 },
];

const plantFor = (box) => (box >= MASTERED_BOX ? garden().flower : PLANTS[box]);

function gardenPlants() {
  const seen = new Set();
  const plants = [];
  for (const g of Object.values(getGroups())) {
    for (const w of allWords(g)) {
      if (seen.has(w)) continue;
      seen.add(w);
      const box = wordState(w).box;
      if (box > 0) plants.push({ word: w, box });
    }
  }
  return plants.sort((a, b) => b.box - a.box);
}

export function gardenScreen() {
  const plants = gardenPlants();
  const decor = garden().decor;
  const grown = plants.filter((p) => p.box >= MASTERED_BOX).length;
  // Decorations are spread between the plants.
  const cells = plants.map((p) => `<button class="plant" data-word="${p.word}" aria-label="${p.word}">${plantFor(p.box)}</button>`);
  decor.forEach((d, i) => {
    const at = Math.min(cells.length, Math.round(((i + 1) * (cells.length + 1)) / (decor.length + 1)));
    cells.splice(at, 0, `<span class="decor" aria-hidden="true">${d}</span>`);
  });

  const shopItem = (kind, x) => {
    const has = owned()[kind].includes(x.item);
    const placed = kind === "flowers" ? garden().flower === x.item : decor.includes(x.item);
    const label = kind === "flowers"
      ? has ? (placed ? "Using" : "Use") : `🌰 ${x.cost}`
      : has ? (placed ? "Put away" : "Place") : `🌰 ${x.cost}`;
    return `<button class="shop-item ${placed ? "placed" : ""}" data-kind="${kind}" data-item="${x.item}" data-cost="${x.cost}"
      ${!has && seeds() < x.cost ? "aria-disabled=true" : ""}>
      <span class="shop-emoji" aria-hidden="true">${x.item}</span><span>${x.name}</span><small>${label}</small></button>`;
  };

  app.innerHTML = h`
    ${header("#/", "My garden", `<span class="seed-pill">🌰 ${seeds()}</span>`)}
    <div class="garden-plot card" aria-label="${plants.length} plants, ${grown} fully grown">
      ${cells.length ? cells.join("") : `<p class="muted">Your garden is waiting! Practise some words to plant your first seeds.</p>`}
    </div>
    <p class="muted center">${grown} flowers fully grown · ${plants.length - grown} still growing · tap a plant to hear its word</p>
    ${companionHtml(seeds() >= 3 ? "You've got seeds to spend! What shall we add?" : "Practise words and play games to earn seeds 🌰", { custom: true })}
    <h2>Flowers</h2>
    <p class="muted">Choose what your fully grown words look like.</p>
    <div class="shop">${FLOWERS.map((f) => shopItem("flowers", f)).join("")}</div>
    <h2>Decorations</h2>
    <div class="shop">${DECOR.map((d) => shopItem("decor", d)).join("")}</div>`;

  on(".plant", "click", (e) => say(e.currentTarget.dataset.word));
  on(".shop-item", "click", (e) => {
    const { kind, item, cost } = e.currentTarget.dataset;
    const has = owned()[kind].includes(item);
    if (!has) {
      if (!spendSeeds(Number(cost))) {
        toast(`You need ${Number(cost) - seeds()} more 🌰`);
        return;
      }
      ownItem(kind, item);
      toast(`New ${kind === "flowers" ? "flower" : "decoration"}! ${item}`);
    }
    if (kind === "flowers") setGarden({ flower: item });
    else {
      const d = garden().decor;
      setGarden({ decor: d.includes(item) && has ? d.filter((x) => x !== item) : [...new Set([...d, item])] });
    }
    keepScroll(gardenScreen);
  });
}
