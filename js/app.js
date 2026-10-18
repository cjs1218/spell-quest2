import { YEAR_GROUPS, MNEMONICS } from "./words.js";
import {
  getSettings, saveSettings, DEFAULT_SETTINGS, wordState, isDue, recordAttempt,
  summary, daysPractised, comebacks, resetProgress, MASTERED_BOX,
} from "./store.js";
import { say, sayLetter, stop, canSpeak } from "./speech.js";

const app = document.getElementById("app");
const SESSION_SIZE = 5;
const PLANTS = ["🟫", "🌱", "🌿", "🌷", "🌻"]; // by Leitner box

// ---------- helpers ----------

const h = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (vals[i] ?? ""), "");
const allWords = (group) => group.families.flatMap((f) => f.words);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const findFamily = (id) => {
  for (const [key, g] of Object.entries(YEAR_GROUPS)) {
    const fam = g.families.find((f) => f.id === id);
    if (fam) return { groupKey: key, fam };
  }
  return null;
};

function applySettings() {
  const s = getSettings();
  const root = document.documentElement;
  root.dataset.font = s.font;
  root.dataset.tint = s.tint;
  root.dataset.spacing = s.spacing;
  root.style.setProperty("--text-scale", s.textSize);
}

function on(selector, event, handler) {
  app.querySelectorAll(selector).forEach((el) => el.addEventListener(event, handler));
}

function go(hash) {
  stop();
  location.hash = hash;
}

// ---------- screens ----------

function homeScreen() {
  const cards = Object.entries(YEAR_GROUPS).map(([key, g]) => {
    const words = allWords(g);
    const { mastered, growing } = summary(words);
    const garden = words
      .filter((w) => wordState(w).box > 0)
      .map((w) => PLANTS[wordState(w).box])
      .join("");
    return h`
      <a class="card year-card" href="#/year/${key}">
        <h2>${g.label}</h2>
        <p class="garden" aria-label="${mastered} flowers fully grown, ${growing} still growing">${garden || '🟫🟫🟫 <span class="garden-empty">Plant your first word!</span>'}</p>
        <p class="muted">${mastered} grown · ${growing} growing · ${words.length} words</p>
      </a>`;
  });

  const days = daysPractised();
  const backs = comebacks();
  app.innerHTML = h`
    <header class="top">
      <span></span>
      <h1>Spell Quest <span aria-hidden="true">🌻</span></h1>
      <a class="icon-btn" href="#/settings" aria-label="Settings">⚙️</a>
    </header>
    <p class="lead">Grow a garden by learning your spellings. Every word you learn becomes a flower!</p>
    ${cards.join("")}
    <section class="badges" aria-label="Your badges">
      ${days ? `<span class="badge">🗓️ Practised on ${days} day${days === 1 ? "" : "s"}</span>` : ""}
      ${backs ? `<span class="badge">💪 ${backs} comeback word${backs === 1 ? "" : "s"}</span>` : ""}
    </section>
    <a class="small-link" href="#/grown-ups">For grown-ups</a>`;
}

function yearScreen(key) {
  const g = YEAR_GROUPS[key];
  if (!g) return go("#/");
  const rows = g.families.map((f) => {
    const { mastered, total } = summary(f.words);
    const due = f.words.filter((w) => isDue(w)).length;
    return h`
      <a class="card family-card" href="#/family/${f.id}">
        <div>
          <h3>${f.name}</h3>
          <p class="muted">${mastered} of ${total} grown${due ? ` · <strong>${due} ready to water 💧</strong>` : ""}</p>
        </div>
        <span class="plants" aria-hidden="true">${f.words.map((w) => PLANTS[wordState(w).box]).join("")}</span>
      </a>`;
  });
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/" aria-label="Back">⬅️</a>
      <h1>${g.label}</h1>
      <span></span>
    </header>
    <p class="lead">Pick a spelling family. Words in a family follow the same pattern.</p>
    ${rows.join("")}`;
}

function familyScreen(id) {
  const found = findFamily(id);
  if (!found) return go("#/");
  const { groupKey, fam } = found;
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/year/${groupKey}" aria-label="Back">⬅️</a>
      <h1>${fam.name}</h1>
      <span></span>
    </header>
    <div class="tip card"><span aria-hidden="true">💡</span> ${fam.tip}</div>
    <button class="btn primary big" id="start">Start practising</button>
    <ul class="word-list">
      ${fam.words.map((w) => h`
        <li>
          <button class="hear" data-word="${w}" aria-label="Hear ${w}">🔊</button>
          <span class="word">${w}</span>
          <span aria-hidden="true">${PLANTS[wordState(w).box]}</span>
        </li>`).join("")}
    </ul>`;
  on(".hear", "click", (e) => say(e.currentTarget.dataset.word));
  on("#start", "click", () => startSession(fam, groupKey));
}

