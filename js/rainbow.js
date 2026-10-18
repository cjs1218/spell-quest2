// Rainbow writing: trace over the word with your finger, once in each colour.
// Writing the same word several times in different colours helps the
// letter shapes and order stick (a classic multisensory technique).

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
const NEEDED = 3; // colours to finish

export function rainbowHtml(word) {
  return h`
    <div class="rainbow">
      <p class="step-label">Trace over <strong>${esc(word)}</strong> with your finger</p>
      <canvas class="rainbow-canvas" aria-label="Tracing area for ${esc(word)}"></canvas>
      <div class="swatches" role="group" aria-label="Colours">
        ${RAINBOW.map((c, i) => `<button class="swatch" data-i="${i}" style="--c:${c.hex}" aria-label="${c.name}"></button>`).join("")}
      </div>
      <p class="muted rainbow-count" aria-live="polite">Pick a colour and trace the word.</p>
      <div class="row">
        <button class="btn subtle rainbow-clear">🧽 Clear</button>
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
  const used = new Set();
  let colour = null;
  let drawing = false;
  let strokesThisColour = 0;

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
    const measured = ctx.measureText(word).width;
    if (measured > max) {
      size *= max / measured;
      ctx.font = `600 ${size}px ${font}`;
    }
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

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!colour) {
      countEl.textContent = "Pick a colour first!";
      return;
    }
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.strokeStyle = colour.hex;
    ctx.lineWidth = Math.max(6, canvas.clientHeight * 0.05);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.8;
    const [x, y] = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const [x, y] = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    ctx.globalAlpha = 1;
    strokesThisColour += 1;
    if (strokesThisColour >= 1 && colour) {
      used.add(colour.name);
      const left = NEEDED - used.size;
      countEl.textContent = left > 0
        ? `Lovely ${colour.name}! Now pick another colour (${left} more).`
        : "Beautiful rainbow writing! 🌈";
      done.disabled = left > 0;
    }
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  on(".swatch", "click", (e) => {
    colour = RAINBOW[Number(e.currentTarget.dataset.i)];
    strokesThisColour = 0;
    root.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("chosen", s === e.currentTarget));
    countEl.textContent = `Trace the word in ${colour.name}.`;
  }, root);
  on(".rainbow-clear", "click", () => {
    used.clear();
    done.disabled = true;
    countEl.textContent = "Pick a colour and trace the word.";
    drawGuide();
  }, root);
  on(".rainbow-done", "click", () => onDone?.(), root);

  requestAnimationFrame(drawGuide);
  say(word);
}
