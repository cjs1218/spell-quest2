// Rainbow writing: trace over the word three times, each time in a new colour.
// Writing the same word several times in different colours helps the letter
// shapes and order stick (a classic multisensory technique).
// Three stars show how many goes are done; each one fills when a go is finished.

import { esc, h, on } from "./ui.js";
import { say } from "./speech.js";

export const RAINBOW = [
  { name: "red", hex: "#e53935" },
  { name: "orange", hex: "#fb8c00" },
  { name: "yellow", hex: "#fdd835" },
  { name: "green", hex: "#43a047" },
  { name: "blue", hex: "#1e88e5" },
  { name: "purple", hex: "#8e24aa" },
];
const NEEDED = 3; // goes to finish
// A go counts when the child has traced over the whole word: most of the
// word's shape overall, and a good part of EVERY letter, so lifting the
// finger between letters (or stopping half-way) doesn't count as a go.
const WORD_COVER = 0.6; // share of the word's shape traced
const LETTER_COVER = 0.4; // share of each letter traced
const SAMPLE_STEP = 3; // px between sample points on the word's shape

const starsHtml = (done) =>
  Array.from({ length: NEEDED }, (_, i) =>
    `<span class="star ${i < done ? "on" : ""}" aria-hidden="true">${i < done ? "⭐" : "☆"}</span>`).join("");

export function rainbowHtml(word) {
  return h`
    <div class="rainbow">
      <p class="step-label">Trace over <strong>${esc(word)}</strong> 3 times, in 3 colours</p>
      <div class="stars" role="img" aria-label="0 of ${NEEDED} done">${starsHtml(0)}</div>
      <div class="canvas-wrap">
        <canvas class="rainbow-canvas" aria-label="Tracing area for ${esc(word)}"></canvas>
        <div class="go-pop" aria-hidden="true"></div>
      </div>
      <div class="go-meter" aria-hidden="true"><span></span></div>
      <div class="swatches" role="group" aria-label="Colours">
        ${RAINBOW.map((c, i) => `<button class="swatch" data-i="${i}" style="--c:${c.hex}" aria-label="${c.name}"></button>`).join("")}
      </div>
      <p class="muted rainbow-count" aria-live="polite"></p>
      <div class="row">
        <button class="btn subtle rainbow-clear">🧽 Start again</button>
        <button class="btn primary rainbow-done" disabled>Finished!</button>
      </div>
    </div>`;
}

