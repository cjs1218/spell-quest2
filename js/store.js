// Everything is saved in the browser (localStorage) on this device only:
// no accounts, no tracking, no server. Each child has their own profile
// with their own garden, progress, settings and school list.

import { classifyMistake } from "./mistakes.js";

const ROOT_KEY = "spellquest.v2";
const profileKey = (id) => `spellquest.v2.profile.${id}`;

export const DEFAULT_SETTINGS = {
  font: "lexend", // lexend | atkinson | system
  tint: "cream", // cream | blue | green | peach | grey | dark
  textSize: 1.15,
  spacing: "wide", // normal | wide
  speechRate: 0.8,
  calm: false, // fewer animations
  lively: true, // excited voice for praise
  sounds: true, // celebration sound effects
  voice: null, // chosen voice name, or null for the best available
};

export const AVATARS = ["🦊", "🐰", "🐻", "🐼", "🐸", "🐯", "🦄", "🐙", "🐝", "🐢", "🦉", "🐶"];

// Spaced repetition (Leitner boxes). A word moves up a box when spelt
// correctly and gently down ONE box when not, so a slip never wipes progress.
// Box 4 = mastered (a fully grown flower in the garden).
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7];
export const MASTERED_BOX = 4;

export const SEEDS = { correct: 1, mastered: 5, game: 1, mission: 10 };

const emptyProfileData = () => ({
  words: {},
  streakDays: [],
  comebacks: 0,
  seeds: 0,
  owned: { flowers: ["🌻"], decor: [] },
  garden: { flower: "🌻", decor: [] },
  mistakes: {}, // type -> count
  mistakeLog: [], // recent { word, answer, types, at }
  mission: null,
  gamesPlayed: {}, // isoWeek -> count
  lastGroup: null,
  school: null, // { name, words: [], splits: { word: [chunks] }, setAt }
  settings: { ...DEFAULT_SETTINGS },
});

// ---------- low-level storage ----------

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – the app still works for this visit */
  }
}

const newId = () => Math.random().toString(36).slice(2, 10);

// ---------- profiles ----------

let root = readJson(ROOT_KEY);
let data = null;

function loadProfile(id) {
  const saved = readJson(profileKey(id)) || {};
  const base = emptyProfileData();
  data = {
    ...base,
    ...saved,
    owned: { ...base.owned, ...saved.owned },
    garden: { ...base.garden, ...saved.garden },
    settings: { ...DEFAULT_SETTINGS, ...saved.settings },
  };
}

function save() {
  if (root?.current) writeJson(profileKey(root.current), data);
}

function saveRoot() {
  writeJson(ROOT_KEY, root);
}

function init() {
  if (!root || !root.profiles?.length) {
    // First run, or upgrading from version 1 (single child, no profiles).
    const id = newId();
    root = { profiles: [{ id, name: "Gardener", avatar: "🦊" }], current: id };
    const v1 = readJson("spellquest.progress.v1");
    const v1Settings = readJson("spellquest.settings.v1");
    const fresh = emptyProfileData();
    if (v1) Object.assign(fresh, { words: v1.words || {}, streakDays: v1.streakDays || [], comebacks: v1.comebacks || 0 });
    if (v1Settings) fresh.settings = { ...DEFAULT_SETTINGS, ...v1Settings };
    writeJson(profileKey(id), fresh);
    saveRoot();
  }
  if (!root.profiles.some((p) => p.id === root.current)) root.current = root.profiles[0].id;
  loadProfile(root.current);
}
init();

export const profiles = () => root.profiles;
export const currentProfile = () => root.profiles.find((p) => p.id === root.current);

export function switchProfile(id) {
  if (!root.profiles.some((p) => p.id === id)) return;
  root.current = id;
  saveRoot();
  loadProfile(id);
}

export function addProfile(name, avatar) {
  const id = newId();
  root.profiles.push({ id, name: name.trim().slice(0, 20) || "Gardener", avatar: avatar || "🦊" });
  writeJson(profileKey(id), emptyProfileData());
  switchProfile(id);
  return id;
}

export function updateProfile(id, { name, avatar }) {
  const p = root.profiles.find((x) => x.id === id);
  if (!p) return;
  if (name !== undefined) p.name = name.trim().slice(0, 20) || p.name;
  if (avatar) p.avatar = avatar;
  saveRoot();
}

