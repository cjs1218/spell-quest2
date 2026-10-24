import { YEAR_GROUPS } from "./words.js";
import { trick, trickText } from "./mnemonics.js";
import { trickCardHtml, trickWordHtml } from "./trickview.js";
import {
  getSettings, saveSettings, DEFAULT_SETTINGS, wordState, isDue, summary, growth, daysPractised,
  comebacks, resetProgress, MASTERED_BOX, profiles, currentProfile, switchProfile, addProfile,
  updateProfile, deleteProfile, AVATARS, YEARS, grewToday, seeds, garden, setLastGroup, lastGroup, mistakeCounts,
  mistakeLog, schoolList, setSchoolList,
} from "./store.js";
import { say, cheer, canSpeak, stop, availableVoices, onVoicesChanged } from "./speech.js";
import { sound } from "./sounds.js";
import { chunks, syllabify } from "./syllables.js";
import { getGroups, getGroup, findFamily, allWords, schoolGroup } from "./groups.js";
import { MISTAKE_TYPES } from "./mistakes.js";
import { currentMission } from "./mission.js";
import { companionHtml } from "./companion.js";
import { gamesFor } from "./games.js";
import { startSession } from "./practice.js";
import { picture } from "./pictures.js";
import { todaysPlan, todayFamily } from "./today.js";
import { needsSafetyReminder, dismissSafetyReminder, keepSafeHtml, setupKeepSafe } from "./backup.js";
import { lock } from "./gate.js";
import { app, h, esc, on, go, header, applySettings, PLANTS, seedBadge, toast, beatsLabel } from "./ui.js";

const plantFor = (box) => (box >= MASTERED_BOX ? garden().flower : PLANTS[box]);

// ---------- suggestions from mistake patterns ----------

function suggestion() {
  const counts = Object.entries(mistakeCounts())
    .filter(([t, n]) => n >= 3 && MISTAKE_TYPES[t]?.familyMatch)
    .sort((a, b) => b[1] - a[1]);
  const groups = getGroups();
  const order = [lastGroup(), ...Object.keys(groups)].filter((k, i, a) => k && groups[k] && a.indexOf(k) === i);
  for (const [type] of counts) {
    for (const key of order) {
      const fam = groups[key].families.find((f) =>
        MISTAKE_TYPES[type].familyMatch(f.id) && f.words.some((w) => wordState(w).box < MASTERED_BOX));
      if (fam) return { type, fam };
    }
  }
  return null;
}

// ---------- home ----------

