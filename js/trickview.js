// Showing memory tricks: a picture card, and the word with the trick's
// letters lit up (the hidden word, the doubled letters, the acrostic letters).

import { trick, highlightMask, acrosticWords } from "./mnemonics.js";
import { chunks } from "./syllables.js";
import { esc, h } from "./ui.js";

/** The word in coloured syllable chunks, with the trick's letters highlighted. */
export function trickWordHtml(word) {
  const mask = highlightMask(word);
  let i = 0;
  return chunks(word)
    .map((syl, s) => `<span class="syl syl-${s % 2}" data-syl="${esc(syl)}">${[...syl]
      .map((c) => `<span class="letter ${mask[i++] ? "trick-hi" : ""}">${esc(c)}</span>`).join("")}</span>`)
    .join("");
}

/** A card with the trick's picture, words and (for acrostics) each first letter. */
export function trickCardHtml(word, { compact = false } = {}) {
  const t = trick(word);
  if (!t) return "";
  const rows = t.kind === "acrostic"
    ? `<div class="acrostic" aria-hidden="true">${acrosticWords(word)
        .map((w) => `<span class="acro-word"><span class="acro-first">${esc(w.first)}</span>${esc(w.rest)}</span>`).join("")}</div>`
    : "";
  return h`
    <div class="trick-card card speakable ${compact ? "compact" : ""} ${t.kind === "acrostic" ? "is-acrostic" : ""}">
      <div class="trick-picture" aria-hidden="true">${t.picture}</div>
      <div class="trick-body">
        <p class="trick-label">🧠 Memory trick</p>
        ${rows}
        <p class="trick-text"><span class="say-text ${t.kind === "acrostic" ? "visually-hidden" : ""}">${esc(t.text)}</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p>
        ${t.say ? `<p class="say-silly speakable" data-silly="${esc(t.say)}">🗣️ Say it the silly way: <strong>${esc(t.say)}</strong><button class="say-btn silly-btn" type="button" aria-label="Hear the silly way">🔊</button></p>` : ""}
        ${compact ? "" : `<p class="trick-source">${t.source === "known"
          ? "⭐ A well-known spelling trick"
          : "🦔 Hazel's idea – make up your own if you like!"}</p>`}
      </div>
    </div>`;
}
