import { MNEMONICS, YEAR_GROUPS } from "./words.js";
import {
  getSettings, saveSettings, DEFAULT_SETTINGS, wordState, isDue, summary, daysPractised,
  comebacks, resetProgress, MASTERED_BOX, profiles, currentProfile, switchProfile, addProfile,
  updateProfile, deleteProfile, AVATARS, seeds, garden, setLastGroup, lastGroup, mistakeCounts,
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
import { app, h, esc, on, go, header, applySettings, PLANTS, seedBadge, toast } from "./ui.js";

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

  const yearCards = Object.entries(YEAR_GROUPS).map(([key, g]) => {
    const words = allWords(g);
    const { mastered, growing } = summary(words);
    const pct = Math.round(((mastered + growing * 0.4) / words.length) * 100);
    return h`
      <a class="card year-card" href="#/year/${key}">
        <div class="year-row"><h2>${g.label}</h2><span class="muted">${mastered}/${words.length} 🌻</span></div>
        <div class="meter" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p class="muted small">${growing ? `${growing} growing` : "Tap to start"}</p>
      </a>`;
  });

  const plantsPreview = Object.values(groups).flatMap(allWords)
    .filter((w, i, a) => a.indexOf(w) === i && wordState(w).box > 0)
    .sort((a, b) => wordState(b).box - wordState(a).box)
    .slice(0, 24)
    .map((w) => plantFor(wordState(w).box)).join("");

  const schoolCard = school ? (() => {
    const words = allWords(school);
    const { mastered } = summary(words);
    return h`
      <a class="card school-card" href="#/family/school">
        <div class="year-row"><h2>📝 ${esc(school.label)}</h2><span class="muted">${mastered}/${words.length} 🌻</span></div>
        <p class="muted small">This week's spellings from school</p>
      </a>`;
  })() : "";

  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn avatar-btn" href="#/profiles" aria-label="Change player (${esc(me.name)})">${me.avatar}</a>
      <h1>Spell Quest</h1>
      <a class="icon-btn" href="#/settings" aria-label="Settings">⚙️</a>
    </header>
    ${sugg
      ? `<div class="companion" role="status"><span class="hedgehog" aria-hidden="true">🦔</span><p class="bubble">Hi ${esc(me.name)}! ${esc(MISTAKE_TYPES[sugg.type].label)} have been a bit tricky. Shall we practise <a href="#/family/${sugg.fam.id}">${esc(sugg.fam.name)}</a>?</p></div>`
      : companionHtml("greet")}

    <a class="card garden-card" href="#/garden">
      <div class="year-row"><h2>🏡 My garden</h2><span class="seed-pill">🌰 ${seeds()}</span></div>
      <p class="garden">${plantsPreview || '🟫🟫🟫 <span class="garden-empty">Plant your first word!</span>'}</p>
    </a>

    <div class="card mission-card ${mission.done ? "done" : ""}">
      <div class="year-row"><h2>🏅 This week's mission</h2><span class="muted">${mission.progress}/${mission.target}</span></div>
      <p>${esc(mission.text)}${mission.done ? " – complete! 🎉" : ""}</p>
      <div class="meter" aria-hidden="true"><span style="width:${(mission.progress / mission.target) * 100}%"></span></div>
      ${mission.kind === "grow" && !mission.done ? `<a class="small-link" href="#/family/${mission.familyId}">Go to this family →</a>` : ""}
    </div>

    ${schoolCard}
    ${yearCards.join("")}

    <section class="badges" aria-label="Your badges">
      ${daysPractised() ? `<span class="badge">🗓️ Practised on ${daysPractised()} day${daysPractised() === 1 ? "" : "s"}</span>` : ""}
      ${comebacks() ? `<span class="badge">💪 ${comebacks()} comeback word${comebacks() === 1 ? "" : "s"}</span>` : ""}
    </section>
    <a class="small-link" href="#/grown-ups">For grown-ups</a>`;
}

// ---------- year group ----------

export function yearScreen(key) {
  const g = getGroup(key);
  if (!g) return go("#/");
  setLastGroup(key);
  const rows = g.families.map((f) => {
    const { mastered, total } = summary(f.words);
    const due = f.words.filter((w) => isDue(w)).length;
    return h`
      <a class="card family-card" href="#/family/${f.id}">
        <div>
          <h3>${esc(f.name)}</h3>
          <p class="muted">${mastered} of ${total} grown${due ? ` · <strong>${due} ready to water 💧</strong>` : ""}</p>
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
    <ul class="word-list">
      ${fam.words.map((w) => h`
        <li>
          <button class="hear" data-word="${esc(w)}" aria-label="Hear ${esc(w)}">🔊</button>
          <span class="word">${chunks(w).map(esc).join('<span class="dot-sep" aria-hidden="true">·</span>')}</span>
          ${picture(w) ? `<span class="pic-small" aria-hidden="true">${picture(w)}</span>` : ""}
          <span aria-hidden="true">${plantFor(wordState(w).box)}</span>
        </li>`).join("")}
    </ul>
    ${group.isSchool ? `<a class="small-link" href="#/school">Grown-ups: change this list</a>` : ""}`;
  on(".hear", "click", (e) => say(e.currentTarget.dataset.word));
  on("#start", "click", () => startSession(fam, groupKey));
}

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
    addProfile(name, app.querySelector("input[name=av]:checked").value);
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
      ${opt("font", "lexend", "Lexend")}${opt("font", "atkinson", "Atkinson Hyperlegible")}${opt("font", "system", "Device font")}
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
    <fieldset class="card"><legend>Calm mode</legend>
      ${opt("calm", false, "Off")}${opt("calm", true, "On – fewer animations")}
    </fieldset>
    <button class="btn subtle" id="reset-settings">Reset settings</button>`;

  on("input[type=radio]", "change", (e) => {
    const { name, value } = e.target;
    const v = ["textSize", "speechRate"].includes(name) ? Number(value)
      : ["calm", "lively", "sounds"].includes(name) ? value === "true" : value;
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
    ${header("#/", "For grown-ups")}
    <p class="muted">Showing <strong>${me.avatar} ${esc(me.name)}</strong>. <a href="#/profiles">Switch child</a></p>

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
      ${profiles().map((p) => h`
        <div class="manage-row">
          <span class="profile-avatar small" aria-hidden="true">${p.avatar}</span>
          <input class="rename" data-id="${p.id}" value="${esc(p.name)}" maxlength="20" aria-label="Name" />
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
        <li>Spaced repetition brings words back after 1, 2, 4 and 7 days. A mistake moves a word back one step, never to the start.</li>
        <li>Mistakes are sorted into patterns (double letters, silent letters, vowels, letter order, endings) to suggest what to practise next.</li>
        <li>No timers, no lives, no ads, no accounts. Everything is stored only on this device.</li>
      </ul>
    </section>
    <button class="btn subtle" id="reset">Reset ${esc(me.name)}'s progress</button>`;

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
                  ${MNEMONICS[w] ? `<div class="sheet-trick">🧠 ${esc(MNEMONICS[w])}</div>` : ""}</td>
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