export function deleteProfile(id) {
  if (root.profiles.length <= 1) return false;
  root.profiles = root.profiles.filter((p) => p.id !== id);
  try { localStorage.removeItem(profileKey(id)); } catch { /* ignore */ }
  if (root.current === id) root.current = root.profiles[0].id;
  saveRoot();
  loadProfile(root.current);
  return true;
}

// ---------- settings ----------

export const getSettings = () => data.settings;
export function saveSettings(next) {
  data.settings = { ...data.settings, ...next };
  save();
}

// ---------- words & spaced repetition ----------

export function wordState(word) {
  return data.words[word] || { box: 0, due: 0, seen: 0, misses: 0 };
}

export function isDue(word, now = Date.now()) {
  const s = data.words[word];
  return Boolean(s) && s.due <= now;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function markPractisedToday() {
  if (!data.streakDays.includes(today())) data.streakDays.push(today());
}

/**
 * Record a first attempt at spelling a word.
 * Returns what happened so the screen can celebrate it.
 */
export function recordAttempt(word, correct, answer = "") {
  const s = { ...wordState(word) };
  const before = s.box;
  const wasHard = s.misses >= 2;
  let seedsEarned = 0;
  let mistakeTypes = [];
  s.seen += 1;

  if (correct) {
    s.box = Math.min(s.box + 1, MASTERED_BOX);
    seedsEarned += SEEDS.correct;
    if (s.box === MASTERED_BOX && before < MASTERED_BOX) {
      seedsEarned += SEEDS.mastered;
      if (wasHard) data.comebacks += 1;
    }
  } else {
    s.box = Math.max(s.box - 1, 0);
    s.misses += 1;
    mistakeTypes = classifyMistake(answer, word);
    for (const t of mistakeTypes) data.mistakes[t] = (data.mistakes[t] || 0) + 1;
    data.mistakeLog = [{ word, answer, types: mistakeTypes, at: Date.now() }, ...data.mistakeLog].slice(0, 60);
  }

  const days = BOX_INTERVAL_DAYS[Math.min(s.box, BOX_INTERVAL_DAYS.length - 1)];
  s.due = Date.now() + days * 86400000;
  data.words[word] = s;
  data.seeds += seedsEarned;
  markPractisedToday();
  save();
  return { state: s, grew: s.box > before, mastered: s.box === MASTERED_BOX && before < MASTERED_BOX, seedsEarned, mistakeTypes };
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

export const daysPractised = () => data.streakDays.length;
export const comebacks = () => data.comebacks;

export function resetProgress() {
  const keep = { settings: data.settings, school: data.school };
  data = { ...emptyProfileData(), ...keep };
  save();
}

// ---------- seeds & garden ----------

export const seeds = () => data.seeds;
export function addSeeds(n) {
  data.seeds += n;
  save();
}
export function spendSeeds(n) {
  if (data.seeds < n) return false;
  data.seeds -= n;
  save();
  return true;
}
export const garden = () => data.garden;
export const owned = () => data.owned;
export function ownItem(kind, item) {
  if (!data.owned[kind].includes(item)) data.owned[kind].push(item);
  save();
}
export function setGarden(next) {
  data.garden = { ...data.garden, ...next };
  save();
}

// ---------- games & missions ----------

export function recordGamePlayed() {
  const wk = isoWeek();
  data.gamesPlayed[wk] = (data.gamesPlayed[wk] || 0) + 1;
  markPractisedToday();
  save();
}
export const gamesThisWeek = () => data.gamesPlayed[isoWeek()] || 0;
export const daysThisWeek = () => data.streakDays.filter((d) => isoWeek(new Date(d)) === isoWeek()).length;

export const getMission = () => data.mission;
export function setMission(m) {
  data.mission = m;
  save();
}

export const lastGroup = () => data.lastGroup;
export function setLastGroup(key) {
  if (data.lastGroup !== key) {
    data.lastGroup = key;
    save();
  }
}

// ---------- mistakes ----------

export const mistakeCounts = () => data.mistakes;
export const mistakeLog = () => data.mistakeLog;

// ---------- school weekly list ----------

export const schoolList = () => data.school;
export function setSchoolList(list) {
  data.school = list ? { ...list, setAt: Date.now() } : null;
  save();
}