export function homeScreen() {
  const me = currentProfile();
  const groups = getGroups();
  const mission = currentMission();
  const sugg = suggestion();
  const school = groups.school;
  const plan = todaysPlan();

  const yearRows = Object.entries(YEAR_GROUPS).map(([key, g]) => {
    const gr = growth(allWords(g));
    return h`
      <a class="year-row-link" href="#/year/${key}">
        <span class="yr-name">${g.label}</span>
        <span class="meter" aria-hidden="true"><span style="width:${gr.pct}%"></span></span>
        <span class="muted small nowrap">${gr.pct}%</span>
      </a>`;
  });

  const plantsPreview = Object.values(groups).flatMap(allWords)
    .filter((w, i, a) => a.indexOf(w) === i && wordState(w).box > 0)
    .sort((a, b) => wordState(b).box - wordState(a).box)
    .slice(0, 18)
    .map((w) => plantFor(wordState(w).box)).join("");

  const todayDetail = plan.words.length
    ? [plan.reviewCount ? `💧 ${plan.reviewCount} to water` : "", plan.newCount ? `🌱 ${plan.newCount} new` : ""].filter(Boolean).join(" · ")
    : "";

  const schoolRow = school ? (() => {
    const gr = growth(allWords(school));
    return h`
      <a class="year-row-link school" href="#/family/school">
        <span class="yr-name">📝 ${esc(school.label)}</span>
        <span class="meter" aria-hidden="true"><span style="width:${gr.pct}%"></span></span>
        <span class="muted small nowrap">${gr.pct}%</span>
      </a>`;
  })() : "";

  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn avatar-btn" href="#/profiles" aria-label="Change player (${esc(me.name)})">${me.avatar}</a>
      <h1>Spell Quest</h1>
      <a class="icon-btn" href="#/settings" aria-label="Settings">⚙️</a>
    </header>
    ${sugg
      ? `<div class="companion" role="status"><span class="hedgehog" aria-hidden="true">🦔</span><p class="bubble speakable"><span class="say-text">Hi ${esc(me.name)}! ${esc(MISTAKE_TYPES[sugg.type].label)} have been a bit tricky. Shall we practise <a href="#/family/${sugg.fam.id}">${esc(sugg.fam.name)}</a>?</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p></div>`
      : companionHtml("greet")}

    ${plan.words.length ? h`
      <a class="today-btn" href="#/today">
        <span class="today-icon" aria-hidden="true">🌱</span>
        <span><strong>Today's words</strong><small>${todayDetail}</small></span>
      </a>` : h`
      <div class="today-btn done" role="status">
        <span class="today-icon" aria-hidden="true">💧</span>
        <span><strong>All watered for today!</strong><small>Your plants grow again tomorrow. Try a game or pick a family below.</small></span>
      </div>`}

    ${needsSafetyReminder() ? h`
      <div class="card safety-card">
        <p class="small"><strong>Grown-ups:</strong> add Spell Quest to the Home Screen so Safari doesn't clear the garden after a week away.</p>
        <div class="row left"><a class="btn" href="#/grown-ups">Show me how</a><button class="btn subtle" id="dismiss-safety">Hide</button></div>
      </div>` : ""}

    <div class="home-pair">
      <a class="card garden-card" href="#/garden">
        <div class="year-row"><h2>🏡 Garden</h2><span class="seed-pill">🌰 ${seeds()}</span></div>
        <p class="garden">${plantsPreview || '<span class="garden-empty">Plant your first word!</span>'}</p>
      </a>
      <div class="card mission-card ${mission.done ? "done" : ""}">
        <h2>🏅 Mission</h2>
        <p class="small">${esc(mission.text)}${mission.done ? " 🎉" : ""}</p>
        <div class="meter" aria-hidden="true"><span style="width:${(mission.progress / mission.target) * 100}%"></span></div>
        <p class="muted small">${mission.progress} of ${mission.target}</p>
      </div>
    </div>

    <section class="card families-card">
      <h2>Choose a family</h2>
      ${schoolRow}
      ${yearRows.join("")}
    </section>

    <section class="badges" aria-label="Your badges">
      ${daysPractised() ? `<span class="badge">🗓️ Practised on ${daysPractised()} day${daysPractised() === 1 ? "" : "s"}</span>` : ""}
      ${comebacks() ? `<span class="badge">💪 ${comebacks()} comeback word${comebacks() === 1 ? "" : "s"}</span>` : ""}
    </section>
    <div class="home-links">
      <a class="small-link" href="#/help">❓ How to play</a>
      <a class="small-link" href="#/guide">📖 Grown-ups' guide</a>
      <a class="small-link" href="#/grown-ups">🔒 For grown-ups</a>
    </div>`;

  on("#dismiss-safety", "click", () => { dismissSafetyReminder(); homeScreen(); });
}

export function todayScreen() {
  const fam = todayFamily();
  if (!fam.words.length) return go("#/");
  startSession(fam, "today");
}

// "🌻 2 grown · 🌱 3 growing" – counts every stage, not just full flowers.
function growthLine(gr) {
  if (!gr.steps) return `${gr.total} words to plant`;
  const parts = [];
  if (gr.mastered) parts.push(`🌻 ${gr.mastered} fully grown`);
  if (gr.growing) parts.push(`🌱 ${gr.growing} growing`);
  if (gr.notStarted) parts.push(`${gr.notStarted} to plant`);
  return parts.join(" · ");
}

// Four little drops show how many right answers a word has had (4 = a flower).
function pipsHtml(word) {
  const b = Math.min(wordState(word).box, MASTERED_BOX);
  return `<span class="pips" aria-label="${b} of ${MASTERED_BOX} right answers">${
    Array.from({ length: MASTERED_BOX }, (_, i) => `<span class="pip ${i < b ? "on" : ""}"></span>`).join("")}</span>`;
}

// ---------- year group ----------

export function yearScreen(key) {
  const g = getGroup(key);
  if (!g) return go("#/");
  setLastGroup(key);
  const rows = g.families.map((f) => {
    const gr = growth(f.words);
    const due = f.words.filter((w) => isDue(w)).length;
    return h`
      <a class="card family-card" href="#/family/${f.id}">
        <div class="family-info">
          <div class="year-row"><h3>${esc(f.name)}</h3><span class="muted small nowrap">${gr.pct}%</span></div>
          <div class="meter" aria-hidden="true"><span style="width:${gr.pct}%"></span></div>
          <p class="muted small">${growthLine(gr)}${due ? ` · <strong>${due} ready to water 💧</strong>` : ""}</p>
        </div>
        <span class="plants" aria-hidden="true">${f.words.map((w) => plantFor(wordState(w).box)).join("")}</span>
      </a>`;
  });
  const games = gamesFor(g);
  app.innerHTML = h`
    ${header("#/", esc(g.label), seedBadge())}
    <p class="lead">Pick a spelling family. Words in a family follow the same pattern.</p>
    ${rows.join("")}
    ${games.length ? h`
      <h2 class="section-title">🎲 Games</h2>
      <div class="game-grid">
        ${games.map((gm) => `<a class="game-tile" href="#/game/${gm.id}/${key}"><span class="game-icon" aria-hidden="true">${gm.icon}</span><strong>${gm.name}</strong><small>${gm.desc}</small></a>`).join("")}
      </div>` : ""}`;
}

// ---------- family ----------

export function familyScreen(id) {
  const found = findFamily(id);
  if (!found) return go("#/");
  const { groupKey, fam, group } = found;
  const back = group.isSchool ? "#/" : `#/year/${groupKey}`;
  app.innerHTML = h`
    ${header(back, esc(fam.name), seedBadge())}
    <div class="tip card"><span aria-hidden="true">💡</span> ${esc(fam.tip)}</div>
    <button class="btn primary big" id="start">Start practising</button>
    <p class="muted small">Tap a word to see it up close${fam.words.some((w) => trick(w)) ? ", with its memory trick 🧠" : ""}.</p>
    <ul class="word-list">
      ${fam.words.map((w) => h`
        <li>
          <button class="hear" data-word="${esc(w)}" aria-label="Hear ${esc(w)}">🔊</button>
          <a class="word word-link" href="#/word/${encodeURIComponent(w)}/${fam.id}">${chunks(w).map(esc).join('<span class="dot-sep" aria-hidden="true">·</span>')}${trick(w) ? `<span class="has-trick" title="Has a memory trick">🧠</span>` : ""}</a>
          ${picture(w) ? `<span class="pic-small" aria-hidden="true">${picture(w)}</span>` : ""}
          ${grewToday(w) ? `<span class="watered" title="Grown today – it grows again tomorrow" aria-label="Watered today">💧</span>` : ""}
          ${pipsHtml(w)}
          <span aria-hidden="true">${plantFor(wordState(w).box)}</span>
        </li>`).join("")}
    </ul>
    ${group.isSchool ? `<a class="small-link" href="#/school">Grown-ups: change this list</a>` : ""}`;
  on(".hear", "click", (e) => say(e.currentTarget.dataset.word));
  on("#start", "click", () => startSession(fam, groupKey));
}

