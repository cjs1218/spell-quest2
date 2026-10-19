// "Today's words": the app chooses what to practise, so spaced repetition can
// do its job and the child doesn't have to pick a year and a family.
//
// Order of priority:
//  1. words that are due again (most overdue first), from any year group
//  2. new words from the school weekly list
//  3. new words from the child's own year group, family by family
// Words that have already grown today are left to rest until tomorrow.

import { getGroups, allWords } from "./groups.js";
import { wordState, isDue, grewToday, currentProfile, lastGroup, MASTERED_BOX } from "./store.js";

export const TODAY_SIZE = 6;
const MAX_REVIEW = 4; // leave room for some new words each day

export function childYear() {
  const groups = getGroups();
  const p = currentProfile()?.year;
  if (p && groups[p]) return p;
  const last = lastGroup();
  if (last && last !== "school" && groups[last]) return last;
  return "y1";
}

function unique(words) {
  return [...new Set(words)];
}

export function todaysPlan() {
  const groups = getGroups();
  const every = unique(Object.values(groups).flatMap(allWords));

  const due = every
    .filter((w) => isDue(w) && !grewToday(w))
    .sort((a, b) => {
      // Growing words before fully grown reviews, then most overdue first.
      const ga = wordState(a).box >= MASTERED_BOX, gb = wordState(b).box >= MASTERED_BOX;
      if (ga !== gb) return ga ? 1 : -1;
      return wordState(a).due - wordState(b).due;
    });

  const isNew = (w) => wordState(w).seen === 0;
  const schoolNew = groups.school ? allWords(groups.school).filter(isNew) : [];
  const yearGroup = groups[childYear()];
  const yearNew = yearGroup ? yearGroup.families.flatMap((f) => f.words).filter(isNew) : [];

  const review = due.slice(0, MAX_REVIEW);
  const fresh = unique([...schoolNew, ...yearNew]).filter((w) => !review.includes(w));
  let words = [...review, ...fresh].slice(0, TODAY_SIZE);
  // If there aren't enough new words, top up with more due words.
  if (words.length < TODAY_SIZE) words = unique([...words, ...due]).slice(0, TODAY_SIZE);

  return {
    words,
    reviewCount: words.filter((w) => !isNew(w)).length,
    newCount: words.filter(isNew).length,
    restingCount: every.filter(grewToday).length,
  };
}

/** A pretend "family" for the practice screens. */
export function todayFamily() {
  return {
    id: "today",
    name: "Today's words",
    tip: "Hazel has picked these for you: some to water and some new seeds.",
    words: todaysPlan().words,
    backHref: "#/",
    refresh: () => todaysPlan().words,
  };
}
