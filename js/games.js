// Word games for each year group. Every game is short (about 5 rounds),
// gives gentle feedback, and earns seeds.

import { getGroup, allWords, patternFamilies } from "./groups.js";
import { addSeeds, recordGamePlayed, SEEDS, wordState, MASTERED_BOX, recordAttempt } from "./store.js";
import { checkMission } from "./mission.js";
import { chunks } from "./syllables.js";
import { gamePicture as picture } from "./pictures.js";
import { BUILDS, DISTRACTORS } from "./builder.js";
import { say, stop, cheer, warm, sayChunk } from "./speech.js";
import { sound } from "./sounds.js";
import { companionHtml } from "./companion.js";
import { instructionHtml, readInstruction, withSayButton } from "./readaloud.js";
import { praise, spoken } from "./praise.js";
import { rainbowHtml, setupRainbow } from "./rainbow.js";
import {
  app, h, esc, on, shuffle, pick, sleep, header, seedBadge, chunkedWordHtml,
  tilesHtml, setupTiles, toast, beatsLabel,
} from "./ui.js";

const ROUNDS = 5;

export const GAMES = [
  { id: "sort", icon: "🧺", name: "Word sorting", desc: "Sort words into their families", minFamilies: 2 },
  { id: "odd", icon: "🔎", name: "Odd one out", desc: "Find the word that doesn't belong", minFamilies: 2 },
  { id: "build", icon: "🧱", name: "Word building", desc: "Add beginnings and endings to words" },
  { id: "picture", icon: "🖼️", name: "Picture words", desc: "Spell the word for the picture", needsPictures: true },
  { id: "drum", icon: "🥁", name: "Beat the drum", desc: "Tap a beat for each syllable" },
  { id: "rainbow", icon: "🌈", name: "Rainbow writing", desc: "Trace words in rainbow colours" },
];

/** Which games make sense for this group. */
export function gamesFor(group) {
  return GAMES.filter((g) => {
    if (g.minFamilies && patternFamilies(group).length < g.minFamilies) return false;
    if (g.needsPictures && allWords(group).filter((w) => picture(w)).length < 3) return false;
    if (g.id === "build" && buildsFor(group).length < 3) return false;
    return true;
  });
}

export function gameScreen(gameId, groupKey) {
  const group = getGroup(groupKey);
  const game = GAMES.find((g) => g.id === gameId);
  if (!group || !game) return (location.hash = "#/");
  const ctx = { group, groupKey, game, round: 0, score: 0 };
  ({ sort: sortGame, odd: oddGame, build: buildGame, picture: pictureGame, drum: drumGame, rainbow: rainbowGame }[gameId])(ctx);
}

// ---------- shared frame ----------

function frame(ctx, body, label = "") {
  const dots = `<div class="dots" aria-label="Round ${ctx.round + 1} of ${ROUNDS}">${Array.from({ length: ROUNDS })
    .map((_, i) => `<span class="dot ${i < ctx.round ? "done" : i === ctx.round ? "now" : ""}"></span>`).join("")}</div>`;
  app.innerHTML = h`
    <header class="top">
      <a class="icon-btn" href="#/year/${ctx.groupKey}" aria-label="Stop playing">✖️</a>
      ${label === "nodots" ? `<h1>${ctx.game.name}</h1>` : dots}
      ${seedBadge()}
    </header>
    ${label && label !== "nodots" ? instructionHtml(label) : ""}
    ${body}`;
  // Read the instruction aloud (only when it's new, so it isn't repeated every round).
  if (label && label !== "nodots") readInstruction(`${label}.`);
}

function win(ctx, seedsForRound = SEEDS.game) {
  ctx.score += 1;
  addSeeds(seedsForRound);
  toast(`+${seedsForRound} 🌰`);
}

function nextRound(ctx, play) {
  ctx.round += 1;
  if (ctx.round < ROUNDS) play(ctx);
  else finish(ctx);
}

function finish(ctx) {
  recordGamePlayed();
  const missionDone = checkMission();
  const headline = praise("gameEnd");
  app.innerHTML = h`
    <div class="celebrate">
      <div class="burst" aria-hidden="true">${ctx.game.icon}🏅</div>
      <h2>${esc(headline)}</h2>
      <p>You got ${ctx.score} out of ${ctx.total ?? ROUNDS} right.</p>
      ${missionDone ? `<div class="tip card mission-done">🏅 Weekly mission complete! +10 🌰</div>` : ""}
      ${companionHtml("end")}
      <div class="row">
        <button class="btn primary big" id="again">Play again</button>
        <a class="btn" href="#/year/${ctx.groupKey}">Back</a>
      </div>
    </div>`;
  sound("fanfare");
  cheer(`${spoken(headline)} ${missionDone ? "You finished your weekly mission!" : ""}`);
  on("#again", "click", () => gameScreen(ctx.game.id, ctx.groupKey));
}

