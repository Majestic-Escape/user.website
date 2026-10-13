// Checks the stay page's related rows without a test runner:
//   - src/lib/related-stays.ts validates the untrusted API payload (shape,
//     caps, duplicates, the stay itself, unsafe photo URLs, ratings without
//     reviews) and builds the card / heading copy
//   - the components keep their contract: links do not prefetch, the row is
//     a labelled list, the server fetch is bounded, no raw HTML
// The TypeScript source is transpiled in memory (no build step).
//
// Usage: node scripts/check-related.mjs   (npm run check:related)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const projectRequire = createRequire(join(root, "package.json"));
const ts = projectRequire("typescript");

function loadTs(file) {
  const src = readFileSync(file, "utf8");
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", out)(module, module.exports, projectRequire);
  return module.exports;
}

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${name}\n     ${e.message.split("\n").join("\n     ")}`);
  }
}

const R = loadTs(join(root, "src/lib/related-stays.ts"));
const SRC = "aaaaaaaaaaaaaaaaaaaaaaaa";
const HOST = "bbbbbbbbbbbbbbbbbbbbbbbb";
const id = (n) => n.toString(16).padStart(24, "c");
const card = (n, over = {}) => ({
  _id: id(n),
  title: `Stay ${n}`,
  propertyType: "villa",
  photos: [`https://cdn.example/${n}.jpg`],
  address: { city: "Panaji", district: "North Goa", state: "Goa", latitude: 15.5, longitude: 73.8 },
  basePrice: 4200,
  guests: 4,
  bedrooms: 2,
  averageRating: 4.6,
  reviewCount: 3,
  ...over,
});
const body = (over = {}) => ({ host: [card(1)], nearby: [{ ...card(2), distanceKm: 3.2 }], nearbyScope: "near", sourceHostId: HOST, ...over });

check("valid payload → both rows, documented fields only", () => {
  const r = R.readRelatedStays(body(), SRC);
  assert.equal(r.host.length, 1);
  assert.equal(r.nearby.length, 1);
  assert.equal(r.sourceHostId, HOST);
  assert.equal(r.nearbyScope, "near");
  assert.deepEqual(Object.keys(r.host[0]).sort(), ["_id", "averageRating", "basePrice", "bedrooms", "city", "distanceKm", "district", "guests", "photo", "propertyType", "reviewCount", "state", "title"]);
  assert.equal(r.host[0].distanceKm, null, "host cards carry no distance");
  assert.equal(r.nearby[0].distanceKm, 3.2);
  assert.ok(!("latitude" in r.host[0]), "the points are not passed on to the UI");
});

check("wrong shape → null (whole payload)", () => {
  for (const bad of [null, "x", [], {}, body({ host: null }), body({ nearby: {} }), body({ nearbyScope: "close" }), body({ sourceHostId: "nope" }), body({ sourceHostId: 7 })]) {
    assert.equal(R.readRelatedStays(bad, SRC), null, JSON.stringify(bad)?.slice(0, 80));
  }
  assert.ok(R.readRelatedStays(body({ sourceHostId: null, host: [] }), SRC), "null host id is allowed");
});

check("bad cards are dropped, not the row", () => {
  const r = R.readRelatedStays(body({ host: [card(1, { _id: "x" }), card(2, { title: "  " }), null, 5, card(3)] }), SRC);
  assert.deepEqual(r.host.map((c) => c._id), [id(3)]);
});

check("caps (12 / 8), no duplicates across rows, never the stay itself", () => {
  const host = Array.from({ length: 20 }, (_, i) => card(i + 1));
  const nearby = [card(1), { ...card(SRC_N()), _id: SRC }, ...Array.from({ length: 20 }, (_, i) => ({ ...card(100 + i), distanceKm: i }))];
  const r = R.readRelatedStays(body({ host: [...host, { ...card(1) }, { ...card(9), _id: SRC }], nearby }), SRC);
  assert.equal(r.host.length, 12);
  assert.equal(r.nearby.length, 8);
  const all = [...r.host, ...r.nearby].map((c) => c._id);
  assert.equal(new Set(all).size, all.length);
  assert.ok(!all.includes(SRC));
});
function SRC_N() { return 999; }