// ---------- word page ----------

export function wordScreen(rawWord, familyId) {
  const word = decodeURIComponent(rawWord || "");
  const found = findFamily(familyId);
  const fam = found?.fam;
  if (!fam || !fam.words.includes(word)) return go("#/");
  const i = fam.words.indexOf(word);
  const prev = fam.words[i - 1], next = fam.words[i + 1];
  const pic = picture(word);
  const b = Math.min(wordState(word).box, MASTERED_BOX);
  app.innerHTML = h`
    ${header(`#/family/${fam.id}`, esc(fam.name), seedBadge())}
    <div class="word-page">
      ${pic ? `<div class="picture-clue" aria-hidden="true">${pic}</div>` : ""}
      <div class="big-word chopped" id="bigword" aria-label="${esc(word)}">${trick(word) ? trickWordHtml(word) : chunks(word).map((c, n) => `<span class="syl syl-${n % 2}">${[...c].map((l) => `<span class="letter">${esc(l)}</span>`).join("")}</span>`).join("")}</div>
      <p class="beats muted center">${beatsLabel(chunks(word).length)} · ${plantFor(wordState(word).box)} ${b} of ${MASTERED_BOX}</p>
      <div class="row"><button class="btn" id="hear">🔊 Hear it</button><button class="btn" id="spell">🔤 Spell it with me</button></div>
      ${trick(word) ? trickCardHtml(word) : h`
        <div class="card trick-card make-own">
          <div class="trick-picture" aria-hidden="true">💭</div>
          <div class="trick-body">
            <p class="trick-label">🧠 Make your own trick</p>
            <p class="small">No famous trick for this one! Can you spot a little word hiding inside it, or make up a silly sentence?</p>
          </div>
        </div>`}
      <button class="btn primary big" id="practise">Practise this word</button>
      <div class="row word-nav">
        ${prev ? `<a class="btn subtle" href="#/word/${encodeURIComponent(prev)}/${fam.id}">← ${esc(prev)}</a>` : "<span></span>"}
        ${next ? `<a class="btn subtle" href="#/word/${encodeURIComponent(next)}/${fam.id}">${esc(next)} →</a>` : "<span></span>"}
      </div>
    </div>`;
  say(word);
  on("#hear", "click", () => { stop(); say(word); });
  on("#spell", "click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    await say(word);
    for (const el of app.querySelectorAll("#bigword .letter")) {
      el.classList.add("lit");
      await say(el.textContent.toLowerCase(), { rate: 0.7 });
      el.classList.remove("lit");
    }
    await say(word);
    btn.disabled = false;
  });
  on("#practise", "click", () => startSession(fam, found.groupKey, [word]));
}

const yearOptions = (chosen) =>
  `<option value="" ${!chosen ? "selected" : ""}>Not set</option>` +
  Object.entries(YEARS).map(([k, label]) => `<option value="${k}" ${k === chosen ? "selected" : ""}>${label}</option>`).join("");

// ---------- profiles (sibling support) ----------

export function profilesScreen() {
  const me = currentProfile();
  app.innerHTML = h`
    ${header("#/", "Who's practising?")}
    <div class="profile-grid">
      ${profiles().map((p) => `<button class="profile-btn ${p.id === me.id ? "current" : ""}" data-id="${p.id}">
        <span class="profile-avatar" aria-hidden="true">${p.avatar}</span><span>${esc(p.name)}</span></button>`).join("")}
    </div>
    <details class="card add-profile">
      <summary><strong>➕ Add a child</strong></summary>
      <label class="field">Name <input id="pname" maxlength="20" autocomplete="off" /></label>
      <p class="muted">Pick a picture:</p>
      <div class="avatar-pick">${AVATARS.map((a, i) => `<label><input type="radio" name="av" value="${a}" ${i === 0 ? "checked" : ""}/><span>${a}</span></label>`).join("")}</div>
      <label class="field">School year <select id="pyear">${yearOptions(null)}</select></label>
      <button class="btn primary" id="add">Add</button>
    </details>
    <p class="muted small">Each child gets their own garden, progress and settings on this device. Grown-ups can rename or remove children on the grown-ups page.</p>`;
  on(".profile-btn", "click", (e) => {
    switchProfile(e.currentTarget.dataset.id);
    sessionStorage.setItem("spellquest.picked", "1");
    applySettings();
    schoolGroup();
    go("#/");
  });
  on("#add", "click", () => {
    const name = app.querySelector("#pname").value.trim();
    if (!name) return toast("Type a name first");
    addProfile(name, app.querySelector("input[name=av]:checked").value, app.querySelector("#pyear").value || null);
    sessionStorage.setItem("spellquest.picked", "1");
    applySettings();
    go("#/");
  });
}

// ---------- settings ----------

function voiceOptions(chosen) {
  const voices = availableVoices();
  const natural = (v) => /natural|neural|premium|enhanced|online/i.test(v.name);
  const label = (v) => `${natural(v) ? "⭐ " : ""}${v.name.replace(/^(Microsoft|Google)\s+/, "").replace(/\s*\(.*?\)\s*/g, " ").trim()} (${v.lang})`;
  return `<option value="" ${!chosen ? "selected" : ""}>Best available (automatic)</option>` +
    voices.map((v) => `<option value="${esc(v.name)}" ${v.name === chosen ? "selected" : ""}>${esc(label(v))}</option>`).join("");
}

export function settingsScreen() {
  const s = getSettings();
  const opt = (name, value, label) =>
    `<label class="choice"><input type="radio" name="${name}" value="${value}" ${String(s[name]) === String(value) ? "checked" : ""}/> ${label}</label>`;
  app.innerHTML = h`
    ${header("#/", "Settings")}
    <fieldset class="card"><legend>Background colour</legend>
      ${opt("tint", "cream", "Cream")}${opt("tint", "blue", "Blue")}${opt("tint", "green", "Green")}
      ${opt("tint", "peach", "Peach")}${opt("tint", "grey", "Grey")}${opt("tint", "dark", "Dark")}
    </fieldset>
    <fieldset class="card"><legend>Letters</legend>
      ${opt("font", "lexend", `<span class="font-preview-lexend">Lexend</span>`)}${opt("font", "atkinson", `<span class="font-preview-atkinson">Atkinson Hyperlegible</span>`)}
      ${opt("font", "opendyslexic", `<span class="font-preview-opendyslexic">OpenDyslexic</span>`)}${opt("font", "system", "Device font")}
      <p class="muted small">OpenDyslexic is a font made for dyslexic readers: heavier letter bottoms help stop b, d, p and q flipping. Try each and pick the one that feels easiest to read.</p>
    </fieldset>
    <fieldset class="card"><legend>Letter spacing</legend>
      ${opt("spacing", "normal", "Normal")}${opt("spacing", "wide", "Wide")}
    </fieldset>
    <fieldset class="card"><legend>Text size</legend>
      ${opt("textSize", 1, "Medium")}${opt("textSize", 1.15, "Large")}${opt("textSize", 1.35, "Extra large")}
    </fieldset>
    <fieldset class="card"><legend>Voice</legend>
      ${canSpeak() ? h`
        <label class="field">Choose a voice
          <select id="voice">${voiceOptions(s.voice)}</select>
        </label>
        <button class="btn" id="try-voice">🔊 Try this voice</button>
        <p class="muted small">Voices marked ⭐ sound the most natural. On iPad and iPhone you can download nicer voices in Settings → Accessibility → Spoken Content → Voices → English (UK).</p>
      ` : `<p class="muted">This device can't talk, so sound is switched off.</p>`}
    </fieldset>
    <fieldset class="card"><legend>Voice style</legend>
      ${opt("lively", true, "Lively and excited 🎉")}${opt("lively", false, "Calm")}
    </fieldset>
    <fieldset class="card"><legend>Talking speed</legend>
      ${opt("speechRate", 0.65, "Slow")}${opt("speechRate", 0.8, "Steady")}${opt("speechRate", 1, "Normal")}
    </fieldset>
    <fieldset class="card"><legend>Sound effects</legend>
      ${opt("sounds", true, "On 🔔")}${opt("sounds", false, "Off")}
    </fieldset>
    <fieldset class="card"><legend>Read instructions aloud</legend>
      ${opt("readAloud", true, "On 🔊")}${opt("readAloud", false, "Off")}
      <p class="muted small">Instructions are read out the first time they appear. Every 🔊 button reads its words out.</p>
    </fieldset>
    <fieldset class="card"><legend>Calm mode</legend>
      ${opt("calm", false, "Off")}${opt("calm", true, "On – fewer animations")}
    </fieldset>
    <button class="btn subtle" id="reset-settings">Reset settings</button>`;

  on("input[type=radio]", "change", (e) => {
    const { name, value } = e.target;
    const v = ["textSize", "speechRate"].includes(name) ? Number(value)
      : ["calm", "lively", "sounds", "readAloud"].includes(name) ? value === "true" : value;
    saveSettings({ [name]: v });
    applySettings();
    stop();
    if (name === "speechRate") say("This is how fast I talk.");
    if (name === "lively") cheer(v ? "Hooray! Brilliant spelling!" : "Well done. Brilliant spelling.");
    if (name === "sounds" && v) sound("correct");
  });
  on("#voice", "change", (e) => {
    saveSettings({ voice: e.target.value || null });
    stop();
    cheer("Hello! I'm Hazel. Let's grow some words!");
  });
  on("#try-voice", "click", () => {
    stop();
    sound("correct");
    cheer(`Fantastic spelling, ${currentProfile().name}! You're a star!`);
  });
  // Voices sometimes load a moment after the page.
  const off = onVoicesChanged(() => {
    const sel = app.querySelector("#voice");
    if (sel) sel.innerHTML = voiceOptions(getSettings().voice);
    else off();
  });
  on("#reset-settings", "click", () => {
    saveSettings(DEFAULT_SETTINGS);
    applySettings();
    settingsScreen();
  });
}

