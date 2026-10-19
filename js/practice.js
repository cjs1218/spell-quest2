// The core practice flow: look & listen → spell → gentle feedback.

import { MNEMONICS } from "./words.js";
import { wordState, isDue, recordAttempt, MASTERED_BOX, garden } from "./store.js";
import { say, sayLetter, stop, cheer, warm } from "./speech.js";
import { sound } from "./sounds.js";
import { chunks } from "./syllables.js";
import { picture } from "./pictures.js";
import { MISTAKE_TYPES } from "./mistakes.js";
import { checkMission } from "./mission.js";
import { companionHtml } from "./companion.js";
import { praise, spoken } from "./praise.js";
import { rainbowHtml, setupRainbow } from "./rainbow.js";
import {
  app, h, esc, on, shuffle, sleep, PLANTS, chunkedWordHtml, beatsLabel,
  tilesHtml, setupTiles, toast, seedBadge,
} from "./ui.js";

const SESSION_SIZE = 5;
const plantFor = (box) => (box >= MASTERED_BOX ? garden().flower : PLANTS[box]);

function pickSessionWords(fam) {
  const due = fam.words.filter((w) => isDue(w));
  const fresh = fam.words.filter((w) => wordState(w).seen === 0);
  let picked = [...new Set([...shuffle(due), ...fresh])].slice(0, SESSION_SIZE);
  if (picked.length < SESSION_SIZE) {
    const rest = shuffle(fam.words.filter((w) => !picked.includes(w)));
    picked = [...picked, ...rest].slice(0, SESSION_SIZE);
  }
  return picked;
}

export function startSession(fam, groupKey, words = null) {
  const session = { fam, groupKey, words: words || pickSessionWords(fam), index: 0, results: [], streak: 0 };
  learnStep(session);
}

function progressDots(session) {
  return `<div class="dots" aria-label="Word ${session.index + 1} of ${session.words.length}">${session.words
    .map((_, i) => `<span class="dot ${i < session.index ? "done" : i === session.index ? "now" : ""}"></span>`)
    .join("")}</div>`;
}

const sessionHeader = (session) => h`
  <header class="top">
    <a class="icon-btn" href="#/family/${session.fam.id}" aria-label="Stop practising">✖️</a>
    ${progressDots(session)}
    ${seedBadge()}
  </header>`;

async function chopAnimation(big, word) {
  big.style.setProperty("--chop-len", word.length * 0.8 + chunks(word).length * 0.6);
  big.classList.add("chopped");
  for (const el of big.querySelectorAll(".syl")) {
    el.classList.add("lit");
    await say(el.dataset.syl, { rate: 0.7 });
    await sleep(250);
    el.classList.remove("lit");
  }
  await say(word);
}

// Step 1: look, listen, chop it and spell it aloud together (SOS).
function learnStep(session) {
  const word = session.words[session.index];
  const trick = MNEMONICS[word];
  const pic = picture(word);
  const multi = chunks(word).length > 1;
  app.innerHTML = h`
    ${sessionHeader(session)}
    ${session.index === 0 ? companionHtml("start") : ""}
    <p class="step-label">Look and listen</p>
    ${pic ? `<div class="picture-clue" aria-hidden="true">${pic}</div>` : ""}
    <div class="big-word" id="bigword" aria-label="${esc(word)}">${chunkedWordHtml(word)}</div>
    <p class="beats muted">${beatsLabel(chunks(word).length)}</p>
    <div class="row">
      <button class="btn" id="hear">🔊 Hear it</button>
      ${multi ? `<button class="btn" id="chop">✂️ Chop it</button>` : ""}
      <button class="btn" id="sos">🔤 Spell it with me</button>
      <button class="btn" id="rainbow">🌈 Rainbow write</button>
    </div>
    ${trick ? `<div class="tip card"><span aria-hidden="true">🧠</span> ${esc(trick)}</div>` : ""}
    <button class="btn primary big" id="ready">I'm ready! Hide the word</button>
    <div id="overlay"></div>`;

  stop();
  say(word);
  on("#hear", "click", () => say(word));
  on("#sos", "click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    await say(word);
    for (const el of app.querySelectorAll("#bigword .letter")) {
      el.classList.add("lit");
      await sayLetter(el.textContent);
      await sleep(150);
      el.classList.remove("lit");
    }
    await say(word);
    btn.disabled = false;
  });
  on("#chop", "click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    await chopAnimation(app.querySelector("#bigword"), word);
    btn.disabled = false;
  });
  on("#rainbow", "click", () => {
    const overlay = app.querySelector("#overlay");
    overlay.innerHTML = `<div class="sheet" role="dialog" aria-label="Rainbow writing">${rainbowHtml(word)}
      <button class="btn subtle close-sheet">Close</button></div>`;
    overlay.classList.add("open");
    setupRainbow(overlay, word, () => {
      overlay.classList.remove("open");
      overlay.innerHTML = "";
      toast("🌈 Beautiful rainbow writing!");
    });
    on(".close-sheet", "click", () => { overlay.classList.remove("open"); overlay.innerHTML = ""; }, overlay);
  });
  on("#ready", "click", () => attemptStep(session, 1));
}

