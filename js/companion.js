// Hazel the hedgehog: a friendly gardener who cheers the child on.
// Her lines praise effort and never scold.

import { currentProfile } from "./store.js";
import { esc, pick } from "./ui.js";

const LINES = {
  greet: [
    "Hello {name}! Shall we grow something today?",
    "Hi {name}! The garden's been waiting for you.",
    "Welcome back, {name}! Ready to dig in?",
    "Ooh, {name} is here! Let's get growing.",
  ],
  start: [
    "Take your time. There's no rush in my garden.",
    "Look, listen, then have a go. You've got this!",
    "Let's water some words together.",
  ],
  correct: [
    "Brilliant spelling!",
    "Wow, look at that grow!",
    "You remembered it!",
    "Super! My prickles are tingling with joy.",
  ],
  mistake: [
    "Mistakes help our brains grow, just like plants!",
    "Nearly there! Let's look at it together.",
    "That was a tricky one. Good try!",
    "Even I muddle letters sometimes, and I'm a hedgehog.",
  ],
  mastered: [
    "A new flower for your garden!",
    "That word is fully grown. Hooray!",
  ],
  end: [
    "What a hard worker! The garden looks lovely.",
    "Great practice! Come back soon to water your words.",
    "I'm so proud of you for trying.",
  ],
  game: [
    "Fancy a game?",
    "Games grow brains too!",
  ],
};

export function companionLine(kind) {
  const name = currentProfile()?.name || "friend";
  return pick(LINES[kind] || LINES.greet).replace("{name}", name);
}

/** Hazel with a speech bubble. Pass a custom message or a kind of line. */
export function companionHtml(kindOrText, { custom = false } = {}) {
  const text = custom ? kindOrText : companionLine(kindOrText);
  return `<div class="companion" role="status"><span class="hedgehog" aria-hidden="true">🦔</span><p class="bubble">${esc(text)}</p></div>`;
}
