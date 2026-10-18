// A weekly mission: one small, achievable goal each week, with a seed reward.

import {
  getMission, setMission, isoWeek, lastGroup, wordState, MASTERED_BOX,
  gamesThisWeek, daysThisWeek, addSeeds, SEEDS,
} from "./store.js";
import { getGroups } from "./groups.js";

function weekNumber(wk) {
  return Number(wk.split("-W")[1]) || 0;
}

function chooseFamily() {
  const groups = getGroups();
  const key = lastGroup() && groups[lastGroup()] ? lastGroup() : Object.keys(groups).find((k) => k !== "school");
  const group = groups[key];
  // The first family that still has words to grow.
  const fam = group.families.find((f) => f.words.some((w) => wordState(w).box < MASTERED_BOX)) || group.families[0];
  return fam;
}

function newMission() {
  const week = isoWeek();
  const kind = ["grow", "days", "games"][weekNumber(week) % 3];
  if (kind === "grow") {
    const fam = chooseFamily();
    const snapshot = Object.fromEntries(fam.words.map((w) => [w, wordState(w).box]));
    const growable = fam.words.filter((w) => wordState(w).box < MASTERED_BOX).length;
    return {
      week, kind, familyId: fam.id, familyName: fam.name, snapshot,
      target: Math.max(1, Math.min(3, growable)),
      text: `Grow ${Math.max(1, Math.min(3, growable))} plants in “${fam.name}”`,
      done: false,
    };
  }
  if (kind === "days") return { week, kind, target: 3, text: "Practise on 3 different days", done: false };
  return { week, kind, target: 2, text: "Play 2 word games", done: false };
}

/** This week's mission with live progress. Starts a new one each week. */
export function currentMission() {
  let m = getMission();
  if (!m || m.week !== isoWeek()) {
    m = newMission();
    setMission(m);
  }
  let progress = 0;
  if (m.kind === "grow") progress = Object.entries(m.snapshot).filter(([w, b]) => wordState(w).box > b).length;
  else if (m.kind === "days") progress = daysThisWeek();
  else progress = gamesThisWeek();
  return { ...m, progress: Math.min(progress, m.target) };
}

/** Call after any practice: awards the reward once when the mission is complete. */
export function checkMission() {
  const m = currentMission();
  if (!m.done && m.progress >= m.target) {
    setMission({ ...getMission(), done: true });
    addSeeds(SEEDS.mission);
    return true;
  }
  return false;
}