// ---------- practice session ----------

function pickSessionWords(fam) {
  const due = fam.words.filter((w) => isDue(w));
  const fresh = fam.words.filter((w) => wordState(w).seen === 0);
  let picked = [...shuffle(due), ...fresh].slice(0, SESSION_SIZE);
  if (picked.length < SESSION_SIZE) {
    const rest = shuffle(fam.words.filter((w) => !picked.includes(w)));
    picked = [...picked, ...rest].slice(0, SESSION_SIZE);
  }
  return picked;
}

function startSession(fam, groupKey) {
  const session = { fam, groupKey, words: pickSessionWords(fam), index: 0, results: [] };
  learnStep(session);
}

function progressDots(session) {
  return `<div class="dots" aria-label="Word ${session.index + 1} of ${session.words.length}">${session.words
    .map((_, i) => `<span class="dot ${i < session.index ? "done" : i === session.index ? "now" : ""}"></span>`)
    .join("")}</div>`;
}

// Step 1: look, listen and spell it aloud together (SOS).
function learnStep(session) {
  const word = session.words[session.index];
  const trick = MNEMONICS[word];
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/family/${session.fam.id}" aria-label="Stop practising">✖️</a>
      ${progressDots(session)}
      <span></span>
    </header>
    <p class="step-label">Look and listen</p>
    <div class="big-word" id="bigword">${[...word].map((c) => `<span class="letter">${c}</span>`).join("")}</div>
    <div class="row">
      <button class="btn" id="hear">🔊 Hear it</button>
      <button class="btn" id="sos">🔤 Spell it with me</button>
    </div>
    ${trick ? `<div class="tip card"><span aria-hidden="true">🧠</span> ${trick}</div>` : ""}
    <button class="btn primary big" id="ready">I'm ready! Hide the word</button>`;

  say(word);
  on("#hear", "click", () => say(word));
  on("#sos", "click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    await say(word);
    const letters = app.querySelectorAll("#bigword .letter");
    for (const el of letters) {
      el.classList.add("lit");
      await sayLetter(el.textContent);
      await sleep(150);
      el.classList.remove("lit");
    }
    await say(word);
    btn.disabled = false;
  });
  on("#ready", "click", () => attemptStep(session, 1));
}

