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
// How much tracing counts as one go: drawn length compared with the word's width.
// Tracing every letter covers far more than the width, so this is generous.
const GO_LENGTH = 1.2;

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
  let drawnThisGo = 0; // length traced in the current colour
  let wordWidth = 200;
  let drawing = false;
  let waitForLift = false; // after a go is done, the next one starts on a new touch
  let last = null;

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
    wordWidth = Math.max(measured, 80);
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

  function chooseColour(i) {
    colourIndex = i;
    drawnThisGo = 0;
    updateMeter();
    root.querySelectorAll(".swatch").forEach((s, n) => s.classList.toggle("chosen", n === i));
  }

  function updateMeter() {
    const pct = goes >= NEEDED ? 100 : Math.min(100, (drawnThisGo / (wordWidth * GO_LENGTH)) * 100);
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
    waitForLift = true;
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
    waitForLift = false;
    canvas.setPointerCapture(e.pointerId);
    ctx.strokeStyle = colour().hex;
    ctx.lineWidth = Math.max(6, canvas.clientHeight * 0.05);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.8;
    last = point(e);
    ctx.beginPath();
    ctx.moveTo(...last);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = point(e);
    ctx.lineTo(...p);
    ctx.stroke();
    if (goes < NEEDED && !waitForLift) {
      drawnThisGo += Math.hypot(p[0] - last[0], p[1] - last[1]);
      updateMeter();
      if (drawnThisGo >= wordWidth * GO_LENGTH) completeGo();
    }
    last = p;
  });
  const end = () => {
    drawing = false;
    ctx.globalAlpha = 1;
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