check("unsafe values are neutralised", () => {
  const r = R.readRelatedStays(body({
    host: [card(1, { photos: ["javascript:alert(1)"], basePrice: -5, guests: "4", averageRating: 9, reviewCount: 2 }), card(2, { photos: ["http://plain.example/x.jpg"], reviewCount: 0, averageRating: 5 }), card(3, { title: "x".repeat(500) })],
    nearby: [{ ...card(4), distanceKm: -1 }, { ...card(5), distanceKm: Infinity }],
  }), SRC);
  const [a, b, c] = r.host;
  assert.equal(a.photo, null, "javascript: URL dropped");
  assert.equal(b.photo, null, "plain http dropped (mixed content)");
  assert.equal(a.basePrice, null);
  assert.equal(a.guests, null, "numbers only");
  assert.equal(a.averageRating, null, "rating out of range");
  assert.equal(b.averageRating, null, "no rating without reviews");
  assert.equal(c.title.length, 200);
  assert.deepEqual(r.nearby.map((x) => x.distanceKm), [null, null]);
});

check("unavailable: an explicit 'could not answer', never rows", () => {
  const r = R.readRelatedStays({ host: [], nearby: [], nearbyScope: null, sourceHostId: null, unavailable: true }, SRC);
  assert.deepEqual(r, { host: [], nearby: [], nearbyScope: null, sourceHostId: null, unavailable: true });
  const forged = R.readRelatedStays(body({ unavailable: true }), SRC);
  assert.equal(forged.host.length + forged.nearby.length, 0, "rows next to the flag are ignored");
  assert.equal(R.readRelatedStays(body(), SRC).unavailable, false);
  assert.equal(R.readRelatedStays(body({ unavailable: "yes" }), SRC), null, "flag must be boolean");
  const page = readFileSync(join(root, "src/app/(landing)/stay/[id]/page.jsx"), "utf8");
  assert.match(page, /rows && !rows\.unavailable \? rows : null/, "the server render never keeps it");
});

check("scope is null when no nearby card survives", () => {
  assert.equal(R.readRelatedStays(body({ nearby: [], nearbyScope: "wide" }), SRC).nearbyScope, null);
  assert.equal(R.readRelatedStays(body({ nearby: [{ _id: "bad" }], nearbyScope: "mixed" }), SRC).nearbyScope, null);
});

check("card copy", () => {
  assert.equal(R.stayFacts({ propertyType: "villa", guests: 4 }), "Villa · 4 guests");
  assert.equal(R.stayFacts({ propertyType: null, guests: 1 }), "1 guest");
  assert.equal(R.stayFacts({ propertyType: "flat", guests: null }), "Flat");
  assert.equal(R.stayFacts({ propertyType: null, guests: null }), "");
  assert.equal(R.stayPlace({ city: "Panaji", district: "North Goa", state: "Goa" }), "Panaji, Goa");
  assert.equal(R.stayPlace({ city: "goa", district: "caranzalem", state: "Goa" }), "Caranzalem, Goa", "state typed as the city");
  assert.equal(R.stayPlace({ city: null, district: null, state: null }), "");
  assert.equal(R.distanceCopy(null), "");
  assert.equal(R.distanceCopy(0.4), "Less than 1 km from this stay");
  assert.equal(R.distanceCopy(3.24), "About 3.2 km from this stay");
  assert.equal(R.distanceCopy(42.6), "About 43 km from this stay");
});

