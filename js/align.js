// Lines up what the child wrote with the real word, letter by letter, so
// feedback only highlights the letters that are actually different.
// e.g. "becuse" vs "because" → only the missing "a" is highlighted, instead of
// every letter after it looking wrong.

/**
 * Returns a list of steps, each one of:
 *   { kind: "same",  word: "b", answer: "b" }   right letter
 *   { kind: "swap",  word: "a", answer: "e" }   wrong letter in this place
 *   { kind: "missing", word: "a" }              letter the child left out
 *   { kind: "extra", answer: "x" }              letter the child added
 * Swapped neighbours (e.g. "fiedn" for "fiend") count as one "swap" pair.
 */
export function alignSpelling(answer, word) {
  const a = [...(answer || "")];
  const w = [...word];
  const lower = (c) => (c || "").toLowerCase();
  const n = a.length, m = w.length;

  // Edit distance with adjacent swaps (Damerau–Levenshtein, optimal string alignment).
  const D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) D[i][0] = i;
  for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = lower(a[i - 1]) === lower(w[j - 1]) ? 0 : 1;
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && lower(a[i - 1]) === lower(w[j - 2]) && lower(a[i - 2]) === lower(w[j - 1])) {
        D[i][j] = Math.min(D[i][j], D[i - 2][j - 2] + 1);
      }
    }
  }

  // Walk back from the end to recover the steps.
  const steps = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lower(a[i - 1]) === lower(w[j - 1]) && D[i][j] === D[i - 1][j - 1]) {
      steps.push({ kind: "same", word: w[j - 1], answer: a[i - 1] });
      i--; j--;
    } else if (i > 1 && j > 1 && lower(a[i - 1]) === lower(w[j - 2]) && lower(a[i - 2]) === lower(w[j - 1]) && D[i][j] === D[i - 2][j - 2] + 1) {
      steps.push({ kind: "swap", word: w[j - 1], answer: a[i - 1], turned: true });
      steps.push({ kind: "swap", word: w[j - 2], answer: a[i - 2], turned: true });
      i -= 2; j -= 2;
    } else if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) {
      steps.push({ kind: "swap", word: w[j - 1], answer: a[i - 1] });
      i--; j--;
    } else if (j > 0 && D[i][j] === D[i][j - 1] + 1) {
      steps.push({ kind: "missing", word: w[j - 1] });
      j--;
    } else {
      steps.push({ kind: "extra", answer: a[i - 1] });
      i--;
    }
  }
  return steps.reverse();
}

// "an a", "a b", "an f"... chosen by how the letter's NAME sounds.
const letter = (c) => `${/^[aefhilmnorsx]$/i.test(c) ? "an" : "a"} ${c.toLowerCase()}`;

/** A short, kind sentence describing the difference, for reading aloud. */
export function describeDifference(steps) {
  const missing = steps.filter((s) => s.kind === "missing").map((s) => s.word);
  const extra = steps.filter((s) => s.kind === "extra").map((s) => s.answer);
  const turned = steps.some((s) => s.turned);
  const swaps = steps.filter((s) => s.kind === "swap" && !s.turned);
  const total = missing.length + extra.length + swaps.length + (turned ? 1 : 0);
  if (total === 0) return "";
  if (total > 2) return "So close! Let's look at the orange letters together.";
  const parts = [];
  if (missing.length) parts.push(`it needs ${missing.map(letter).join(" and ")}`);
  if (extra.length) parts.push(`it doesn't need the extra ${extra.map((c) => c.toLowerCase()).join(" and ")}`);
  if (swaps.length) parts.push(swaps.map((x) => `the ${x.answer.toLowerCase()} should be ${letter(x.word)}`).join(", and "));
  if (turned) parts.push("two letters are the wrong way round");
  const text = parts.join(", and ");
  return `So close! ${text[0].toUpperCase()}${text.slice(1)}.`;
}