// ---------- grown-ups ----------

export function grownUpsScreen() {
  const me = currentProfile();
  const groups = getGroups();
  const school = schoolList();

  const progress = Object.entries(groups).map(([key, g]) => {
    const words = allWords(g);
    const tricky = words
      .filter((w) => wordState(w).misses > 0 && wordState(w).box < MASTERED_BOX)
      .sort((a, b) => wordState(b).misses - wordState(a).misses)
      .slice(0, 10);
    const { mastered, growing, total } = summary(words);
    return h`
      <div class="progress-row">
        <h3>${esc(g.label)}</h3>
        <p>${mastered} mastered · ${growing} in progress · ${total - mastered - growing} not started</p>
        ${tricky.length ? `<p><strong>Needs practice:</strong> ${tricky.map(esc).join(", ")}</p>` : ""}
      </div>`;
  });

  const counts = Object.entries(mistakeCounts()).sort((a, b) => b[1] - a[1]);
  const patterns = counts.length ? counts.map(([type, n]) => {
    const info = MISTAKE_TYPES[type] || MISTAKE_TYPES.other;
    const examples = mistakeLog().filter((m) => m.types.includes(type)).slice(0, 3)
      .map((m) => `<span class="eg"><s>${esc(m.answer)}</s> → ${esc(m.word)}</span>`).join(" ");
    let famLink = "";
    for (const [, g] of Object.entries(groups)) {
      const f = g.families.find((x) => info.familyMatch(x.id));
      if (f && (!lastGroup() || g === groups[lastGroup()] || !famLink)) famLink = `<a href="#/family/${f.id}">Practise “${esc(f.name)}”</a>`;
    }
    return h`
      <div class="pattern">
        <div class="year-row"><strong>${info.label}</strong><span class="muted">${n} time${n === 1 ? "" : "s"}</span></div>
        ${examples ? `<p class="small">${examples}</p>` : ""}
        <p class="small muted">${esc(info.advice)} ${famLink}</p>
      </div>`;
  }).join("") : `<p class="muted">No mistakes recorded yet. Patterns will appear here as ${esc(me.name)} practises.</p>`;

  app.innerHTML = h`
    ${header("#/", "For grown-ups", `<button class="icon-btn" id="lock" aria-label="Lock grown-ups area">🔒</button>`)}
    <p class="muted">Showing <strong>${me.avatar} ${esc(me.name)}</strong>. <a href="#/profiles">Switch child</a> · <a href="#/guide">📖 Grown-ups' guide</a></p>

    ${keepSafeHtml()}

    <section class="card">
      <h2>📝 School spelling list</h2>
      ${school ? `<p><strong>${esc(school.name)}</strong>: ${school.words.map(esc).join(", ")}</p>` : `<p class="muted">Add this week's spelling test words and they'll appear at the top of ${esc(me.name)}'s home screen.</p>`}
      <a class="btn" href="#/school">${school ? "Change the list" : "Add a list"}</a>
    </section>

    <section class="card">
      <h2>🔍 Patterns spotted</h2>
      ${patterns}
    </section>

    <section class="card">
      <h2>🖨️ Printable practice sheets</h2>
      <p class="muted">A sheet with each word chopped into syllables, a line to trace, space to write it twice, and memory tricks.</p>
      <div class="row left">
        <a class="btn" href="#/print/tricky">Tricky words</a>
        ${school ? `<a class="btn" href="#/print/school">School list</a>` : ""}
        <a class="btn" href="#/print/growing">Words in progress</a>
      </div>
    </section>

    <section class="card">
      <h2>📊 Progress</h2>
      ${progress.join("")}
    </section>

    <section class="card">
      <h2>👧👦 Children on this device</h2>
      <p class="muted small">The school year decides which new words appear in "Today's words".</p>
      ${profiles().map((p) => h`
        <div class="manage-row">
          <span class="profile-avatar small" aria-hidden="true">${p.avatar}</span>
          <input class="rename" data-id="${p.id}" value="${esc(p.name)}" maxlength="20" aria-label="Name" />
          <select class="year-select" data-id="${p.id}" aria-label="School year for ${esc(p.name)}">${yearOptions(p.year)}</select>
          ${profiles().length > 1 ? `<button class="btn subtle remove" data-id="${p.id}" aria-label="Remove ${esc(p.name)}">🗑️</button>` : ""}
        </div>`).join("")}
      <a class="btn" href="#/profiles">➕ Add a child</a>
    </section>

    <section class="card">
      <h2>How it works</h2>
      <ul>
        <li>Words are grouped into spelling families from the National Curriculum Year 1–2 common exception words and Year 3–6 statutory lists.</li>
        <li>Each word is seen, heard, chopped into syllables and spelt aloud letter by letter (Simultaneous Oral Spelling) before it's hidden.</li>
        <li>Help fades as a word grows: syllable chunks, then letter tiles, then typing. "Show me again" is always available with no penalty.</li>
        <li>Spaced repetition brings words back after 1, 2, 4 and 7 days. A word can only grow one step a day; extra practice the same day counts as watering. A mistake moves a word back one step, never to the start.</li>
        <li>"Today's words" picks words that are due again from every year, then new words from the school list and the child's year.</li>
        <li>Mistakes are sorted into patterns (double letters, silent letters, vowels, letter order, endings) to suggest what to practise next.</li>
        <li>No timers, no lives, no ads, no accounts. Everything is stored only on this device.</li>
      </ul>
    </section>
    <button class="btn subtle" id="reset">Reset ${esc(me.name)}'s progress</button>`;

  setupKeepSafe(app, (restored) => {
    if (restored) { applySettings(); schoolGroup(); }
    grownUpsScreen();
  });
  on("#lock", "click", () => { lock(); go("#/"); });
  on(".year-select", "change", (e) => {
    updateProfile(e.target.dataset.id, { year: e.target.value });
    toast("School year saved");
  });
  on(".rename", "change", (e) => {
    updateProfile(e.target.dataset.id, { name: e.target.value });
    toast("Name saved");
  });
  on(".remove", "click", (e) => {
    const p = profiles().find((x) => x.id === e.currentTarget.dataset.id);
    if (confirm(`Remove ${p.name} and their garden from this device?`)) {
      deleteProfile(p.id);
      applySettings();
      grownUpsScreen();
    }
  });
  on("#reset", "click", () => {
    if (confirm(`Reset all of ${me.name}'s spelling progress and garden?`)) {
      resetProgress();
      grownUpsScreen();
    }
  });
}

