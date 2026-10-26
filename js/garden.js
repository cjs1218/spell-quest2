// The child's garden. Every word they've started grows in the flower garden;
// more areas (meadow, pond, woodland, seaside, moon) open as words become
// fully grown, each with its own shop. Visitors arrive for learning
// milestones, and Hazel can be dressed up from her wardrobe.

import { getGroups, allWords } from "./groups.js";
import {
  wordState, MASTERED_BOX, seeds, spendSeeds, owned, ownItem, garden, setGarden,
  placedIn, setPlaced, hazelOutfit, setHazel, visitorsEarned, layoutOf, setLayoutItem, resetLayout,
} from "./store.js";
import { AREAS, WARDROBE, VISITORS, progressSnapshot, areaOpen, checkRewards } from "./rewards.js";
import { companionHtml, hazelHtml } from "./companion.js";
import { app, h, esc, on, header, PLANTS, toast, keepScroll } from "./ui.js";
import { say, cheer } from "./speech.js";
import { sound } from "./sounds.js";

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

// What the child is looking at, kept while they shop.
// arranging: moving things around the garden; selected: the thing they tapped.
let view = { area: "flowers", tab: "shop", arranging: false, selected: null };

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

// Things the child can move around in an area: placed decorations, plus
// visitors in the flower garden.
function sceneItems(area) {
  const names = Object.fromEntries([...DECOR, ...area.items].map((x) => [x.item, x.name]));
  const items = placedIn(area.id).map((d) => ({ key: d, icon: d, name: names[d] || "decoration" }));
  if (area.id === "flowers") {
    for (const v of VISITORS) if (visitorsEarned()[v.id]) items.push({ key: `v:${v.id}`, icon: v.icon, name: v.name, visitor: true });
  }
  return items;
}

// Where something goes before the child has moved it: spread out, never random.
function defaultSpot(i) {
  return { x: 8 + ((i * 0.618 + 0.31) % 1) * 84, y: 18 + ((i * 0.382 + 0.55) % 1) * 68, s: 1, f: false, z: 0 };
}
const spotOf = (area, item, i) => ({ ...defaultSpot(i), ...(layoutOf(area.id)[item.key] || {}) });
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function plotHtml(area, p) {
  if (!areaOpen(area, p)) {
    const left = area.need - p.grown;
    return h`
      <div class="garden-plot card locked" style="--sky:${area.sky};--ground:${area.ground}">
        <p class="locked-msg"><span class="lock-icon" aria-hidden="true">🔒${area.icon}</span>
          <strong>The ${esc(area.name)} opens when you have ${area.need} fully grown flowers.</strong>
          <span>Just ${left} more to grow!</span></p>
        <div class="meter" aria-hidden="true"><span style="width:${Math.min(100, (p.grown / area.need) * 100)}%"></span></div>
      </div>`;
  }
  const items = sceneItems(area);
  const things = items.map((it, i) => {
    const at = spotOf(area, it, i);
    const style = `left:${at.x}%;top:${at.y}%;z-index:${2 + (at.z || 0)};--s:${at.s || 1};--f:${at.f ? -1 : 1}`;
    return view.arranging
      ? `<button type="button" class="decor movable ${it.visitor ? "visitor" : ""} ${view.selected === it.key ? "selected" : ""}" data-key="${esc(it.key)}"
          style="${style}" aria-label="Move the ${esc(it.name)}" aria-pressed="${view.selected === it.key}"><span>${it.icon}</span></button>`
      : `<span class="decor ${it.visitor ? "visitor" : ""}" style="${style}" title="${esc(it.name)}" aria-hidden="true"><span>${it.icon}</span></span>`;
  }).join("");

  let bed = "";
  if (area.id === "flowers") {
    const plants = gardenPlants();
    bed = plants.length
      ? `<div class="bed">${plants.map((pl) => `<button class="plant" data-word="${esc(pl.word)}" aria-label="${esc(pl.word)}" ${view.arranging ? 'tabindex="-1"' : ""}>${plantFor(pl.box)}</button>`).join("")}</div>`
      : `<p class="muted bed-empty">Your garden is waiting! Practise some words to plant your first seeds.</p>`;
  } else if (!items.length) {
    bed = `<p class="muted area-empty">Welcome to the ${esc(area.name)}! Buy things in the shop below to fill it.</p>`;
  }
  return `<div class="garden-plot card scene area-${area.id} ${view.arranging ? "arranging" : ""}" id="scene" style="--sky:${area.sky};--ground:${area.ground}">
    ${bed}${things}</div>`;
}

