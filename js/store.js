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
  readAloud: true, // read instructions aloud
};

export const AVATARS = ["🦊", "🐰", "🐻", "🐼", "🐸", "🐯", "🦄", "🐙", "🐝", "🐢", "🦉", "🐶"];

// Spaced repetition (Leitner boxes). A word moves up a box when spelt
// correctly and gently down ONE box when not, so a slip never wipes progress.
// Box 4 = mastered (a fully grown flower in the garden).
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7];
export const MASTERED_BOX = 4;

// Spelling earns more than games, so seeds keep encouraging the learning:
// a word that grows earns 2, practising it again the same day ("watering")
// earns 1, a fully grown flower earns a bonus 5, each game round won earns 1.
export const SEEDS = { correct: 2, watered: 1, mastered: 5, game: 1, mission: 10 };

const emptyProfileData = () => ({
  words: {},
  streakDays: [],
  comebacks: 0,
  seeds: 0,
  owned: { flowers: ["🌻"], decor: [], hazel: [] },
  garden: { flower: "🌻", decor: [], placed: {}, layout: {} }, // placed: area id -> items shown there; layout: where the child put them
  hazel: {}, // Hazel's outfit: { hat, face, neck, held }
  visitors: {}, // visitor id -> date earned
  areasSeen: ["flowers"], // garden areas already celebrated
  stats: {}, // games, perfect, bestStreak, missions, rainbow, longestWord
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

export const YEARS = { y1: "Year 1", y2: "Year 2", y34: "Year 3 or 4", y56: "Year 5 or 6" };

export function addProfile(name, avatar, year = null) {
  const id = newId();
  root.profiles.push({ id, name: name.trim().slice(0, 20) || "Gardener", avatar: avatar || "🦊", year });
  writeJson(profileKey(id), emptyProfileData());
  switchProfile(id);
  return id;
}

export function updateProfile(id, { name, avatar, year }) {
  const p = root.profiles.find((x) => x.id === id);
  if (!p) return;
  if (name !== undefined) p.name = name.trim().slice(0, 20) || p.name;
  if (avatar) p.avatar = avatar;
  if (year !== undefined) p.year = year || null;
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

// The child's local date, so "today" changes at their midnight, not UTC's.
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
  const day = today();
  let watered = false;

  // Spaced practice: a word can only grow one step per day. Extra practice the
  // same day still counts as "watering" (and earns a seed) but the plant waits
  // until tomorrow to grow again. Likewise a slip only moves it back once a day.
  if (correct) data.stats.longestWord = Math.max(data.stats.longestWord || 0, word.length);
  if (correct && s.grewOn === day && s.box < MASTERED_BOX) {
    watered = true;
    seedsEarned += SEEDS.watered;
  } else if (correct) {
    s.box = Math.min(s.box + 1, MASTERED_BOX);
    if (s.box > before) s.grewOn = day;
    seedsEarned += SEEDS.correct;
    if (s.box === MASTERED_BOX && before < MASTERED_BOX) {
      seedsEarned += SEEDS.mastered;
      if (wasHard) data.comebacks += 1;
    }
  } else {
    if (s.droppedOn !== day) {
      s.box = Math.max(s.box - 1, 0);
      s.droppedOn = day;
    }
    s.misses += 1;
    mistakeTypes = classifyMistake(answer, word);
    for (const t of mistakeTypes) data.mistakes[t] = (data.mistakes[t] || 0) + 1;
    data.mistakeLog = [{ word, answer, types: mistakeTypes, at: Date.now() }, ...data.mistakeLog].slice(0, 60);
  }

  if (!watered) {
    const days = BOX_INTERVAL_DAYS[Math.min(s.box, BOX_INTERVAL_DAYS.length - 1)];
    s.due = startOfToday() + days * 86400000;
  }
  data.words[word] = s;
  data.seeds += seedsEarned;
  markPractisedToday();
  save();
  return { state: s, grew: s.box > before, watered, mastered: s.box === MASTERED_BOX && before < MASTERED_BOX, seedsEarned, mistakeTypes };
}

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

/** True if this word has already grown today (so it's resting until tomorrow). */
export const grewToday = (word) => wordState(word).grewOn === today() && wordState(word).box < MASTERED_BOX;

export function summary(words) {
  let mastered = 0, growing = 0;
  for (const w of words) {
    const b = wordState(w).box;
    if (b >= MASTERED_BOX) mastered += 1;
    else if (b > 0) growing += 1;
  }
  return { mastered, growing, total: words.length };
}

/**
 * How much a set of words has grown, counting every right answer.
 * Each word needs MASTERED_BOX right answers to become a flower, so
 * `pct` moves up every time the child spells any word correctly.
 */
export function growth(words) {
  let steps = 0, mastered = 0, growing = 0;
  for (const w of words) {
    const b = Math.min(wordState(w).box, MASTERED_BOX);
    steps += b;
    if (b >= MASTERED_BOX) mastered += 1;
    else if (b > 0) growing += 1;
  }
  const max = words.length * MASTERED_BOX || 1;
  return { steps, max, pct: Math.round((steps / max) * 100), mastered, growing, notStarted: words.length - mastered - growing, total: words.length };
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
  data.owned[kind] ||= [];
  if (!data.owned[kind].includes(item)) data.owned[kind].push(item);
  save();
}

// Items placed in each garden area (the flower garden uses garden.decor).
export const placedIn = (area) => (area === "flowers" ? data.garden.decor : data.garden.placed?.[area] || []);
export function setPlaced(area, items) {
  if (area === "flowers") data.garden.decor = items;
  else data.garden.placed = { ...(data.garden.placed || {}), [area]: items };
  save();
}

// Where the child has put things in each area: key -> { x, y (percent), s (size), f (flipped), z (layer) }.
export const layoutOf = (area) => data.garden.layout?.[area] || {};
export function setLayoutItem(area, key, pos) {
  const layout = { ...(data.garden.layout || {}) };
  layout[area] = { ...(layout[area] || {}), [key]: { ...(layout[area]?.[key] || {}), ...pos } };
  data.garden.layout = layout;
  save();
}
export function resetLayout(area) {
  data.garden.layout = { ...(data.garden.layout || {}), [area]: {} };
  save();
}

// ---------- rewards: Hazel's outfit, visitors, areas, stats ----------

export const hazelOutfit = () => data.hazel || {};
export function setHazel(part, item) {
  data.hazel = { ...(data.hazel || {}), [part]: item || null };
  save();
}

export const stats = () => data.stats || {};
export function bumpStat(key, n = 1) {
  data.stats = { ...(data.stats || {}), [key]: (data.stats?.[key] || 0) + n };
  save();
}
export function maxStat(key, value) {
  if ((data.stats?.[key] || 0) >= value) return;
  data.stats = { ...(data.stats || {}), [key]: value };
  save();
}

export const visitorsEarned = () => data.visitors || {};
export function addVisitor(id) {
  data.visitors = { ...(data.visitors || {}), [id]: today() };
  save();
}

export const areasSeen = () => data.areasSeen || ["flowers"];
export function markAreaSeen(id) {
  if (!areasSeen().includes(id)) data.areasSeen = [...areasSeen(), id];
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

export const helpSeen = () => Boolean(data.helpSeen);
export function markHelpSeen() {
  if (!data.helpSeen) {
    data.helpSeen = true;
    save();
  }
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

// ---------- keeping progress safe ----------

/** Ask the browser not to clear our saved progress when space is low. */
export async function requestPersistence() {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) || false;
  } catch {
    return false;
  }
}

/** Everything on this device (all children) as one object to save as a file. */
export function exportBackup() {
  save();
  const profilesData = {};
  for (const p of root.profiles) profilesData[p.id] = readJson(profileKey(p.id));
  return { app: "spell-quest", version: 2, savedAt: new Date().toISOString(), root, profiles: profilesData };
}

/** Restore a backup made by exportBackup(). Replaces what's on this device. */
export function importBackup(backup) {
  if (backup?.app !== "spell-quest" || !backup.root?.profiles?.length || !backup.profiles) {
    throw new Error("This doesn't look like a Spell Quest backup.");
  }
  for (const p of root.profiles) {
    try { localStorage.removeItem(profileKey(p.id)); } catch { /* ignore */ }
  }
  for (const p of backup.root.profiles) writeJson(profileKey(p.id), backup.profiles[p.id] || emptyProfileData());
  root = backup.root;
  if (!root.profiles.some((p) => p.id === root.current)) root.current = root.profiles[0].id;
  saveRoot();
  loadProfile(root.current);
  try { localStorage.setItem("spellquest.lastBackup", new Date().toISOString()); } catch { /* ignore */ }
}

export function markBackedUp() {
  try { localStorage.setItem("spellquest.lastBackup", new Date().toISOString()); } catch { /* ignore */ }
}
export function lastBackup() {
  try { return localStorage.getItem("spellquest.lastBackup"); } catch { return null; }
}
