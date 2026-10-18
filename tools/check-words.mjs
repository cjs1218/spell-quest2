// Checks every statutory word appears exactly once in js/words.js.
// Run: node tools/check-words.mjs
import { YEAR_GROUPS } from "../js/words.js";

const STATUTORY = {
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
  console.log(`${key}: ${actual.length} words, ${YEAR_GROUPS[key].families.length} families`);
  for (const [label, arr] of [["missing", missing], ["extra", extra], ["duplicated", dupes]]) {
    if (arr.length) { ok = false; console.log(`  ${label}: ${arr.join(", ")}`); }
  }
}
process.exit(ok ? 0 : 1);
