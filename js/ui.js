// Small shared helpers for building screens.

import { chunks } from "./syllables.js";
import { stop, say, sayLetter } from "./speech.js";
import { getSettings, seeds } from "./store.js";

export const app = document.getElementById("app");
export const PLANTS = ["🟫", "🌱", "🌿", "🌷", "🌻"]; // by Leitner box

export const h = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (vals[i] ?? ""), "");

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function on(selector, event, handler, root = app) {
  root.querySelectorAll(selector).forEach((el) => el.addEventListener(event, handler));
}

export function go(hash) {
  stop();
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}

export function applySettings() {
  const s = getSettings();
  const root = document.documentElement;
  root.dataset.font = s.font;
  root.dataset.tint = s.tint;
  root.dataset.spacing = s.spacing;
  root.dataset.calm = s.calm ? "on" : "off";
  root.style.setProperty("--text-scale", s.textSize);
}

/** Standard header: back link, title, optional right-hand item. */
export function header(backHref, title, right = "<span></span>") {
  return h`
    <header class="top">
      ${backHref ? `<a class="icon-btn" href="${backHref}" aria-label="Back">⬅️</a>` : "<span></span>"}
      <h1>${title}</h1>
      ${right}
    </header>`;
}

export const seedBadge = () => `<a class="seed-pill" href="#/garden" aria-label="${seeds()} seeds">🌰 ${seeds()}</a>`;

/** The word drawn as coloured syllable chunks, each holding its letters. */
export function chunkedWordHtml(word) {
  return chunks(word)
    .map((syl, i) => `<span class="syl syl-${i % 2}" data-syl="${esc(syl)}">${[...syl]
      .map((c) => `<span class="letter">${esc(c)}</span>`).join("")}</span>`)
    .join("");
}

export const beatsLabel = (n) => (n === 1 ? "1 beat" : `${n} beats`);

// ---------- tap-to-build tiles (letters or syllable chunks) ----------

export function tilesHtml(answer, pieces) {
  const isChunks = pieces.length !== [...answer].length;
  let order = shuffle(pieces);
  for (let i = 0; i < 6 && order.join("") === answer && pieces.length > 1; i++) order = shuffle(pieces);
  return h`
    <div class="answer-slots ${isChunks ? "chunk-slots" : ""}" style="--n:${pieces.length}" aria-live="polite">${pieces
      .map(() => `<span class="slot"></span>`).join("")}</div>
    <div class="tiles">
      ${order.map((c, i) => `<button class="tile ${isChunks ? "chunk-tile" : ""}" data-i="${i}">${esc(c)}</button>`).join("")}
    </div>
    <button class="btn subtle undo">↩️ Undo</button>`;
}

/** Wires up tiles inside `root`; calls onChange(complete) and returns a getter for the answer. */
export function setupTiles(root, slotsNeeded, { isChunks = false, onChange } = {}) {
  const placed = [];
  const slots = [...root.querySelectorAll(".slot")];
  const render = () => {
    slots.forEach((s, i) => (s.textContent = placed[i]?.textContent ?? ""));
    onChange?.(placed.length === slotsNeeded);
  };
  on(".tile", "click", (e) => {
    const t = e.currentTarget;
    if (t.disabled || placed.length >= slotsNeeded) return;
    t.disabled = true;
    placed.push(t);
    if (isChunks) say(t.textContent, { rate: 0.7 });
    else sayLetter(t.textContent);
    render();
  }, root);
  on(".undo", "click", () => {
    const t = placed.pop();
    if (t) t.disabled = false;
    render();
  }, root);
  return () => placed.map((t) => t.textContent).join("");
}

/** A short-lived toast message, e.g. "+1 seed". */
export function toast(text) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ---------- always start a new screen at the top ----------
// Screens are drawn by replacing everything inside #app. If the page was
// scrolled down (game tiles and "Next" buttons are near the bottom), the new
// screen would otherwise appear above the visible area and look blank.
// On iPad, a scroll that's still gliding can undo a single jump to the top,
// so we jump again on the next two frames.

let keepNext = false;

/** Re-draw the current screen without jumping to the top (e.g. after a shop purchase). */
export function keepScroll(draw) {
  const y = window.scrollY;
  keepNext = true;
  draw();
  window.scrollTo(0, y);
}

function toTop() {
  const el = document.scrollingElement || document.documentElement;
  el.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

if (app && "MutationObserver" in window) {
  const root = document.documentElement;
  new MutationObserver(() => {
    if (keepNext) { keepNext = false; return; }
    // Freezing scrolling for a frame stops an iPad "glide" in its tracks.
    root.style.overflow = "hidden";
    toTop();
    requestAnimationFrame(() => {
      toTop();
      root.style.overflow = "";
      requestAnimationFrame(toTop);
    });
  }).observe(app, { childList: true });
}