// Step 2: spell it. Help fades as the word grows:
// syllable chunks → letter tiles → typing. "Peek" shows it again with no penalty.
function attemptStep(session, attempt) {
  const word = session.words[session.index];
  const box = wordState(word).box;
  const useChunks = box === 0 && chunks(word).length > 1;
  const useTiles = !useChunks && box < 2;
  const pieces = useChunks ? chunks(word) : [...word];
  stop();
  app.innerHTML = h`
    ${sessionHeader(session)}
    <p class="step-label">${useChunks ? "Put the chunks in order" : useTiles ? "Build the word" : "Write the word"}</p>
    <div class="row">
      <button class="btn" id="hear">🔊 Hear it again</button>
      <button class="btn" id="peek">👀 Show me again</button>
    </div>
    <div class="peek-word" id="peekword" aria-live="polite"></div>
    ${useChunks || useTiles ? tilesHtml(word, pieces) : `<input class="type-box" id="typed" type="text"
      autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" />`}
    <button class="btn primary big" id="check" disabled>Check</button>`;

  say(word);
  const check = app.querySelector("#check");
  on("#hear", "click", () => say(word));
  on("#peek", "click", async (e) => {
    const btn = e.currentTarget;
    const peek = app.querySelector("#peekword");
    btn.disabled = true;
    peek.innerHTML = `<span class="big-word small">${chunkedWordHtml(word)}</span>`;
    say(word);
    await sleep(3000);
    peek.innerHTML = "";
    btn.disabled = false;
  });

  let getAnswer;
  if (useChunks || useTiles) {
    getAnswer = setupTiles(app, pieces.length, { isChunks: useChunks, onChange: (full) => (check.disabled = !full) });
  } else {
    const input = app.querySelector("#typed");
    input.focus();
    input.addEventListener("input", () => (check.disabled = input.value.trim() === ""));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !check.disabled) check.click(); });
    getAnswer = () => input.value.trim();
  }
  on("#check", "click", () => feedbackStep(session, attempt, getAnswer()));
}

// Step 3: warm, gentle feedback.
function feedbackStep(session, attempt, answer) {
  const word = session.words[session.index];
  const correct = answer.toLowerCase() === word.toLowerCase();
  let result = null;
  if (attempt === 1) {
    result = recordAttempt(word, correct, answer);
    session.results.push({ word, correct, box: result.state.box });
    session.streak = correct ? session.streak + 1 : 0;
    if (result.seedsEarned) toast(`+${result.seedsEarned} 🌰`);
  }

  if (correct) {
    const box = wordState(word).box;
    const left = MASTERED_BOX - box;
    const msg = box >= MASTERED_BOX
      ? "Your flower is fully grown! 🌻"
      : result?.grew
        ? `Your plant grew! ${left === 1 ? "Just 1 more right answer" : `${left} more right answers`} to make it a flower.`
        : `${left === 1 ? "1 more right answer" : `${left} more right answers`} to make it a flower.`;
    const headline = praise(attempt === 1 ? "correct" : "retry");
    const comment = result?.mastered
      ? companionHtml("mastered")
      : attempt === 1 && session.streak >= 3
        ? companionHtml("streak", { vars: { n: session.streak } })
        : companionHtml("correct");
    app.innerHTML = h`
      <div class="celebrate">
        <div class="burst" aria-hidden="true">✨${plantFor(box)}✨</div>
        <h2>${esc(headline)}</h2>
        <p class="big-word small chopped">${chunkedWordHtml(word)}</p>
        <p>${msg}</p>
        ${comment}
        <button class="btn primary big" id="next">Next</button>
      </div>`;
    sound(result?.mastered ? "fanfare" : "correct");
    cheer(`${spoken(headline)} ${app.querySelector(".bubble")?.textContent || ""}`);
    on("#next", "click", () => nextWord(session));
    return;
  }

  const compare = [...word]
    .map((c, i) => `<span class="letter ${answer[i]?.toLowerCase() === c.toLowerCase() ? "good" : "fix"}">${esc(c)}</span>`)
    .join("");
  const type = result?.mistakeTypes?.find((t) => t !== "other");
  const advice = type ? MISTAKE_TYPES[type].advice : null;
  app.innerHTML = h`
    <div class="feedback">
      ${companionHtml("mistake")}
      <p class="muted">You wrote: <span class="yours">${esc(answer)}</span></p>
      <div class="big-word">${compare}</div>
      <p class="muted">The <span class="good-key">green</span> letters you got right. Look at the <span class="fix-key">orange</span> ones.</p>
      ${advice ? `<div class="tip card"><span aria-hidden="true">💡</span> ${esc(advice)}</div>` : ""}
      <div class="row">
        <button class="btn" id="hear">🔊 Hear it</button>
        <button class="btn" id="again">👀 Show me again</button>
        ${attempt === 1 ? `<button class="btn primary" id="retry">Try again</button>` : ""}
        <button class="btn ${attempt === 1 ? "" : "primary"}" id="next">${attempt === 1 ? "Skip for now" : "Next word"}</button>
      </div>
    </div>`;
  sound("oops");
  warm(app.querySelector(".bubble")?.textContent || "");
  on("#hear", "click", () => { stop(); say(word); });
  on("#again", "click", () => learnStepRetry(session));
  on("#retry", "click", () => attemptStep(session, 2));
  on("#next", "click", () => nextWord(session));
}

// "Show me again" after a mistake: back to look & listen, then a second try.
function learnStepRetry(session) {
  learnStep(session);
  const ready = app.querySelector("#ready");
  const fresh = ready.cloneNode(true);
  ready.replaceWith(fresh);
  fresh.addEventListener("click", () => attemptStep(session, 2));
}

function nextWord(session) {
  session.index += 1;
  if (session.index < session.words.length) learnStep(session);
  else endScreen(session);
}

function endScreen(session) {
  const right = session.results.filter((r) => r.correct).length;
  const missionDone = checkMission();
  const headline = praise(right === session.results.length && right > 0 ? "perfect" : "end");
  app.innerHTML = h`
    <div class="celebrate">
      <div class="burst" aria-hidden="true">${session.results.map((r) => plantFor(r.box)).join(" ")}</div>
      <h2>${esc(headline)}</h2>
      <p>You practised ${session.results.length} words and spelt ${right} first time.</p>
      ${missionDone ? `<div class="tip card mission-done">🏅 Weekly mission complete! +10 🌰</div>` : ""}
      ${companionHtml("end")}
      <div class="row">
        <button class="btn primary big" id="again">Practise more</button>
        <a class="btn" href="#/garden">🏡 My garden</a>
        <a class="btn" href="#/year/${session.groupKey}">Back</a>
      </div>
    </div>`;
  sound("fanfare");
  cheer(`${spoken(headline)} ${missionDone ? "You finished your weekly mission!" : app.querySelector(".bubble")?.textContent || ""}`);
  on("#again", "click", () => startSession(session.fam, session.groupKey));
}
