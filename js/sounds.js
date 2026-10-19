// Little celebration sounds, made with the Web Audio API (no sound files needed).
// Happy chimes for success; a soft, friendly "boop" for mistakes, never a buzzer.

import { getSettings } from "./store.js";

let ctx = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function note(freq, start, length, { type = "sine", volume = 0.18 } = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, D5 = 587.33, A5 = 880, E6 = 1318.5;

const SOUNDS = {
  // Bright rising chime
  correct: () => { note(C5, 0, 0.25); note(E5, 0.08, 0.25); note(G5, 0.16, 0.35); },
  // Sparkly star
  star: () => { note(G5, 0, 0.2, { type: "triangle" }); note(C6, 0.07, 0.3, { type: "triangle" }); note(E6, 0.14, 0.4, { type: "triangle", volume: 0.12 }); },
  // Little fanfare for a fully grown flower, a perfect session or a finished game
  fanfare: () => {
    [C5, E5, G5].forEach((f, i) => note(f, i * 0.12, 0.2, { type: "triangle" }));
    note(C6, 0.36, 0.55, { type: "triangle" });
    note(G5, 0.36, 0.55, { volume: 0.1 });
    note(E5, 0.36, 0.55, { volume: 0.08 });
  },
  // Pop for tapping tiles and drum beats
  pop: () => note(A5, 0, 0.09, { volume: 0.1 }),
  // Gentle, friendly two-note "hmm" for a mistake
  oops: () => { note(D5, 0, 0.18, { volume: 0.1 }); note(C5, 0.14, 0.25, { volume: 0.1 }); },
  // Seeds earned
  seed: () => { note(E6, 0, 0.08, { type: "triangle", volume: 0.08 }); note(C6, 0.06, 0.12, { type: "triangle", volume: 0.08 }); },
};

export function sound(name) {
  if (getSettings().sounds === false) return;
  try { SOUNDS[name]?.(); } catch { /* audio not available */ }
}
