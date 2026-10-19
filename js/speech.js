// Text-to-speech using the browser's built-in voices, preferring British English.
//
// Two speaking styles:
//  - say():   clear and steady, for teaching words, letters and syllables
//  - cheer(): higher and bouncier, for praise and celebrations
//  - warm():  gentle and kind, for encouragement after a mistake
// The voice can be chosen in Settings; otherwise the most natural-sounding
// British voice on the device is picked automatically.

import { getSettings } from "./store.js";

let voices = [];
const listeners = new Set();

// Higher score = more natural sounding. Newer devices include "natural",
// "neural", "enhanced" or "premium" voices that sound far less robotic.
function quality(v) {
  let score = 0;
  const n = v.name.toLowerCase();
  if (v.lang === "en-GB" || v.lang === "en_GB") score += 50;
  else if (v.lang?.startsWith("en")) score += 20;
  if (/natural|neural|online/.test(n)) score += 40;
  if (/premium|enhanced/.test(n)) score += 35;
  if (/google uk english female|libby|sonia|serena|kate|stephanie|maisie|hazel|martha/.test(n)) score += 15;
  if (/female/.test(n)) score += 5;
  if (/compact|espeak|robot|whisper|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|zarvox|wobble/.test(n)) score -= 60;
  if (v.localService === false) score += 3;
  return score;
}

function loadVoices() {
  if (!canSpeak()) return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("en"));
  voices.sort((a, b) => quality(b) - quality(a));
  listeners.forEach((fn) => fn(voices));
}

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

if (canSpeak()) {
  loadVoices();
  speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}

/** English voices on this device, best first. */
export const availableVoices = () => voices;
export const onVoicesChanged = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function currentVoice() {
  const chosen = getSettings().voice;
  return (chosen && voices.find((v) => v.name === chosen)) || voices[0] || null;
}

function speak(text, { rate, pitch, volume = 1 } = {}) {
  if (!canSpeak() || !text) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = currentVoice();
    try { if (v) u.voice = v; } catch { /* fall back to the default voice */ }
    u.lang = v?.lang || "en-GB";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    let finished = false;
    const done = () => { if (!finished) { finished = true; resolve(); } };
    u.onend = done;
    u.onerror = done;
    // Some browsers never fire onend; don't let the app wait forever.
    setTimeout(done, 1200 + text.length * 120);
    speechSynthesis.speak(u);
  });
}

const base = () => getSettings().speechRate ?? 0.8;
const lively = () => getSettings().lively !== false;

/** Clear, steady speech for teaching. */
export function say(text, { rate } = {}) {
  return speak(text, { rate: rate ?? base(), pitch: lively() ? 1.08 : 1 });
}

/** Excited, bouncy speech for praise. */
export function cheer(text) {
  if (!lively()) return speak(text, { rate: base(), pitch: 1 });
  return speak(text, { rate: Math.min(1.2, base() + 0.3), pitch: 1.35 });
}

/** Gentle, kind speech for encouragement after a mistake. */
export function warm(text) {
  return speak(text, { rate: Math.min(1, base() + 0.1), pitch: lively() ? 1.15 : 1 });
}

export function stop() {
  if (canSpeak()) speechSynthesis.cancel();
}

/** Letter names spoken clearly, used for Simultaneous Oral Spelling (SOS). */
export function sayLetter(letter) {
  return say(letter.toLowerCase(), { rate: 0.7 });
}
