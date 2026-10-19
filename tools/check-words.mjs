// Checks every statutory / common exception word appears exactly once per year group.
// Run: node tools/check-words.mjs
import { YEAR_GROUPS } from "../js/words.js";
import { SYLLABLES } from "../js/syllables.js";

const STATUTORY = {
  y1: `the a do to today of said says are were was is his has I you your they be he me she we no go so by my here there where love come some one once ask friend school put push pull full house our`,
  y2: `door floor poor because find kind mind behind child children wild climb most only both old cold gold hold told every everybody even great break steak pretty beautiful after fast last past father class grass pass plant path bath hour move prove improve sure sugar eye could should would who whole any many clothes busy people water again half money Mr Mrs parents Christmas`,
  y34: `accident accidentally actual actually address answer appear arrive believe bicycle breath breathe build busy business calendar caught centre century certain circle complete consider continue decide describe different difficult disappear early earth eight eighth enough exercise experience experiment extreme famous favourite February forward forwards fruit grammar group guard guide heard heart height history imagine increase important interest island knowledge learn length library material medicine mention minute natural naughty notice occasion occasionally often opposite ordinary particular peculiar perhaps popular position possess possession possible potatoes pressure probably promise purpose quarter question recent regular reign remember sentence separate special straight strange strength suppose surprise therefore though although thought through various weight woman women`,
  y56: `accommodate accompany according achieve aggressive amateur ancient apparent appreciate attached available average awkward bargain bruise category cemetery committee communicate community competition conscience conscious controversy convenience correspond criticise curiosity definite desperate determined develop dictionary disastrous embarrass environment equip equipped equipment especially exaggerate excellent existence explanation familiar foreign forty frequently government guarantee harass hindrance identity immediate immediately individual interfere interrupt language leisure lightning marvellous mischievous muscle necessary neighbour nuisance occupy occur opportunity parliament persuade physical prejudice privilege profession programme pronunciation queue recognise recommend relevant restaurant rhyme rhythm sacrifice secretary shoulder signature sincere sincerely soldier stomach sufficient suggest symbol system temperature thorough twelfth variety vegetable vehicle yacht`,
};

let ok = true;
for (const [key, list] of Object.entries(STATUTORY)) {
  const expected = list.split(/\s+/);
  const actual = YEAR_GROUPS[key].families.flatMap((f) => f.words);
  const missing = expected.filter((w) => !actual.includes(w));
  const extra = actual.filter((w) => !expected.includes(w));
  const dupes = actual.filter((w, i) => actual.indexOf(w) !== i);
  const noSyl = actual.filter((w) => !SYLLABLES[w]);
  const badSyl = actual.filter((w) => SYLLABLES[w] && SYLLABLES[w].join("") !== w);
  if (noSyl.length) { ok = false; console.log(`  no syllables: ${noSyl.join(", ")}`); }
  if (badSyl.length) { ok = false; console.log(`  syllables don't spell the word: ${badSyl.join(", ")}`); }
  console.log(`${key}: ${actual.length} words, ${YEAR_GROUPS[key].families.length} families`);
  for (const [label, arr] of [["missing", missing], ["extra", extra], ["duplicated", dupes]]) {
    if (arr.length) { ok = false; console.log(`  ${label}: ${arr.join(", ")}`); }
  }
}


// Check every memory trick fits its word.
const { TRICKS } = await import("../js/mnemonics.js");
const allWords = new Set(Object.values(YEAR_GROUPS).flatMap((g) => g.families.flatMap((f) => f.words)));
for (const [word, t] of Object.entries(TRICKS)) {
  const w = word.toLowerCase();
  let problem = "";
  if (!allWords.has(word)) problem = "not in the word lists";
  else if (t.kind === "hidden" && !w.includes(t.hide.toLowerCase())) problem = `doesn't contain "${t.hide}"`;
  else if (t.kind === "letters" && t.marks.some((m) => !w.includes(m))) problem = "marked letters not in word";
  else if (t.kind === "acrostic") {
    const part = (t.part || word).toLowerCase();
    const initials = t.text.replace(/[!.,]/g, "").split(/\s+/).map((x) => x[0].toLowerCase()).join("").slice(0, part.length);
    if (!w.includes(part)) problem = `doesn't contain "${part}"`;
    else if (initials !== part) problem = `first letters spell "${initials}", not "${part}"`;
  }
  if (problem) { ok = false; console.log(`  trick for ${word}: ${problem}`); }
}
console.log(`tricks: ${Object.keys(TRICKS).length} (${Object.values(TRICKS).filter((t) => t.source === "common").length} common, ${Object.values(TRICKS).filter((t) => t.source === "suggested").length} suggested)`);
process.exitCode = ok ? 0 : 1;