check("headings never claim a radius", () => {
  assert.equal(R.HOST_ROW_TITLE("Asha"), "More stays hosted by Asha");
  assert.equal(R.NEARBY_ROW_TITLE, "Similar stays nearby");
  assert.equal(R.nearbySubtitle("near"), null);
  assert.equal(R.nearbySubtitle("mixed"), "More options farther away");
  assert.equal(R.nearbySubtitle("wide"), "More options farther away");
  assert.equal(R.nearbySubtitle(null), null);
  const src = readFileSync(join(root, "src/lib/related-stays.ts"), "utf8");
  assert.ok(!/within \d+ ?km|closest/i.test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), "no radius / 'closest' claim in copy");
});

check("component contract", () => {
  const read = (p) => readFileSync(join(root, p), "utf8");
  const cardSrc = read("src/components/related-stay-card.jsx");
  const rowSrc = read("src/components/stay-row.jsx");
  const sectionSrc = read("src/components/related-stays.jsx");
  const pageSrc = read("src/app/(landing)/stay/[id]/page.jsx");
  const clientSrc = read("src/app/(landing)/stay/[id]/PropertyPageClient.jsx");
  assert.match(cardSrc, /prefetch=\{false\}/, "cards never prefetch");
  assert.match(cardSrc, /aria-labelledby=/, "link named by the title");
  // identical baselines whatever the content: fixed line slots, bottom-anchored footer, tabular numbers
  assert.match(cardSrc, /h-\[2\.75em\]/, "the title always reserves two lines");
  assert.match(cardSrc, /const line = "block h-5 truncate/, "each detail line is one fixed-height slot");
  assert.match(cardSrc, /reserveDistance \|\| distance/, "the distance slot is reserved for the whole nearby row");
  assert.match(cardSrc, /data-line="footer" className="mt-auto /, "the price row is anchored to the card bottom");
  assert.match(cardSrc, /tabular-nums/, "prices and counts use tabular figures");
  assert.ok(!/items-baseline/.test(cardSrc), "baseline alignment shifted the price next to the rating icon");
  assert.match(sectionSrc, /reserveDistance/, "the nearby row passes reserveDistance");
  assert.match(rowSrc, /me-reveal-item flex /, "row items stretch so every card is as tall as the tallest");
  assert.match(rowSrc, /aria-labelledby=\{headingId\}/);
  assert.match(rowSrc, /role="list"/);
  assert.match(rowSrc, /aria-disabled=\{edges\.end\}/, "ends are aria-disabled (keeps keyboard focus)");
  assert.ok(!/disabled=\{/.test(rowSrc), "no native disabled on the row controls (it drops focus to <body>)");
  assert.match(rowSrc, /lg:-mx-1\.5 lg:scroll-px-1\.5 lg:gap-5 lg:px-1\.5/, "inline padding keeps focus rings unclipped at lg");
  assert.match(rowSrc, /prefers-reduced-motion/);
  assert.match(sectionSrc, /\.\.\.PUBLIC/);
  assert.match(sectionSrc, /RELATED_CLIENT_TIMEOUT_MS/, "every browser attempt has a deadline");
  assert.match(sectionSrc, /Promise\.race\(\[work, expired\]\)/, "the deadline rejects the attempt itself, not only its fetch signal");
  assert.match(sectionSrc, /if \(rows\.unavailable\) \{[\s\S]*?throw err/, "unavailable is a failure, never data");
  assert.ok(R.RELATED_CLIENT_TIMEOUT_MS <= 6000);
  assert.match(sectionSrc, /queryKeys\.relatedStays\(/);
  assert.match(pageSrc, /AbortSignal\.timeout\(RELATED_TIMEOUT_MS\)/);
  assert.match(pageSrc, /readRelatedStays\(/);
  assert.match(clientSrc, /isLive \? \(\s*<RelatedStays/, "rows only for a live stay");
  for (const [n, s] of [["card", cardSrc], ["row", rowSrc], ["section", sectionSrc]]) assert.ok(!/dangerouslySetInnerHTML/.test(s), n);
  assert.ok(R.RELATED_TIMEOUT_MS <= 2500);
});

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\ncheck-related: all checks passed");
