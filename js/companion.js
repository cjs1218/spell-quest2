// Hazel the hedgehog: a friendly gardener who cheers the child on.
// Her lines praise effort and never scold. The lines themselves live in praise.js.

import { praise } from "./praise.js";
import { esc } from "./ui.js";

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

/** Hazel with a speech bubble. Pass a custom message or a kind of line. */
export function companionHtml(kindOrText, { custom = false, vars } = {}) {
  const text = custom ? kindOrText : companionLine(kindOrText, vars);
  return `<div class="companion" role="status"><span class="hedgehog" aria-hidden="true">🦔</span><p class="bubble speakable"><span class="say-text">${esc(text)}</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p></div>`;
}