// Step 2: spell it. New words use letter tiles; once a word is growing, type it.
function attemptStep(session, attempt) {
  const word = session.words[session.index];
  const useTiles = wordState(word).box < 2;
  stop();
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/family/${session.fam.id}" aria-label="Stop practising">✖️</a>
      ${progressDots(session)}
      <span></span>
    </header>
    <p class="step-label">${useTiles ? "Build the word" : "Write the word"}</p>
    <button class="btn" id="hear">🔊 Hear it again</button>
    ${useTiles ? tilesHtml(word) : typeHtml()}
    <button class="btn primary big" id="check" disabled>Check</button>`;

  say(word);
  on("#hear", "click", () => say(word));
  const getAnswer = useTiles ? setupTiles(word) : setupTyping();
  on("#check", "click", () => feedbackStep(session, attempt, getAnswer()));
}

function tilesHtml(word) {
  return h`
    <div class="answer-slots" id="slots" aria-live="polite">${[...word].map(() => `<span class="slot"></span>`).join("")}</div>
    <div class="tiles" id="tiles">
      ${shuffle([...word]).map((c, i) => `<button class="tile" data-i="${i}">${c}</button>`).join("")}
    </div>
    <button class="btn subtle" id="undo">↩️ Undo</button>`;
}

function setupTiles(word) {
  const placed = []; // tile buttons in order
  const slots = [...app.querySelectorAll(".slot")];
  const check = app.querySelector("#check");
  const render = () => {
    slots.forEach((s, i) => (s.textContent = placed[i]?.textContent ?? ""));
    check.disabled = placed.length !== word.length;
  };
  on(".tile", "click", (e) => {
    const t = e.currentTarget;
    if (t.disabled || placed.length >= word.length) return;
    t.disabled = true;
    placed.push(t);
    sayLetter(t.textContent);
    render();
  });
  on("#undo", "click", () => {
    const t = placed.pop();
    if (t) t.disabled = false;
    render();
  });
  return () => placed.map((t) => t.textContent).join("");
}

function typeHtml() {
  return `<input class="type-box" id="typed" type="text" autocomplete="off" autocapitalize="off"
            autocorrect="off" spellcheck="false" aria-label="Type the word" />`;
}

function setupTyping() {
  const input = app.querySelector("#typed");
  const check = app.querySelector("#check");
  input.focus();
  input.addEventListener("input", () => (check.disabled = input.value.trim() === ""));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !check.disabled) check.click();
  });
  return () => input.value.trim();
}

// Step 3: warm, gentle feedback. Mistakes show which letters were already right.
function feedbackStep(session, attempt, answer) {
  const word = session.words[session.index];
  const correct = answer.toLowerCase() === word.toLowerCase();
  if (attempt === 1) {
    const state = recordAttempt(word, correct);
    session.results.push({ word, correct, box: state.box });
  }

  if (correct) {
    const box = wordState(word).box;
    const msg = box >= MASTERED_BOX ? "Your flower is fully grown! 🌻" : `Your plant grew! ${PLANTS[box]}`;
    app.innerHTML = h`
      <div class="celebrate">
        <div class="burst" aria-hidden="true">✨${PLANTS[box]}✨</div>
        <h2>${attempt === 1 ? "Brilliant!" : "You got it!"}</h2>
        <p class="big-word small">${word}</p>
        <p>${msg}</p>
        <button class="btn primary big" id="next">Next</button>
      </div>`;
    say(attempt === 1 ? "Brilliant!" : "You got it!");
    on("#next", "click", () => nextWord(session));
    return;
  }

  // Letter-by-letter comparison: green = right letter in the right place.
  const compare = [...word]
    .map((c, i) => `<span class="letter ${answer[i]?.toLowerCase() === c.toLowerCase() ? "good" : "fix"}">${c}</span>`)
    .join("");
  app.innerHTML = h`
    <div class="feedback">
      <h2>So close! Let's look together.</h2>
      <p class="muted">You wrote: <span class="yours">${answer.replace(/</g, "&lt;")}</span></p>
      <div class="big-word">${compare}</div>
      <p class="muted">The <span class="good-key">green</span> letters you got right. Look at the <span class="fix-key">orange</span> ones.</p>
      <div class="row">
        <button class="btn" id="hear">🔊 Hear it</button>
        ${attempt === 1 ? `<button class="btn primary" id="retry">Try again</button>` : ""}
        <button class="btn ${attempt === 1 ? "" : "primary"}" id="next">${attempt === 1 ? "Skip for now" : "Next word"}</button>
      </div>
    </div>`;
  on("#hear", "click", () => say(word));
  on("#retry", "click", () => attemptStep(session, 2));
  on("#next", "click", () => nextWord(session));
}

function nextWord(session) {
  session.index += 1;
  if (session.index < session.words.length) learnStep(session);
  else endScreen(session);
}

function endScreen(session) {
  const right = session.results.filter((r) => r.correct).length;
  app.innerHTML = h`
    <div class="celebrate">
      <div class="burst" aria-hidden="true">${session.results.map((r) => PLANTS[r.box]).join(" ")}</div>
      <h2>Great practice!</h2>
      <p>You practised ${session.results.length} words and spelt ${right} first time.</p>
      <p class="muted">Words you found tricky will come back soon so they can keep growing.</p>
      <div class="row">
        <button class="btn primary big" id="again">Practise more</button>
        <a class="btn" href="#/year/${session.groupKey}">Back to families</a>
      </div>
    </div>`;
  say("Great practice!");
  on("#again", "click", () => startSession(session.fam, session.groupKey));
}

// ---------- settings & info ----------

function settingsScreen() {
  const s = getSettings();
  const opt = (name, value, label) =>
    `<label class="choice"><input type="radio" name="${name}" value="${value}" ${String(s[name]) === String(value) ? "checked" : ""}/> ${label}</label>`;
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/" aria-label="Back">⬅️</a>
      <h1>Settings</h1>
      <span></span>
    </header>
    <fieldset class="card"><legend>Background colour</legend>
      ${opt("tint", "cream", "Cream")}${opt("tint", "blue", "Blue")}${opt("tint", "green", "Green")}
      ${opt("tint", "peach", "Peach")}${opt("tint", "grey", "Grey")}${opt("tint", "dark", "Dark")}
    </fieldset>
    <fieldset class="card"><legend>Letters</legend>
      ${opt("font", "lexend", "Lexend")}${opt("font", "atkinson", "Atkinson Hyperlegible")}${opt("font", "system", "Device font")}
    </fieldset>
    <fieldset class="card"><legend>Letter spacing</legend>
      ${opt("spacing", "normal", "Normal")}${opt("spacing", "wide", "Wide")}
    </fieldset>
    <fieldset class="card"><legend>Text size</legend>
      ${opt("textSize", 1, "Medium")}${opt("textSize", 1.15, "Large")}${opt("textSize", 1.35, "Extra large")}
    </fieldset>
    <fieldset class="card"><legend>Talking speed</legend>
      ${opt("speechRate", 0.65, "Slow")}${opt("speechRate", 0.8, "Steady")}${opt("speechRate", 1, "Normal")}
      ${canSpeak() ? "" : `<p class="muted">This device can't talk, so sound is switched off.</p>`}
    </fieldset>
    <button class="btn subtle" id="reset-settings">Reset settings</button>`;

  on("input[type=radio]", "change", (e) => {
    const { name, value } = e.target;
    saveSettings({ [name]: ["textSize", "speechRate"].includes(name) ? Number(value) : value });
    applySettings();
    if (name === "speechRate") say("This is how fast I talk.");
  });
  on("#reset-settings", "click", () => {
    saveSettings(DEFAULT_SETTINGS);
    applySettings();
    settingsScreen();
  });
}

function grownUpsScreen() {
  const rows = Object.values(YEAR_GROUPS).map((g) => {
    const tricky = allWords(g)
      .filter((w) => wordState(w).misses > 0 && wordState(w).box < MASTERED_BOX)
      .sort((a, b) => wordState(b).misses - wordState(a).misses)
      .slice(0, 10);
    const { mastered, growing, total } = summary(allWords(g));
    return h`
      <section class="card">
        <h2>${g.label}</h2>
        <p>${mastered} mastered · ${growing} in progress · ${total - mastered - growing} not started</p>
        ${tricky.length ? `<p><strong>Needs practice:</strong> ${tricky.join(", ")}</p>` : ""}
      </section>`;
  });
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/" aria-label="Back">⬅️</a>
      <h1>For grown-ups</h1>
      <span></span>
    </header>
    ${rows.join("")}
    <section class="card">
      <h2>How it works</h2>
      <ul>
        <li>Words are grouped into spelling families from the National Curriculum statutory lists.</li>
        <li>Each word is seen, heard and spelt aloud letter by letter (Simultaneous Oral Spelling) before it's hidden.</li>
        <li>New words are built from letter tiles. Once a word is growing, the child types it.</li>
        <li>Spaced repetition brings words back after 1, 2, 4 and 7 days. A mistake moves a word back one step, never to the start.</li>
        <li>There are no timers, no lives and no ads. Progress is stored only on this device.</li>
      </ul>
    </section>
    <button class="btn subtle" id="reset">Reset all progress</button>`;
  on("#reset", "click", () => {
    if (confirm("Reset all spelling progress on this device?")) {
      resetProgress();
      grownUpsScreen();
    }
  });
}

// ---------- router ----------

function route() {
  const [, screen, param] = (location.hash || "#/").split("/");
  if (screen === "year") yearScreen(param);
  else if (screen === "family") familyScreen(param);
  else if (screen === "settings") settingsScreen();
  else if (screen === "grown-ups") grownUpsScreen();
  else homeScreen();
  window.scrollTo(0, 0);
}

applySettings();
window.addEventListener("hashchange", () => { stop(); route(); });
route();