/** Sets up the canvas inside `root`; calls onDone() when the child finishes. */
export function setupRainbow(root, word, onDone) {
  const canvas = root.querySelector(".rainbow-canvas");
  const ctx = canvas.getContext("2d");
  const done = root.querySelector(".rainbow-done");
  const countEl = root.querySelector(".rainbow-count");
  const starsEl = root.querySelector(".stars");
  const meter = root.querySelector(".go-meter span");
  const pop = root.querySelector(".go-pop");

  let goes = 0;
  let colourIndex = 0;
  let drawing = false;
  let last = null;
  // Points sampled from the word's letter shapes, and which ones this go has covered.
  let samples = []; // { x, y, letter }
  let letterTotals = [];
  let covered = new Uint8Array(0);
  let reach = 10; // how close a trace must pass to count, in px

  const colour = () => RAINBOW[colourIndex];

  function drawGuide() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = hgt * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hgt);
    const font = getComputedStyle(document.body).fontFamily;
    let size = hgt * 0.62;
    ctx.font = `600 ${size}px ${font}`;
    const max = w * 0.9;
    let measured = ctx.measureText(word).width;
    if (measured > max) {
      size *= max / measured;
      ctx.font = `600 ${size}px ${font}`;
      measured = max;
    }
    buildSamples(w, hgt, ctx.font, measured);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(120,120,120,0.55)";
    ctx.strokeText(word, w / 2, hgt / 2);
    ctx.fillStyle = "rgba(120,120,120,0.12)";
    ctx.fillText(word, w / 2, hgt / 2);
    ctx.setLineDash([]);
  }

  // Draw the word on a hidden canvas and keep a grid of points that fall
  // inside its letters, labelled with which letter each belongs to.
  function buildSamples(w, hgt, font, wordWidth) {
    const off = document.createElement("canvas");
    off.width = Math.ceil(w);
    off.height = Math.ceil(hgt);
    const o = off.getContext("2d");
    o.font = font;
    o.textAlign = "left";
    o.textBaseline = "middle";
    const startX = (w - wordWidth) / 2;
    o.fillText(word, startX, hgt / 2);
    const edges = [...word].map((_, i) => startX + o.measureText(word.slice(0, i + 1)).width);
    const img = o.getImageData(0, 0, off.width, off.height).data;
    samples = [];
    for (let y = 0; y < off.height; y += SAMPLE_STEP) {
      for (let x = 0; x < off.width; x += SAMPLE_STEP) {
        if (img[(y * off.width + x) * 4 + 3] > 128) {
          let letter = edges.findIndex((e) => x < e);
          if (letter < 0) letter = word.length - 1;
          samples.push({ x, y, letter });
        }
      }
    }
    letterTotals = Array(word.length).fill(0);
    for (const p of samples) letterTotals[p.letter] += 1;
    covered = new Uint8Array(samples.length);
    reach = Math.max(9, hgt * 0.07);
  }

  // Mark word points near the line from a to b as traced.
  function cover(a, b) {
    const minX = Math.min(a[0], b[0]) - reach, maxX = Math.max(a[0], b[0]) + reach;
    const minY = Math.min(a[1], b[1]) - reach, maxY = Math.max(a[1], b[1]) + reach;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy || 1;
    for (let i = 0; i < samples.length; i++) {
      if (covered[i]) continue;
      const p = samples[i];
      if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) continue;
      const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / len2));
      const ex = a[0] + t * dx - p.x, ey = a[1] + t * dy - p.y;
      if (ex * ex + ey * ey <= reach * reach) covered[i] = 1;
    }
  }

  function coverage() {
    const perLetter = Array(word.length).fill(0);
    let total = 0;
    for (let i = 0; i < samples.length; i++) {
      if (covered[i]) { total += 1; perLetter[samples[i].letter] += 1; }
    }
    const letters = perLetter.map((n, i) => (letterTotals[i] ? n / letterTotals[i] : 1));
    return { word: samples.length ? total / samples.length : 0, letters };
  }

  // Progress towards a go, 0–1: limited by the overall trace and the least-traced letter.
  function progress() {
    const c = coverage();
    const wordPart = Math.min(1, c.word / WORD_COVER);
    const letterPart = Math.min(1, Math.min(...c.letters) / LETTER_COVER);
    return Math.min(wordPart, letterPart);
  }

  function chooseColour(i) {
    colourIndex = i;
    covered = new Uint8Array(samples.length);
    updateMeter();
    root.querySelectorAll(".swatch").forEach((s, n) => s.classList.toggle("chosen", n === i));
  }

  function updateMeter() {
    // The bar fills steadily as each letter is traced (an average across letters),
    // while a go only counts when every letter has been traced.
    let pct = 100;
    if (goes < NEEDED) {
      const c = coverage();
      const letters = c.letters.reduce((sum, v) => sum + Math.min(1, v / LETTER_COVER), 0) / c.letters.length;
      pct = Math.round(Math.min(Math.min(1, c.word / WORD_COVER), letters) * 100);
    }
    meter.style.width = `${pct}%`;
    meter.style.background = colour().hex;
  }

  function updateText() {
    starsEl.innerHTML = starsHtml(goes);
    starsEl.setAttribute("aria-label", `${Math.min(goes, NEEDED)} of ${NEEDED} done`);
    if (goes >= NEEDED) {
      countEl.textContent = "Three stars! Beautiful rainbow writing! 🌈";
      starsEl.classList.add("all-done");
    } else if (goes === 0) {
      countEl.textContent = `Trace the whole word in ${colour().name}.`;
    } else {
      countEl.textContent = `${goes === 1 ? "One" : "Two"} done! Now trace it in ${colour().name}.`;
    }
    done.disabled = goes < NEEDED;
  }

  function completeGo() {
    goes += 1;
    pop.textContent = "⭐";
    pop.classList.remove("show");
    void pop.offsetWidth;
    pop.classList.add("show");
    say(goes >= NEEDED ? "Three stars!" : goes === 1 ? "One!" : "Two!");
    // Move on to the next rainbow colour automatically.
    if (goes < NEEDED) chooseColour((colourIndex + 1) % RAINBOW.length);
    updateMeter();
    updateText();
  }

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.strokeStyle = colour().hex;
    ctx.lineWidth = Math.max(6, canvas.clientHeight * 0.05);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.8;
    last = point(e);
    ctx.beginPath();
    ctx.moveTo(...last);
    if (goes < NEEDED) cover(last, last);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = point(e);
    ctx.lineTo(...p);
    ctx.stroke();
    if (goes < NEEDED) {
      cover(last, p);
      updateMeter();
    }
    last = p;
  });
  // A go is checked when the finger lifts, so the child can take as many
  // strokes as they need (one per letter is fine) before it counts.
  const end = () => {
    if (!drawing) return;
    drawing = false;
    ctx.globalAlpha = 1;
    if (goes >= NEEDED) return;
    if (progress() >= 1) completeGo();
    else if (coverage().word > 0.15) {
      const left = coverage().letters.findIndex((v) => v < LETTER_COVER);
      if (left >= 0) countEl.textContent = `Keep going – trace the “${word[left]}” too.`;
    }
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  on(".swatch", "click", (e) => {
    chooseColour(Number(e.currentTarget.dataset.i));
    updateText();
  }, root);
  on(".rainbow-clear", "click", () => {
    goes = 0;
    starsEl.classList.remove("all-done");
    chooseColour(0);
    drawGuide();
    updateText();
  }, root);
  on(".rainbow-done", "click", () => onDone?.(), root);

  chooseColour(0);
  updateText();
  requestAnimationFrame(() => { drawGuide(); updateMeter(); });
  say(word);
}
