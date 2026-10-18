// Saves progress and settings in the browser (localStorage).
// Everything stays on the device: no accounts, no tracking, no server.

const PROGRESS_KEY = "spellquest.progress.v1";
const SETTINGS_KEY = "spellquest.settings.v1";

export const DEFAULT_SETTINGS = {
  font: "lexend", // lexend | atkinson | system
  tint: "cream", // cream | blue | green | peach | grey | dark
  textSize: 1.15, // multiplier
  spacing: "wide", // normal | wide
  speechRate: 0.8,
};

// Spaced repetition (Leitner boxes). A word moves up a box when spelt
// correctly and gently down ONE box when not, so a slip never wipes progress.
// Box 4 = mastered (a sunflower in the garden).
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7];
export const MASTERED_BOX = 4;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – the app still works for this visit */
  }
}

let progress = read(PROGRESS_KEY, { words: {}, streakDays: [], comebacks: 0 });
let settings = read(SETTINGS_KEY, DEFAULT_SETTINGS);

export const getSettings = () => settings;
export function saveSettings(next) {
  settings = { ...settings, ...next };
  write(SETTINGS_KEY, settings);
}

export function wordState(word) {
  return progress.words[word] || { box: 0, due: 0, seen: 0, misses: 0 };
}

export function isDue(word, now = Date.now()) {
  const s = progress.words[word];
  return Boolean(s) && s.due <= now;
}

export function recordAttempt(word, correct) {
  const s = { ...wordState(word) };
  const wasHard = s.misses >= 2;
  s.seen += 1;
  if (correct) {
    s.box = Math.min(s.box + 1, MASTERED_BOX);
    if (s.box === MASTERED_BOX && wasHard) progress.comebacks += 1;
  } else {
    s.box = Math.max(s.box - 1, 0);
    s.misses += 1;
  }
  const days = BOX_INTERVAL_DAYS[Math.min(s.box, BOX_INTERVAL_DAYS.length - 1)];
  s.due = Date.now() + days * 86400000;
  progress.words[word] = s;

  const today = new Date().toISOString().slice(0, 10);
  if (!progress.streakDays.includes(today)) progress.streakDays.push(today);
  write(PROGRESS_KEY, progress);
  return s;
}

export function summary(words) {
  let mastered = 0, growing = 0;
  for (const w of words) {
    const b = wordState(w).box;
    if (b >= MASTERED_BOX) mastered += 1;
    else if (b > 0) growing += 1;
  }
  return { mastered, growing, total: words.length };
}

export const daysPractised = () => progress.streakDays.length;
export const comebacks = () => progress.comebacks;

export function resetProgress() {
  progress = { words: {}, streakDays: [], comebacks: 0 };
  write(PROGRESS_KEY, progress);
}