// Pick a praise line and celebrate it out loud.
function cheerLine(kind = "game") {
  const line = praise(kind);
  celebrate(line);
  return line;
}

// Happy chime and an excited voice for a right answer.
function celebrate(text) {
  sound("correct");
  cheer(spoken(text));
}

function feedbackRow(ok, text) {
  if (!ok) sound("oops");
  return `<div class="tip card ${ok ? "ok" : "not-yet"}" role="status"><span aria-hidden="true">${ok ? "✅" : "💡"}</span> ${text}</div>`;
}

// ---------- 1. Word sorting ----------

function sortGame(ctx) {
  const fams = shuffle(patternFamilies(ctx.group).filter((f) => f.words.length >= 3)).slice(0, 2);
  const words = shuffle(fams.flatMap((f, fi) => shuffle(f.words).slice(0, 3).map((w) => ({ w, fi }))));
  ctx.total = words.length;
  let selected = null;
  let firstTry = true;

  frame(ctx, h`
    ${instructionHtml("Tap a word, then tap the basket where it belongs.")}
    <div class="chips" id="chips">${words.map((x, i) => `<button class="chip" data-i="${i}">${esc(x.w)}</button>`).join("")}</div>
    <div class="baskets">${fams.map((f, fi) => `<button class="basket" data-fi="${fi}"><strong>🧺 ${esc(f.name)}</strong><span class="basket-words"></span></button>`).join("")}</div>
    <div id="msg"></div>`, "nodots");
  readInstruction("Tap a word, then tap the basket where it belongs.");

  on(".chip", "click", (e) => {
    selected = e.currentTarget;
    firstTry = true;
    app.querySelectorAll(".chip").forEach((c) => c.classList.toggle("chosen", c === selected));
    say(words[selected.dataset.i].w);
  });
  on(".basket", "click", (e) => {
    if (!selected) {
      app.querySelector("#msg").innerHTML = feedbackRow(false, "Tap a word first!");
      return;
    }
    const item = words[selected.dataset.i];
    const fi = Number(e.currentTarget.dataset.fi);
    if (item.fi === fi) {
      if (firstTry) win(ctx);
      e.currentTarget.querySelector(".basket-words").insertAdjacentHTML("beforeend", `<span class="in-basket">${esc(item.w)}</span>`);
      selected.remove();
      selected = null;
      app.querySelector("#msg").innerHTML = feedbackRow(true, `${esc(cheerLine())} ${esc(item.w)} goes with ${esc(fams[fi].name)}.`);
      if (!app.querySelector(".chip")) setTimeout(() => finish(ctx), 900);
    } else {
      firstTry = false;
      e.currentTarget.classList.add("shake");
      setTimeout(() => app.querySelector(".shake")?.classList.remove("shake"), 500);
      app.querySelector("#msg").innerHTML = feedbackRow(false, `Not quite. ${esc(fams[item.fi].tip)}`);
    }
  });
}

// ---------- 2. Odd one out ----------

