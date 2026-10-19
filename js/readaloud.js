// Reading instructions aloud, for children who can't read them yet.
//  - instructions in practice and games are spoken automatically
//    (when they change, so a repeated "Build the word" isn't said every time)
//  - anything marked .speakable gets a 🔊 button that reads it out

import { getSettings } from "./store.js";
import { say, warm, stop } from "./speech.js";
import { esc } from "./ui.js";

const sayBtn = `<button class="say-btn" type="button" aria-label="Read this out">🔊</button>`;

/** An instruction line with a read-aloud button. */
export const instructionHtml = (text, cls = "step-label") =>
  `<p class="${cls} speakable"><span class="say-text">${esc(text)}</span>${sayBtn}</p>`;

/** Adds a read-aloud button to existing HTML content (already escaped). */
export const withSayButton = (html) => `<span class="say-text">${html}</span>${sayBtn}`;

export const readAloudOn = () => getSettings().readAloud !== false;

let lastSaid = "";
let lastAt = 0;

/** Speak an instruction, unless it was just said (or read-aloud is off). */
export function readInstruction(text, { force = false } = {}) {
  if (!readAloudOn() || !text) return Promise.resolve();
  const now = Date.now();
  if (!force && text === lastSaid && now - lastAt < 120000) return Promise.resolve();
  lastSaid = text;
  lastAt = now;
  return say(text, { rate: Math.min(1, (getSettings().speechRate ?? 0.8) + 0.1) });
}

// One handler for every 🔊 button in the app.
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.(".say-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  // "Say it the silly way": speak each chunk slowly, e.g. Feb … roo … ar … y
  const silly = btn.closest("[data-silly]")?.dataset.silly;
  if (silly) {
    stop();
    (async () => { for (const part of silly.split("-")) await say(part, { rate: 0.7 }); })();
    return;
  }
  const box = btn.closest(".speakable");
  const text = (box?.querySelector(".say-text") || box)?.textContent?.replace("🔊", "").trim();
  if (!text) return;
  stop();
  warm(text);
});
