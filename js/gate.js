// A light "grown-ups only" lock: a multiplication question before the
// grown-ups pages, so children don't reset progress or change the school list
// by accident. It stays unlocked for 10 minutes. It's a speed bump, not security.

import { app, h, header, on, toast } from "./ui.js";

const KEY = "spellquest.grownupUntil";
const MINUTES = 10;

export function isUnlocked() {
  try { return Number(sessionStorage.getItem(KEY) || 0) > Date.now(); } catch { return false; }
}

function unlock() {
  try { sessionStorage.setItem(KEY, String(Date.now() + MINUTES * 60000)); } catch { /* ignore */ }
}

export function lock() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Shows the question; on the right answer, unlocks and calls onPass(). */
export function gateScreen(onPass) {
  const a = 12 + Math.floor(Math.random() * 18); // 12–29
  const b = 6 + Math.floor(Math.random() * 4); // 6–9
  app.innerHTML = h`
    ${header("#/", "Grown-ups only")}
    <div class="card gate">
      <p class="gate-icon" aria-hidden="true">🔒</p>
      <p>This part is for grown-ups. Please answer to carry on.</p>
      <label class="field gate-q">What is ${a} × ${b}?
        <input id="gate-answer" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Answer" />
      </label>
      <button class="btn primary" id="gate-go">Continue</button>
    </div>
    <p class="muted small center">Children: ask a grown-up to help with this page. 🦔</p>`;
  const input = app.querySelector("#gate-answer");
  const check = () => {
    if (Number(input.value.trim()) === a * b) {
      unlock();
      onPass();
    } else {
      toast("Not quite – try again");
      input.value = "";
      input.focus();
    }
  };
  on("#gate-go", "click", check);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
  input.focus();
}