function oddGame(ctx) {
  const fams = patternFamilies(ctx.group).filter((f) => f.words.length >= 3);
  const main = pick(fams);
  const other = pick(fams.filter((f) => f !== main));
  const three = shuffle(main.words).slice(0, 3);
  const odd = pick(other.words.filter((w) => !three.includes(w)));
  const options = shuffle([...three, odd]);

  frame(ctx, h`
    <div class="odd-grid">${options.map((w) => `<button class="odd-card" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div>
    <div id="msg"></div>
    <button class="btn primary big" id="next" hidden>Next</button>`, "Three words match. Tap the odd one out!");

  let tries = 0;
  on(".odd-card", "click", (e) => {
    const w = e.currentTarget.dataset.w;
    say(w);
    if (w === odd) {
      if (tries === 0) win(ctx);
      e.currentTarget.classList.add("right");
      app.querySelectorAll(".odd-card").forEach((c) => (c.disabled = true));
      app.querySelector("#msg").innerHTML = feedbackRow(true,
        `${esc(cheerLine("spotted"))} The others are all “${esc(main.name)}”. ${esc(main.tip)}`);
      app.querySelector("#next").hidden = false;
    } else {
      tries += 1;
      e.currentTarget.classList.add("wrong");
      e.currentTarget.disabled = true;
      app.querySelector("#msg").innerHTML = feedbackRow(false, "That one belongs with the others. Look for a word with a different pattern.");
    }
  });
  on("#next", "click", () => nextRound(ctx, oddGame));
}

// ---------- 3. Word building ----------

function buildsFor(group) {
  const words = new Set(allWords(group).map((w) => w.toLowerCase()));
  const matching = BUILDS.filter((b) => words.has(b.word) || words.has(b.base));
  return matching.length >= 3 ? matching : BUILDS.filter((b) => !b.rule && b.word.length <= 10);
}

function buildGame(ctx) {
  ctx.builds ||= shuffle(buildsFor(ctx.group)).slice(0, ROUNDS);
  const b = ctx.builds[ctx.round % ctx.builds.length];
  const pool = b.prefix ? DISTRACTORS.prefix : DISTRACTORS.suffix;
  const choices = shuffle([...b.add, ...shuffle(pool.filter((p) => !b.add.includes(p))).slice(0, 3)]);

  frame(ctx, h`
    <p class="build-target">Make <button class="link-btn" id="hear">🔊 the word</button> from <strong>${esc(b.base)}</strong></p>
    <div class="build-eq" aria-live="polite">
      ${b.prefix ? `<span class="slot add-slot"></span> + <span class="base-chip">${esc(b.base)}</span>`
                 : `<span class="base-chip">${esc(b.base)}</span>${b.add.map(() => ` + <span class="slot add-slot"></span>`).join("")}`}
    </div>
    <div class="tiles">${choices.map((c) => `<button class="tile chunk-tile" data-p="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div id="msg"></div>
    <div id="step2"></div>`, "Tap the piece that makes the word");

  say(b.word);
  on("#hear", "click", () => say(b.word));
  const placed = [];
  let tries = 0;
  on(".tile", "click", (e) => {
    const t = e.currentTarget;
    const expected = b.add[placed.length];
    if (t.dataset.p === expected) {
      placed.push(expected);
      t.disabled = true;
      app.querySelectorAll(".add-slot")[placed.length - 1].textContent = expected;
      if (placed.length === b.add.length) step2();
    } else {
      tries += 1;
      t.classList.add("wrong");
      t.disabled = true;
      app.querySelector("#msg").innerHTML = feedbackRow(false, `Listen again: ${esc(b.word)}. Which piece makes that word?`);
      say(b.word);
    }
  });

  // Then spell the whole word, because joining sometimes changes letters.
  function step2() {
    app.querySelectorAll(".tile").forEach((t) => (t.disabled = true));
    const joined = b.prefix ? b.add.join("") + b.base : b.base + b.add.join("");
    const changes = joined !== b.word;
    app.querySelector("#msg").innerHTML = feedbackRow(true, changes
      ? `Careful – the letters change when they join! ${esc(b.rule || "")}`
      : `${esc(b.prefix ? b.add.join(" + ") + " + " + b.base : [b.base, ...b.add].join(" + "))} = ${esc(b.word)}. ${esc(b.rule || "")}`);
    const step = app.querySelector("#step2");
    step.innerHTML = h`
      ${instructionHtml("Now tap the letters to spell the whole word")}
      ${tilesHtml(b.word, [...b.word])}
      <button class="btn primary big" id="check" disabled>Check</button>`;
    readInstruction("Now tap the letters to spell the whole word.");
    const check = step.querySelector("#check");
    const get = setupTiles(step, b.word.length, { onChange: (full) => (check.disabled = !full) });
    check.addEventListener("click", () => {
      if (get() === b.word) {
        if (tries === 0) win(ctx);
        celebrate(`${praise("game")} ${b.word}!`);
        step.innerHTML = `<p class="big-word small chopped">${chunkedWordHtml(b.word)}</p>
          <button class="btn primary big" id="next">Next</button>`;
        step.querySelector("#next").addEventListener("click", () => nextRound(ctx, buildGame));
      } else {
        tries += 1;
        app.querySelector("#msg").innerHTML = feedbackRow(false, `Nearly! It's spelt <strong>${esc(b.word)}</strong>. Try building it again.`);
        step.querySelectorAll(".tile").forEach((t) => (t.disabled = false));
        step.querySelectorAll(".slot").forEach((s) => (s.textContent = ""));
        step2();
      }
    });
  }
}

// ---------- 4. Picture words ----------

function pictureGame(ctx) {
  ctx.words ||= shuffle(allWords(ctx.group).filter((w) => picture(w))).slice(0, ROUNDS);
  const word = ctx.words[ctx.round % ctx.words.length];
  const useChunks = wordState(word).box === 0 && chunks(word).length > 1;
  const pieces = useChunks ? chunks(word) : [...word];

  frame(ctx, h`
    <div class="picture-big" aria-hidden="true">${picture(word)}</div>
    <div class="row"><button class="btn" id="hear">🔊 Hear it</button><button class="btn" id="hint">💡 Hint</button></div>
    <div id="hintbox" aria-live="polite"></div>
    ${tilesHtml(word, pieces)}
    <div id="msg"></div>
    <button class="btn primary big" id="check" disabled>Check</button>`, "What is in the picture? Spell it!");

  say(word);
  let tries = 0;
  const check = app.querySelector("#check");
  const get = setupTiles(app, pieces.length, { isChunks: useChunks, onChange: (full) => (check.disabled = !full) });
  on("#hear", "click", () => say(word));
  on("#hint", "click", () => {
    app.querySelector("#hintbox").innerHTML = `<p class="center muted">It starts with <strong>${esc(word[0])}</strong> and has ${beatsLabel(chunks(word).length)}.</p>`;
  });
  let solved = false;
  on("#check", "click", () => {
    if (solved) return nextRound(ctx, pictureGame);
    const right = get().toLowerCase() === word.toLowerCase();
    // Spelling the picture is real practice, so the first try helps the word grow.
    if (tries === 0) recordAttempt(word, right, get());
    if (right) {
      solved = true;
      if (tries === 0) win(ctx);
      app.querySelector("#msg").innerHTML = feedbackRow(true, `${esc(cheerLine())} ${esc(word)}`);
      check.textContent = "Next";
    } else {
      tries += 1;
      app.querySelector("#msg").innerHTML = feedbackRow(false, `Nearly! It's <strong>${esc(word)}</strong>. Use Undo and try again.`);
    }
  });
}

// ---------- 5. Beat the drum (syllables) ----------

function drumGame(ctx) {
  ctx.words ||= shuffle(allWords(ctx.group)).slice(0, ROUNDS);
  const word = ctx.words[ctx.round];
  const beats = chunks(word).length;
  let taps = 0;

  frame(ctx, h`
    <div class="big-word">${esc(word)}</div>
    <button class="btn" id="hear">🔊 Hear it</button>
    <button class="drum" id="drum" aria-label="Drum: tap once per beat">🥁</button>
    <p class="center taps" aria-live="polite">Taps: <strong id="taps">0</strong></p>
    <div class="row">
      <button class="btn subtle" id="reset">Start again</button>
      <button class="btn primary" id="done">Done</button>
    </div>
    <div id="msg"></div>`, "Say the word slowly. Tap the drum once for each beat.");

  say(word);
  let tries = 0;
  on("#hear", "click", () => say(word));
  on("#drum", "click", (e) => {
    taps += 1;
    app.querySelector("#taps").textContent = taps;
    e.currentTarget.classList.remove("hit");
    void e.currentTarget.offsetWidth;
    e.currentTarget.classList.add("hit");
    sound("pop");
    const syl = chunks(word)[taps - 1];
    if (syl) sayChunk(syl);
  });
  on("#reset", "click", () => { taps = 0; app.querySelector("#taps").textContent = 0; });
  let solved = false;
  on("#done", "click", async (e) => {
    if (solved) return nextRound(ctx, drumGame);
    if (taps === beats) {
      solved = true;
      if (tries === 0) win(ctx);
      const line = praise("game");
      sound("correct");
      app.querySelector("#msg").innerHTML = feedbackRow(true, `${esc(line)} ${beatsLabel(beats)}: <span class="inline-chop">${chunkedWordHtml(word)}</span>`);
      e.currentTarget.textContent = "Next";
      app.querySelector("#drum").disabled = true;
      stop();
      await cheer(spoken(line));
      for (const s of chunks(word)) { await sayChunk(s); await sleep(150); }
    } else {
      tries += 1;
      app.querySelector("#msg").innerHTML = feedbackRow(false,
        `You tapped ${taps}. Try again – say it slowly and clap: ${taps < beats ? "listen for more beats" : "it has fewer beats"}.`);
      taps = 0;
      app.querySelector("#taps").textContent = 0;
    }
  });
}

// ---------- 6. Rainbow writing ----------

function rainbowGame(ctx) {
  // Prefer words the child is still growing.
  ctx.words ||= (() => {
    const words = allWords(ctx.group);
    const growing = words.filter((w) => wordState(w).box > 0 && wordState(w).box < MASTERED_BOX);
    return shuffle(growing.length >= 3 ? growing : words).slice(0, 3);
  })();
  ctx.total = ctx.words.length;
  const word = ctx.words[ctx.round];
  frame(ctx, rainbowHtml(word), "nodots");
  setupRainbow(app, word, () => {
    win(ctx);
    ctx.round += 1;
    if (ctx.round < ctx.words.length) rainbowGame(ctx);
    else finish(ctx);
  });
}