// ---------- school list editor ----------

function parseList(text) {
  const words = [];
  const splits = {};
  for (const raw of text.split(/[\n,;]+/)) {
    const entry = raw.trim().replace(/\s+/g, "");
    if (!entry || !/^[A-Za-z'’-]+$/.test(entry)) continue;
    const word = entry.replace(/-/g, "");
    if (words.includes(word)) continue;
    words.push(word);
    if (entry.includes("-")) splits[word] = entry.split("-").filter(Boolean);
  }
  return { words: words.slice(0, 40), splits };
}

export function schoolScreen() {
  const list = schoolList();
  const initial = list ? list.words.map((w) => (list.splits?.[w] ? list.splits[w].join("-") : w)).join("\n") : "";
  app.innerHTML = h`
    ${header("#/grown-ups", "School spelling list")}
    <p class="muted">Type this week's words, one per line. They'll appear at the top of the home screen with all the same help: chopping, tiles, games and spaced practice.</p>
    <label class="field">List name <input id="lname" maxlength="40" placeholder="e.g. Week 6 spellings" value="${esc(list?.name || "")}" /></label>
    <label class="field">Words <textarea id="lwords" rows="8" placeholder="because&#10;friend&#10;e-nough">${esc(initial)}</textarea></label>
    <p class="muted small">The app chops words into syllables automatically. To change how a word is chopped, type dashes, e.g. <strong>be-cause</strong>.</p>
    <h3>Preview</h3>
    <div id="preview" class="preview card"></div>
    <div class="row left">
      <button class="btn primary" id="save">Save list</button>
      ${list ? `<button class="btn subtle" id="clear">Remove list</button>` : ""}
    </div>`;

  const nameEl = app.querySelector("#lname");
  const wordsEl = app.querySelector("#lwords");
  const preview = () => {
    const { words, splits } = parseList(wordsEl.value);
    app.querySelector("#preview").innerHTML = words.length
      ? words.map((w) => `<span class="preview-word">${(splits[w] || syllabify(w)).map(esc).join('<span class="dot-sep">·</span>')}</span>`).join("")
      : `<span class="muted">Words will appear here as you type.</span>`;
  };
  wordsEl.addEventListener("input", preview);
  preview();

  on("#save", "click", () => {
    const { words, splits } = parseList(wordsEl.value);
    if (!words.length) return toast("Add at least one word");
    setSchoolList({ name: nameEl.value.trim() || "This week's spellings", words, splits });
    schoolGroup();
    toast("List saved");
    go("#/");
  });
  on("#clear", "click", () => {
    if (confirm("Remove the school list?")) {
      setSchoolList(null);
      go("#/grown-ups");
    }
  });
}

// ---------- printable practice sheet ----------

export function printScreen(source = "tricky") {
  const me = currentProfile();
  const groups = getGroups();
  const every = Object.values(groups).flatMap(allWords).filter((w, i, a) => a.indexOf(w) === i);
  let words = [];
  let title = "";
  if (source === "school" && groups.school) {
    words = allWords(groups.school);
    title = groups.school.label;
  } else if (source === "growing") {
    words = every.filter((w) => wordState(w).box > 0 && wordState(w).box < MASTERED_BOX);
    title = "Words in progress";
  } else {
    words = every.filter((w) => wordState(w).misses > 0 && wordState(w).box < MASTERED_BOX)
      .sort((a, b) => wordState(b).misses - wordState(a).misses);
    title = "Tricky words";
  }
  words = words.slice(0, 12);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  app.innerHTML = h`
    <div class="no-print">
      ${header("#/grown-ups", "Practice sheet")}
      <div class="row left">
        <a class="btn ${source === "tricky" ? "primary" : ""}" href="#/print/tricky">Tricky words</a>
        ${groups.school ? `<a class="btn ${source === "school" ? "primary" : ""}" href="#/print/school">School list</a>` : ""}
        <a class="btn ${source === "growing" ? "primary" : ""}" href="#/print/growing">In progress</a>
      </div>
      ${words.length ? `<button class="btn primary big" id="print">🖨️ Print</button>` : ""}
    </div>
    ${words.length ? h`
      <article class="sheet-print">
        <header class="sheet-head">
          <h1>🌻 ${esc(title)}</h1>
          <p>${esc(me.name)} · ${date}</p>
        </header>
        <p class="sheet-instructions">Say the word. Chop it into beats. Trace it. Cover it and write it. Check it!</p>
        <table class="sheet-table">
          <thead><tr><th>Word</th><th>Trace it</th><th>Write it</th><th>Write it again</th><th>✓</th></tr></thead>
          <tbody>
            ${words.map((w) => h`
              <tr>
                <td class="sheet-word">${chunks(w).map((c, i) => `<span class="psyl psyl-${i % 2}">${esc(c)}</span>`).join("")}
                  ${trickText(w) ? `<div class="sheet-trick">🧠 ${esc(trickText(w))}</div>` : ""}</td>
                <td class="trace">${esc(w)}</td>
                <td class="write"></td>
                <td class="write"></td>
                <td class="tick"></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </article>` : `<p class="card muted">No words here yet. ${source === "tricky" ? "Tricky words appear after some practice." : ""} Try another list above.</p>`}`;
  on("#print", "click", () => window.print());
}
