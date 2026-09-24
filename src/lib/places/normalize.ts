// Place-name normalisation — a byte-for-byte port of server.me
// utils/placeText.js. Both repos assert the same golden vectors
// (src/lib/places/__fixtures__/place-normalize-vectors.json here,
// tests/batch-s/fixtures/place-normalize-vectors.json there; pinned by
// sha256 in `npm run check:places`). Change both or neither.
//
// "Panaji", " PANAJI ", "Panají" → "panaji"; "Vasco-da-Gama" → "vasco da gama";
// compactKey drops spaces so "Narendra Nagar" equals "Narendranagar".
const MAX_INPUT = 200;
const MAX_KEY = 100;

export function normalizePlaceText(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .slice(0, MAX_INPUT)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, MAX_KEY)
    .trim();
}

export function compactKey(normalized: string): string {
  return String(normalized || "").replace(/ /g, "");
}

// Damerau-Levenshtein (optimal string alignment), bounded: returns max + 1
// as soon as the distance must exceed `max`.
export function boundedEditDistance(a: string, b: string, max: number): number {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  if (a === b) return 0;
  let prev2: number[] | null = null;
  let prev: number[] = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    const cur: number[] = new Array(lb + 1);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[lb] > max ? max + 1 : prev[lb];
}

// Edits a typed key may be away from a name: none below 4 characters, one
// up to 7, two from 8 (same budget as the server's typo correction).
export function fuzzyBudget(len: number): number {
  if (len < 4) return 0;
  if (len < 8) return 1;
  return 2;
}
