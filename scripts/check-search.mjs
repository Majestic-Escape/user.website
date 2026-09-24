// Checks the destination-search libraries without a test runner:
//   - src/lib/places/normalize.ts matches the server's golden vectors
//     (src/lib/places/__fixtures__/place-normalize-vectors.json, pinned by
//     sha256 — server.me pins the same hash in tests/batch-s/place-search.test.js)
//   - src/lib/places/match.ts ranks suggestions as intended and stays fast
//   - src/lib/search/search-url.ts builds safe /filter URLs and reads old links
// The TypeScript sources are transpiled in memory (no build step).
//
// Usage: node scripts/check-search.mjs   (npm run check:search)
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const projectRequire = createRequire(join(root, "package.json"));
const ts = projectRequire("typescript");
const cache = new Map();

function loadTs(file) {
  const abs = resolve(file);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = readFileSync(abs, "utf8");
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  cache.set(abs, module);
  const req = (spec) => {
    if (spec.startsWith("./") || spec.startsWith("../")) return loadTs(resolve(dirname(abs), spec) + ".ts");
    if (spec.startsWith("@/")) return loadTs(join(root, "src", spec.slice(2)) + ".ts");
    return projectRequire(spec);
  };
  new Function("module", "exports", "require", out)(module, module.exports, req);
  return module.exports;
}

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL ${name}\n       ${e.message.split("\n").join("\n       ")}`);
  }
}

const N = loadTs(join(root, "src/lib/places/normalize.ts"));
const M = loadTs(join(root, "src/lib/places/match.ts"));
const U = loadTs(join(root, "src/lib/search/search-url.ts"));

console.log("normalisation (parity with server.me)");
check("golden vectors pinned", () => {
  const raw = readFileSync(join(root, "src/lib/places/__fixtures__/place-normalize-vectors.json"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(createHash("sha256").update(raw).digest("hex"), "e1bc35da8ac20d7f4c5604a0bd5707e7f452a44df48907c0ced8ea52cbd9c7d2", "fixture changed: update both repos");
  for (const v of JSON.parse(raw).vectors) {
    assert.equal(N.normalizePlaceText(v.input), v.normalized, JSON.stringify(v.input));
    assert.equal(N.compactKey(v.normalized), v.compact);
  }
});

console.log("suggestions");
const labels = ["North Goa, Goa", "South Goa, Goa", "Goa", "", "Kulu, Himachal Pradesh", "Chennai, Tamil Nadu", "Maharashtra"];
const payload = {
  version: 1,
  labels,
  rows: [
    ["st:goa", "Goa", "s", 3, "", 11, 0],
    ["gn:9255562", "North Goa", "d", 2, "", 9, 818],
    ["gn:9255567", "South Goa", "d", 2, "", 2, 640],
    ["gn:1260607", "Panaji", "c", 0, "Panjim|Pangim|Ponnje", 2, 71],
    ["gn:1253367", "Vasco da Gama", "c", 1, "Vasco|Vasko-da-Gama", 0, 100],
    ["gn:1264588", "Margao", "t", 1, "Madgaon", 1, 88],
    ["gn:1265000", "Calangute", "t", 0, "", 2, 17],
    ["gn:1276000", "Candolim", "t", 0, "", 0, 9],
    ["gn:1263840", "Mandrem", "t", 0, "", 1, 8],
    ["gn:1276001", "Colva", "t", 1, "", 1, 12],
    ["gn:1276002", "Colvale", "t", 0, "Colovale", 0, 6],
    ["gn:1263000", "Manali", "t", 4, "", 0, 8],
    ["gn:1263001", "Manali", "t", 5, "", 0, 30],
    ["gn:1275339", "Mumbai", "c", 6, "Bombay", 0, 12691],
    ["l:goa:seraulim", "Seraulim", "l", 1, "", 1, 0],
    ["bad"],
    [42, "x", "t", 0, "", 0, 0],
  ],
};
const idx = M.buildPlacesIndex(payload);
const top = (q, n = 1) => M.suggestPlaces(idx, q).slice(0, n).map((s) => s.name + (s.label ? `|${s.label}` : ""));
check("malformed payloads → null (free-text fallback)", () => {
  for (const bad of [null, "x", {}, { labels: [], rows: "x" }, { labels: "x", rows: [] }, { labels: [], rows: [["only-id"]] }]) assert.equal(M.buildPlacesIndex(bad), null);
  assert.equal(idx.entries.length, 15, "bad rows skipped, good rows kept");
});
check("aliases, prefixes, case, diacritics", () => {
  assert.deepEqual(top("panjim"), ["Panaji|North Goa, Goa"]);
  assert.deepEqual(top("PAN"), ["Panaji|North Goa, Goa"]);
  assert.deepEqual(top("Panají"), ["Panaji|North Goa, Goa"]);
  assert.deepEqual(top("vasco"), ["Vasco da Gama|South Goa, Goa"]);
  assert.deepEqual(top("madgaon"), ["Margao|South Goa, Goa"]);
  assert.deepEqual(top("bombay"), ["Mumbai|Maharashtra"]);
  assert.deepEqual(top("north g"), ["North Goa|Goa"]);
  assert.deepEqual(top("goa"), ["Goa"], "the state first");
});
check("typos while typing", () => {
  assert.deepEqual(top("panjm"), ["Panaji|North Goa, Goa"]);
  assert.deepEqual(top("vasko"), ["Vasco da Gama|South Goa, Goa"]);
  assert.deepEqual(top("calangut"), ["Calangute|North Goa, Goa"]);
  assert.deepEqual(M.suggestPlaces(idx, "xq"), [], "no fuzzy under 5 characters");
  assert.deepEqual(top("panj", 8), ["Panaji|North Goa, Goa"], "a 4-letter prefix never pulls look-alikes");
  assert.deepEqual(top("vasko"), ["Vasco da Gama|South Goa, Goa"]);
});
check("stays break ties; parent qualifier filters", () => {
  assert.deepEqual(top("colv"), ["Colva|South Goa, Goa"], "Colva (1 stay) before Colvale");
  assert.deepEqual(top("manali", 2), ["Manali|Chennai, Tamil Nadu", "Manali|Kulu, Himachal Pradesh"], "same score → population");
  assert.deepEqual(top("manali, himachal"), ["Manali|Kulu, Himachal Pradesh"]);
  assert.deepEqual(top("seraul"), ["Seraulim|South Goa, Goa"], "live places are suggested");
});
check("popular = localities with the most stays", () => {
  assert.deepEqual(M.popularPlaces(idx, 3).map((p) => p.name), ["Panaji", "Calangute", "Margao"]);
  assert.deepEqual(M.popularPlaces(null), []);
  assert.deepEqual(M.suggestPlaces(null, "goa"), []);
});
check("hostile input is inert", () => {
  for (const q of ["<img src=x onerror=alert(1)>", ".*", "‮", "a".repeat(5000), "%00", "'; drop"]) M.suggestPlaces(idx, q);
});
check("performance: 2,500-place index, p95 per keystroke", () => {
  const rows = [];
  const syll = ["pa", "na", "ji", "va", "sco", "ma", "ra", "go", "ka", "li", "de", "an", "ju", "ba", "ga", "co", "la", "ve", "ri"];
  for (let i = 0; i < 2500; i++) {
    const name = syll[i % 19] + syll[(i * 7) % 19] + syll[(i * 13) % 19] + (i % 3 ? " " + syll[(i * 5) % 19] + syll[(i * 11) % 19] : "");
    rows.push([`gn:${i}`, name[0].toUpperCase() + name.slice(1), "tvc"[i % 3], i % 7, i % 5 ? "" : `${name}pur|${name}nagar`, i % 11, i % 97]);
  }
  const big = M.buildPlacesIndex({ version: 1, labels: labels.concat(["A, B", "C, D", "E, F", "G, H"]), rows });
  const t = [];
  for (const q of ["p", "pa", "pan", "panj", "panji", "vasko", "gora", "kalid", "zzzz", "north", "mara ga"]) {
    for (let k = 0; k < 20; k++) {
      const s = process.hrtime.bigint();
      M.suggestPlaces(big, q);
      t.push(Number(process.hrtime.bigint() - s) / 1e6);
    }
  }
  t.sort((a, b) => a - b);
  const p50 = t[Math.floor(t.length / 2)];
  const p95 = t[Math.floor(t.length * 0.95)];
  console.log(`       suggestPlaces p50 ${p50.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms (Node; a mid phone is ~4x slower)`);
  assert.ok(p95 < 4, `p95 ${p95}`);
});

console.log("search URLs and dates");
check("one builder: encoded, no empties, ISO days, ~1 km near-me", () => {
  const url = U.buildFilterUrl({ location: " Colva & Benaulim #1 ", placeId: "gn:1", from: new Date(2026, 9, 24), to: new Date(2026, 9, 26), totalGuests: 3, adults: 2, children: 1, infants: 0, amenities: ["Wifi", "Swimming pool"], placeType: "Entire Place", pets: "no_pets", priceMin: 0 });
  const p = new URL(url, "https://x").searchParams;
  assert.equal(p.get("location"), "Colva & Benaulim #1");
  assert.equal(p.get("from"), "2026-10-24");
  assert.equal(p.get("to"), "2026-10-26");
  assert.equal(p.get("amenities"), "wifi,swimming_pool");
  assert.equal(p.get("placeType"), "Entire_Place");
  assert.equal(p.get("infants"), null, "empty values are omitted");
  assert.equal(p.get("priceMin"), null);
  const near = new URL(U.buildFilterUrl({ near: { lat: 15.567891, lng: 73.771234 } }), "https://x").searchParams;
  assert.equal(near.get("lat"), "15.57");
  assert.equal(near.get("lng"), "73.77");
  assert.ok(!U.buildFilterUrl({ near: { lat: 15.567891, lng: 73.771234 } }).includes("5678"), "never more than 2 decimals");
  assert.equal(U.buildFilterUrl({}), "/filter");
});
check("dates: current and legacy links, calendar-checked", () => {
  const d = (s) => U.formatSearchDate(U.parseSearchDate(s));
  assert.equal(d("2026-09-24"), "2026-09-24");
  assert.equal(d("24/9/2026"), "2026-09-24", "en-IN day > 12");
  assert.equal(d("9/24/2026"), "2026-09-24", "en-US month first");
  assert.equal(d("24.9.2026"), "2026-09-24");
  assert.equal(d("2026/9/24"), "2026-09-24");
  assert.equal(d("29/2/2028"), "2028-02-29", "leap day");
  assert.equal(d("29/2/2027"), "", "not a real day");
  assert.equal(d("2026-02-30"), "");
  assert.equal(d("31/31/2026"), "");
  assert.equal(d("nope"), "");
  assert.equal(d(""), "");
  assert.equal(d(null), "");
  const order = new Intl.DateTimeFormat().formatToParts(new Date(2000, 10, 22)).filter((x) => x.type === "day" || x.type === "month").map((x) => x.type[0]).join("");
  assert.equal(d("3/4/2026"), order === "md" ? "2026-03-04" : "2026-04-03", "ambiguous → this browser's order");
});

if (failures) {
  console.log(`\ncheck-search: ${failures} failing`);
  process.exit(1);
}
console.log("\ncheck-search: OK");