function arrangeBarHtml(area, p) {
  if (!areaOpen(area, p) || !sceneItems(area).length) return "";
  if (!view.arranging) {
    return `<div class="arrange-bar"><button class="btn" id="arrange-start">✋ Move things around</button></div>`;
  }
  const sel = view.selected;
  return h`
    <div class="arrange-bar arranging card speakable" role="group" aria-label="Arrange your garden">
      <p class="arrange-hint"><span class="say-text">${sel
        ? "Drag it, or tap where it should go. You can make it bigger, smaller or turn it round."
        : "Drag things to where you want them. Or tap one, then tap where it should go."}</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p>
      <div class="arrange-tools">
        <button class="btn small" data-tool="smaller" ${sel ? "" : "disabled"} aria-label="Make it smaller">➖ Smaller</button>
        <button class="btn small" data-tool="bigger" ${sel ? "" : "disabled"} aria-label="Make it bigger">➕ Bigger</button>
        <button class="btn small" data-tool="flip" ${sel ? "" : "disabled"} aria-label="Turn it round">↔️ Turn round</button>
        <button class="btn small" data-tool="tidy" aria-label="Put everything back where it started">🧹 Start again</button>
        <button class="btn primary small" id="arrange-done">✅ Done</button>
      </div>
    </div>`;
}

function shopButton(kind, x, { owned: has, placed, area }) {
  const label = kind === "flowers"
    ? has ? (placed ? "Using" : "Use") : `🌰 ${x.cost}`
    : has ? (placed ? "Put away" : "Place") : `🌰 ${x.cost}`;
  return `<button class="shop-item ${placed ? "placed" : ""}" data-kind="${kind}" data-item="${x.item}" data-cost="${x.cost}" data-area="${area || ""}"
    ${!has && seeds() < x.cost ? "aria-disabled=true" : ""}>
    <span class="shop-emoji" aria-hidden="true">${x.item}</span><span>${esc(x.name)}</span><small>${label}</small></button>`;
}

function shopHtml(area, p) {
  if (!areaOpen(area, p)) {
    return `<p class="muted">Here's what you'll find in the ${esc(area.name)}:</p>
      <div class="shop preview">${area.items.map((x) => `<span class="shop-item"><span class="shop-emoji" aria-hidden="true">${x.item}</span><span>${esc(x.name)}</span></span>`).join("")}</div>`;
  }
  if (area.id === "flowers") {
    const decor = placedIn("flowers");
    return h`
      <h2>Flowers</h2>
      <p class="muted">Choose what your fully grown words look like.</p>
      <div class="shop">${FLOWERS.map((f) => shopButton("flowers", f, { owned: owned().flowers.includes(f.item), placed: garden().flower === f.item, area: "flowers" })).join("")}</div>
      <h2>Decorations</h2>
      <div class="shop">${DECOR.map((d) => shopButton("decor", d, { owned: owned().decor.includes(d.item), placed: decor.includes(d.item), area: "flowers" })).join("")}</div>`;
  }
  const placed = placedIn(area.id);
  return `<div class="shop">${area.items.map((x) => shopButton("decor", x, { owned: owned().decor.includes(x.item), placed: placed.includes(x.item), area: area.id })).join("")}</div>`;
}

function wardrobeHtml() {
  const outfit = hazelOutfit();
  const mine = owned().hazel || [];
  return h`
    <div class="hazel-stage" aria-label="Hazel in her outfit">${hazelHtml("big")}</div>
    ${Object.entries(WARDROBE).map(([part, group]) => h`
      <h3>${group.label}</h3>
      <div class="shop">${group.items.map((x) => {
        const has = mine.includes(x.item);
        const wearing = outfit[part] === x.item;
        return `<button class="shop-item ${wearing ? "placed" : ""}" data-kind="hazel" data-part="${part}" data-item="${x.item}" data-cost="${x.cost}"
          ${!has && seeds() < x.cost ? "aria-disabled=true" : ""}>
          <span class="shop-emoji" aria-hidden="true">${x.item}</span><span>${esc(x.name)}</span>
          <small>${has ? (wearing ? "Take off" : "Wear") : `🌰 ${x.cost}`}</small></button>`;
      }).join("")}</div>`).join("")}`;
}

