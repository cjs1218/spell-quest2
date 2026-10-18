// Text-to-speech using the browser's built-in voices, preferring British English.

import { getSettings } from "./store.js";

let voice = null;

function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === "en-GB" && /female|serena|kate|libby|sonia/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
}

if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

export const canSpeak = () => "speechSynthesis" in window;

export function say(text, { rate } = {}) {
  if (!canSpeak()) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = "en-GB";
    u.rate = rate ?? getSettings().speechRate;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

export function stop() {
  if (canSpeak()) speechSynthesis.cancel();
}

// Letter names spoken clearly, used for Simultaneous Oral Spelling (SOS).
export function sayLetter(letter) {
  return say(letter.toLowerCase(), { rate: 0.7 });
}
