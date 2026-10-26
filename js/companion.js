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
// Hazel is drawn here rather than using the 🦔 emoji, because every device
// draws that emoji differently (facing different ways), so her clothes
// would land in the wrong place. She faces right, towards her speech bubble.
const HAZEL_SVG = `<svg class="hog" viewBox="0 0 100 100" aria-hidden="true" focusable="false"> <path d="M79.7,51.7 L85.3,45.4 L75.6,45.3 L79.1,38.1 L69.6,39.8 L70.8,32.2 L62.1,35.6 L61.0,28.0 L53.6,33.0 L50.2,25.7 L44.5,32.0 L39.0,25.6 L35.4,32.8 L28.1,27.6 L26.8,35.3 L18.2,31.6 L19.2,39.3 L9.7,37.4 L13.0,44.6 L3.2,44.6 L8.7,51.0 L-0.9,52.8 L6.3,58.0 L-2.4,61.5 L6.2,65.2 L-1.2,70.3 L8.3,72.3 L12,88 Z" fill="#7a4a2c" stroke="#5d3720" stroke-width="2" stroke-linejoin="round"/> <ellipse cx="44" cy="64" rx="34" ry="24" fill="#8d5a3b"/> <path d="M50 50 Q66 38 82 50 Q90 56 96 63 Q97 68 92 70 Q80 82 62 84 Q48 84 44 74 Q42 60 50 50 Z" fill="#f2d4a8" stroke="#d9b483" stroke-width="1.5"/> <ellipse cx="60" cy="47" rx="6" ry="7" fill="#f2d4a8" stroke="#d9b483" stroke-width="1.5"/> <ellipse cx="60" cy="48" rx="3" ry="3.6" fill="#e9a6a0"/> <circle cx="96" cy="64" r="4.2" fill="#2b2b2b"/> <circle cx="75" cy="57" r="3.6" fill="#2b2b2b"/><circle cx="76.3" cy="55.8" r="1.2" fill="#fff"/> <ellipse cx="72" cy="68" rx="5" ry="3" fill="#f3a3a0" opacity=".7"/> <path d="M82 70 Q86 73 90 70" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round"/> <ellipse cx="34" cy="88" rx="8" ry="5" fill="#5d3720"/> <ellipse cx="58" cy="89" rx="8" ry="5" fill="#5d3720"/> <ellipse cx="74" cy="82" rx="5" ry="4" fill="#5d3720"/> </svg>`;

// Where each kind of clothing goes on Hazel: the centre of the item as a
// percentage of her picture, its size (in ems of her size) and a tilt.
const WEAR = {
  hat: { x: 69, y: 29, s: 0.4, r: 8 },
  face: { x: 79, y: 56, s: 0.3 },
  neck: { x: 52, y: 78, s: 0.32 },
  held: { x: 92, y: 64, s: 0.4 },
};
// Small adjustments for items that are a different shape. Held things are
// placed so their handle sits where Hazel's paw (drawn on top) grips them.
const WEAR_ITEM = {
  "🎀": { x: 66, y: 37, s: 0.3, r: -10 },
  "🌸": { x: 64, y: 38, s: 0.28 },
  "🧢": { x: 70, y: 33, s: 0.38, r: 0 },
  "🎩": { x: 69, y: 26, s: 0.4, r: 6 },
  "🎓": { x: 69, y: 31, s: 0.4, r: 4 },
  "👑": { x: 69, y: 31, s: 0.36, r: 6 },
  "🕶️": { x: 79, y: 56, s: 0.32 },
  "🧣": { x: 50, y: 76, s: 0.38, r: -8 },
  "🏅": { x: 53, y: 82, s: 0.32 },
  "🎈": { x: 86, y: 40, s: 0.44, r: -8 },
  "🍭": { x: 85, y: 60, s: 0.36, r: 40 },
  "🌻": { x: 92, y: 60, s: 0.38, r: 0 },
  "☂️": { x: 93, y: 56, s: 0.44 },
  "📚": { x: 90, y: 74, s: 0.32 },
  "🪄": { x: 98, y: 66, s: 0.38 },
};
// The paw that holds things, drawn over the bottom of the held item.
const PAW = `<svg class="paw" viewBox="0 0 20 16" aria-hidden="true" focusable="false"><ellipse cx="10" cy="8" rx="9" ry="7" fill="#5d3720"/><path d="M5 5 Q7 3 9 5 M10 4.5 Q12 2.5 14 4.5" stroke="#3e2414" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`;

export function hazelHtml(size = "") {
  const o = hazelOutfit();
  const acc = (part) => {
    const item = o[part];
    if (!item) return "";
    const at = { ...WEAR[part], ...(WEAR_ITEM[item] || {}) };
    return `<span class="acc acc-${part}" style="left:${at.x}%;top:${at.y}%;font-size:${at.s}em;transform:translate(-50%,-50%) rotate(${at.r || 0}deg)">${item}</span>`;
  };
  return `<span class="hedgehog ${size}" aria-hidden="true">${HAZEL_SVG}${acc("hat")}${acc("face")}${acc("neck")}${acc("held")}${o.held ? PAW : ""}</span>`;
}

/** Hazel with a speech bubble. Pass a custom message or a kind of line. */
export function companionHtml(kindOrText, { custom = false, vars } = {}) {
  const text = custom ? kindOrText : companionLine(kindOrText, vars);
  return `<div class="companion" role="status">${hazelHtml()}<p class="bubble speakable"><span class="say-text">${esc(text)}</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p></div>`;
}
