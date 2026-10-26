// Hazel the hedgehog: a friendly gardener who cheers the child on.
// Her lines praise effort and never scold. The lines themselves live in praise.js.

import { praise } from "./praise.js";
import { esc } from "./ui.js";
import { hazelOutfit } from "./store.js";

const KINDS = {
  greet: "greet",
  start: "start",
  correct: "correctComment",
  mastered: "mastered",
  mistake: "mistake",
  end: "endComment",
  streak: "streak",
};

export const companionLine = (kind, vars) => praise(KINDS[kind] || kind, vars);

/** Hazel, wearing whatever the child has dressed her in. */
export function hazelHtml(size = "") {
  const o = hazelOutfit();
  const acc = (part) => (o[part] ? `<span class="acc acc-${part}">${o[part]}</span>` : "");
  return `<span class="hedgehog ${size}" aria-hidden="true"><span class="hog">🦔</span>${acc("hat")}${acc("face")}${acc("neck")}${acc("held")}</span>`;
}

/** Hazel with a speech bubble. Pass a custom message or a kind of line. */
export function companionHtml(kindOrText, { custom = false, vars } = {}) {
  const text = custom ? kindOrText : companionLine(kindOrText, vars);
  return `<div class="companion" role="status">${hazelHtml()}<p class="bubble speakable"><span class="say-text">${esc(text)}</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p></div>`;
}