function visitorsHtml() {
  const have = visitorsEarned();
  const count = VISITORS.filter((v) => have[v.id]).length;
  return h`
    <p class="center"><strong>${count} of ${VISITORS.length} visitors found</strong></p>
    <div class="meter" aria-hidden="true"><span style="width:${(count / VISITORS.length) * 100}%"></span></div>
    <p class="muted small center">Visitors come when you reach a spelling goal. You can't buy them – you earn them!</p>
    <div class="sticker-book">
      ${VISITORS.map((v) => have[v.id]
        ? `<div class="sticker found speakable"><span class="sticker-icon" aria-hidden="true">${v.icon}</span><strong class="say-text">${esc(v.name)}</strong><small>${esc(v.how)}</small></div>`
        : `<div class="sticker missing speakable"><span class="sticker-icon" aria-hidden="true">${v.icon}</span><strong>???</strong><small class="say-text">${esc(v.how)}</small><button class="say-btn" type="button" aria-label="Read this out">🔊</button></div>`).join("")}
    </div>`;
}

export function gardenScreen() {
  // Award anything earned since last time (e.g. a new area just opened).
  const fresh = checkRewards();
  const p = progressSnapshot();
  const area = AREAS.find((a) => a.id === view.area) || AREAS[0];
  const grown = p.grown;

  const tabs = AREAS.map((a) => {
    const open = areaOpen(a, p);
    return `<button class="area-tab ${a.id === area.id ? "active" : ""} ${open ? "" : "locked"}" data-area="${a.id}"
      aria-pressed="${a.id === area.id}" aria-label="${esc(a.name)}${open ? "" : `, opens at ${a.need} flowers`}">
      <span aria-hidden="true">${open ? a.icon : "🔒"}</span><small>${esc(a.name)}</small></button>`;
  }).join("");

  const bubble = fresh.areas.length
    ? `Hooray! The ${fresh.areas.map((a) => a.name).join(" and the ")} ${fresh.areas.length > 1 ? "are" : "is"} open!`
    : fresh.visitors.length
      ? `Look who's here! ${fresh.visitors.map((v) => v.name).join(" and ")} came to visit!`
      : view.tab === "hazel" ? "Ooh, what shall I wear today?"
        : seeds() >= 3 ? "You've got seeds to spend! What shall we add?" : "Practise words and play games to earn seeds 🌰";

  app.innerHTML = h`
    ${header("#/", "My garden", `<span class="seed-pill">🌰 ${seeds()}</span>`)}
    <div class="area-tabs" role="group" aria-label="Garden areas">${tabs}</div>
    ${plotHtml(area, p)}
    ${arrangeBarHtml(area, p)}
    <p class="muted center small">${grown} flowers fully grown${area.id === "flowers" && !view.arranging ? " · tap a plant to hear its word" : ""}</p>
    ${companionHtml(bubble, { custom: true })}
    <div class="garden-tabs" role="tablist">
      <button class="garden-tab ${view.tab === "shop" ? "active" : ""}" data-tab="shop" role="tab" aria-selected="${view.tab === "shop"}">🛒 Shop</button>
      <button class="garden-tab ${view.tab === "hazel" ? "active" : ""}" data-tab="hazel" role="tab" aria-selected="${view.tab === "hazel"}">🦔 Hazel's wardrobe</button>
      <button class="garden-tab ${view.tab === "visitors" ? "active" : ""}" data-tab="visitors" role="tab" aria-selected="${view.tab === "visitors"}">📖 Visitors</button>
    </div>
    <section class="garden-panel">
      ${view.tab === "shop" ? shopHtml(area, p) : view.tab === "hazel" ? wardrobeHtml() : visitorsHtml()}
    </section>`;

  if (fresh.areas.length || fresh.visitors.length) { sound("fanfare"); cheer(bubble); }

  on(".plant", "click", (e) => { if (!view.arranging) say(e.currentTarget.dataset.word); });
  setUpArranging(area);
  on(".area-tab", "click", (e) => {
    view = { ...view, area: e.currentTarget.dataset.area, tab: view.tab === "hazel" || view.tab === "visitors" ? "shop" : view.tab, arranging: false, selected: null };
    keepScroll(gardenScreen);
  });
  on(".garden-tab", "click", (e) => {
    view = { ...view, tab: e.currentTarget.dataset.tab };
    keepScroll(gardenScreen);
  });
  on("button.shop-item", "click", (e) => {
    const { kind, item, cost, area: areaId, part } = e.currentTarget.dataset;
    const list = kind === "hazel" ? owned().hazel || [] : owned()[kind];
    const has = list.includes(item);
    if (!has) {
      if (!spendSeeds(Number(cost))) {
        toast(`You need ${Number(cost) - seeds()} more 🌰`);
        return;
      }
      ownItem(kind, item);
      sound("seed");
      toast(kind === "hazel" ? `Hazel loves it! ${item}` : `New ${kind === "flowers" ? "flower" : "decoration"}! ${item}`);
    }
    if (kind === "flowers") setGarden({ flower: item });
    else if (kind === "hazel") setHazel(part, hazelOutfit()[part] === item && has ? null : item);
    else {
      const d = placedIn(areaId);
      setPlaced(areaId, d.includes(item) && has ? d.filter((x) => x !== item) : [...new Set([...d, item])]);
    }
    keepScroll(gardenScreen);
  });
}

