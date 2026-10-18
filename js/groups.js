// Year groups, plus this child's school weekly list when one has been added.

import { YEAR_GROUPS } from "./words.js";
import { schoolList } from "./store.js";
import { registerSplits } from "./syllables.js";

export function schoolGroup() {
  const list = schoolList();
  if (!list?.words?.length) return null;
  registerSplits(list.splits);
  return {
    label: list.name || "School spellings",
    isSchool: true,
    families: [
      {
        id: "school",
        name: list.name || "This week's spellings",
        tip: "These are your spellings from school. Chop them into beats and spell them chunk by chunk.",
        words: list.words,
      },
    ],
  };
}

export function getGroups() {
  const school = schoolGroup();
  return school ? { school, ...YEAR_GROUPS } : { ...YEAR_GROUPS };
}

export const getGroup = (key) => getGroups()[key] || null;

export function findFamily(id) {
  for (const [key, g] of Object.entries(getGroups())) {
    const fam = g.families.find((f) => f.id === id);
    if (fam) return { groupKey: key, group: g, fam };
  }
  return null;
}

export const allWords = (group) => group.families.flatMap((f) => f.words);

/** Families with a real shared pattern (not the mixed 'tricky words' sets). */
export const patternFamilies = (group) => group.families.filter((f) => !f.id.includes("tricky") && f.id !== "school");