// ---------- moving things around ----------

function setUpArranging(area) {
  const redraw = () => keepScroll(gardenScreen);
  app.querySelector("#arrange-start")?.addEventListener("click", () => {
    view = { ...view, arranging: true, selected: null };
    sound("pop");
    redraw();
  });
  app.querySelector("#arrange-done")?.addEventListener("click", () => {
    view = { ...view, arranging: false, selected: null };
    sound("seed");
    toast("Your garden looks lovely! 🌷");
    redraw();
  });
  if (!view.arranging) return;

  const scene = app.querySelector("#scene");
  const topZ = () => Math.max(0, ...Object.values(layoutOf(area.id)).map((p) => p.z || 0)) + 1;
  const pointIn = (e) => {
    const r = scene.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100, 3, 97), y: clamp(((e.clientY - r.top) / r.height) * 100, 6, 94) };
  };
  const current = (key) => {
    const items = sceneItems(area);
    const i = items.findIndex((it) => it.key === key);
    return spotOf(area, items[i], i);
  };

  app.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => {
    const tool = b.dataset.tool;
    if (tool === "tidy") {
      resetLayout(area.id);
      view = { ...view, selected: null };
      toast("Everything's back where it started");
      redraw();
      return;
    }
    const key = view.selected;
    if (!key) return;
    const at = current(key);
    if (tool === "bigger") setLayoutItem(area.id, key, { s: clamp(Math.round(((at.s || 1) + 0.25) * 100) / 100, 0.5, 2.5) });
    if (tool === "smaller") setLayoutItem(area.id, key, { s: clamp(Math.round(((at.s || 1) - 0.25) * 100) / 100, 0.5, 2.5) });
    if (tool === "flip") setLayoutItem(area.id, key, { f: !at.f });
    sound("pop");
    redraw();
  }));

  // Tap an empty spot to move the chosen thing there.
  scene.addEventListener("click", (e) => {
    if (e.target.closest(".movable") || !view.selected) return;
    setLayoutItem(area.id, view.selected, { ...pointIn(e), z: topZ() });
    sound("pop");
    redraw();
  });

  scene.querySelectorAll(".movable").forEach((el) => {
    const key = el.dataset.key;
    let start = null;
    let moved = false;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      start = { x: e.clientX, y: e.clientY };
      moved = false;
      el.setPointerCapture?.(e.pointerId);
      el.style.zIndex = 99;
    });
    el.addEventListener("pointermove", (e) => {
      if (!start) return;
      if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
      moved = true;
      el.classList.add("dragging");
      const at = pointIn(e);
      el.style.left = `${at.x}%`;
      el.style.top = `${at.y}%`;
    });
    const finish = (e) => {
      if (!start) return;
      start = null;
      if (moved) {
        setLayoutItem(area.id, key, { ...pointIn(e), z: topZ() });
        view = { ...view, selected: key };
        sound("pop");
      } else {
        view = { ...view, selected: view.selected === key ? null : key };
      }
      redraw();
    };
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", () => { start = null; redraw(); });
    // Keyboard: arrow keys nudge the chosen thing.
    el.addEventListener("keydown", (e) => {
      const step = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key];
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        view = { ...view, selected: view.selected === key ? null : key };
        redraw();
        app.querySelector(`.movable[data-key="${CSS.escape(key)}"]`)?.focus();
        return;
      }
      if (!step) return;
      e.preventDefault();
      const at = current(key);
      setLayoutItem(area.id, key, { x: clamp(at.x + step[0], 3, 97), y: clamp(at.y + step[1], 6, 94) });
      view = { ...view, selected: key };
      redraw();
      app.querySelector(`.movable[data-key="${CSS.escape(key)}"]`)?.focus();
    });
  });
}
