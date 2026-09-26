// Checks the search / navigation / chat-cache logic without a test runner:
//   - lib/search/search-state.ts: guest counting (infants excluded, adults
//     follow children), summaries, date-range picking, reading a /filter URL
//   - lib/nav/active.ts: which menu item a page lights
//   - lib/chat/threadCache.js, lib/conversationsCache.js,
//     lib/propertyDetailsCache.js: on-device chat copies — account + role
//     isolation, only server messages of that thread, size bounds, expiry,
//     no private listing fields
// Sources are transpiled in memory; a Map-backed localStorage stands in.
//
// Usage: node scripts/check-ux.mjs   (npm run check:ux)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const projectRequire = createRequire(join(root, "package.json"));
const ts = projectRequire("typescript");
const cache = new Map();

function resolveSpec(fromFile, spec) {
  const base = spec.startsWith("@/") ? join(root, "src", spec.slice(2)) : resolve(dirname(fromFile), spec);
  for (const ext of ["", ".ts", ".tsx", ".js"]) {
    try {
      readFileSync(base + ext);
      return base + ext;
    } catch {
      // next
    }
  }
  throw new Error(`cannot resolve ${spec} from ${fromFile}`);
}

function load(file) {
  const abs = resolve(file);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = readFileSync(abs, "utf8");
  const out = ts.transpileModule(src, { fileName: abs, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, allowJs: true } }).outputText;
  const module = { exports: {} };
  cache.set(abs, module);
  const req = (spec) => (spec.startsWith(".") || spec.startsWith("@/") ? load(resolveSpec(abs, spec)) : projectRequire(spec));
  new Function("module", "exports", "require", out)(module, module.exports, req);
  return module.exports;
}

class MemStorage {
  constructor() {
    this.m = new Map();
  }
  get length() {
    return this.m.size;
  }
  key(i) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k) {
    return this.m.has(k) ? this.m.get(k) : null;
  }
  setItem(k, v) {
    this.m.set(k, String(v));
  }
  removeItem(k) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}
globalThis.window = { localStorage: new MemStorage(), sessionStorage: new MemStorage() };

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

const S = load(join(root, "src/lib/search/search-state.ts"));
const A = load(join(root, "src/lib/nav/active.ts"));
const T = load(join(root, "src/lib/chat/threadCache.js"));
const C = load(join(root, "src/lib/conversationsCache.js"));
const P = load(join(root, "src/lib/propertyDetailsCache.js"));

console.log("guests");
check("capacity excludes infants; summary", () => {
  const g = { adults: 2, children: 1, infants: 1 };
  assert.equal(S.capacityGuests(g), 3);
  assert.equal(S.guestSummary(g), "3 guests, 1 infant");
  assert.equal(S.guestSummary({ adults: 1, children: 0, infants: 2 }), "1 guest, 2 infants");
  assert.equal(S.guestSummary(S.NO_GUESTS), "");
});
check("a child or infant brings an adult; the last adult stays while they travel", () => {
  let g = S.stepGuests(S.NO_GUESTS, "children", 1);
  assert.deepEqual(g, { adults: 1, children: 1, infants: 0 });
  assert.equal(S.canDecrease(g, "adults"), false);
  g = S.stepGuests(g, "children", -1);
  assert.equal(S.canDecrease(g, "adults"), true);
  assert.deepEqual(S.stepGuests({ adults: 0, children: 0, infants: 0 }, "adults", -1), S.NO_GUESTS);
});
check("sanitizeGuests clamps junk", () => {
  assert.deepEqual(S.sanitizeGuests({ adults: "3", children: -2, infants: "x" }), { adults: 3, children: 0, infants: 0 });
  assert.deepEqual(S.sanitizeGuests({ adults: 1e9 }), { adults: 99, children: 0, infants: 0 });
  assert.deepEqual(S.sanitizeGuests(null), S.NO_GUESTS);
});

console.log("dates");
const day = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};
check("range picking", () => {
  let r = S.nextRange({ from: undefined, to: undefined }, day(3), "from");
  assert.equal(+r.from, +day(3));
  assert.equal(r.to, undefined);
  r = S.nextRange(r, day(6), "from");
  assert.equal(+r.to, +day(6));
  // a tap after a full range starts again, unless check-out is being edited
  assert.equal(S.nextRange(r, day(8), "from").to, undefined);
  assert.equal(+S.nextRange(r, day(8), "to").to, +day(8));
  // same day or earlier than check-in: new check-in, never a 0-night stay
  assert.deepEqual(S.nextRange({ from: day(3), to: undefined }, day(3), "to"), { from: day(3), to: undefined });
  assert.deepEqual(S.nextRange({ from: day(3), to: undefined }, day(1), "to"), { from: day(1), to: undefined });
  assert.match(S.nightsLabel({ from: day(3), to: day(6) }), /^3 nights · /);
  assert.match(S.nightsLabel({ from: day(3), to: day(4) }), /^1 night · /);
});
check("today selectable, yesterday not", () => {
  assert.equal(S.isPastDay(day(0)), false);
  assert.equal(S.isPastDay(day(-1)), true);
});
check("a /filter URL reads back into the search fields", () => {
  const f = (o) => new URLSearchParams(o);
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const s = S.searchFromParams(f({ location: "Arpora", placeId: "gn:1278359", from: ymd(day(5)), to: ymd(day(8)), adults: "3", senior: "2", children: "1", infants: "1" }));
  assert.equal(s.searchTerm, "Arpora");
  assert.equal(s.placeId, "gn:1278359");
  assert.equal(+s.from, +day(5));
  assert.deepEqual(s.guests, { adults: 2, children: 1, infants: 1 });
  const near = S.searchFromParams(f({ lat: "15.49", lng: "73.83", placeId: "gn:1" }));
  assert.equal(near.searchTerm, "Nearby");
  assert.equal(near.placeId, null);
  assert.deepEqual(near.near, { lat: 15.49, lng: 73.83 });
  // past, reversed or junk dates are dropped rather than shown
  assert.equal(S.searchFromParams(f({ from: ymd(day(-3)), to: ymd(day(2)) })).from, undefined);
  assert.equal(S.searchFromParams(f({ from: ymd(day(5)), to: ymd(day(4)) })).to, undefined);
  assert.equal(S.searchFromParams(f({ from: "31/31/2026" })).from, undefined);
  assert.equal(S.searchFromParams(f({ placeId: "x".repeat(200) })).placeId, null);
});

console.log("active menu item");
check("exact home, sections light for their sub-pages, longest wins", () => {
  const host = [{ href: "/host/dashboard", exact: true }, { href: "/host/inbox" }, { href: "/host/dashboard/bookings", also: ["/host/dashboard/active-bookings"] }, { href: "/host/dashboard/listings" }];
  assert.equal(A.activeHref("/host/dashboard", host), "/host/dashboard");
  assert.equal(A.activeHref("/host/dashboard/bookings/review-guest", host), "/host/dashboard/bookings");
  assert.equal(A.activeHref("/host/dashboard/active-bookings", host), "/host/dashboard/bookings");
  assert.equal(A.activeHref("/host/dashboard/revenue", host), null);
  const guest = [{ href: "/", exact: true }, { href: "/messages" }];
  assert.equal(A.activeHref("/", guest), "/");
  assert.equal(A.activeHref("/stays", guest), null);
  assert.equal(A.activeHref("/messagesx", guest), null);
});

console.log("chat copies on the device");
const U1 = "aaaaaaaaaaaaaaaaaaaaaaa1";
const U2 = "bbbbbbbbbbbbbbbbbbbbbbb2";
const msg = (conv, i, extra = {}) => ({ id: `m${conv}${i}`, conversationId: conv, clientMessageId: `c${i}`, senderId: U1, content: { text: `hello ${i}` }, createdAt: new Date(2026, 0, 1, 0, i).toISOString(), ...extra });
check("thread copy: this thread's server messages only, newest 40", () => {
  window.localStorage.clear();
  const list = [...Array(60)].map((_, i) => msg("c1", i));
  list.push({ id: "local-1", clientMessageId: "local-1", conversationId: "c1", status: "sending", content: { text: "unsent" } });
  list.push(msg("c2", 99)); // another thread's message on screen during a switch
  T.setCachedThread(U1, "guest", "c1", list);
  const got = T.getCachedThread(U1, "guest", "c1");
  assert.equal(got.length, 40);
  assert.ok(got.every((m) => m.conversationId === "c1" && m.id !== m.clientMessageId));
  assert.equal(got[got.length - 1].id, "mc159");
});
check("thread copy: account and role isolation", () => {
  assert.equal(T.getCachedThread(U2, "guest", "c1"), null);
  assert.equal(T.getCachedThread(U1, "host", "c1"), null);
  assert.equal(T.getCachedThread(U1, "admin", "c1"), null);
  T.setCachedThread(U1, "admin", "c1", [msg("c1", 1)]);
  assert.equal(window.localStorage.getItem(`me:threadCache:v1:admin:${U1}`), null);
});
check("thread copy: an empty or foreign list never wipes a stored thread", () => {
  T.setCachedThread(U1, "guest", "c1", []);
  T.setCachedThread(U1, "guest", "c1", [msg("c9", 1)]);
  assert.equal(T.getCachedThread(U1, "guest", "c1").length, 40);
});
check("thread copy: never stores the unmasked text an older chat server sends", () => {
  window.localStorage.clear();
  const flagged = msg("c3", 1, { content: { text: "call me on ******" }, moderation: { status: "flagged", originalContent: "call me on 9812345601" } });
  T.setCachedThread(U1, "guest", "c3", [flagged, msg("c3", 2)]);
  const raw = window.localStorage.getItem(`me:threadCache:v1:guest:${U1}`) || "";
  assert.ok(!raw.includes("9812345601") && !raw.includes("originalContent"), raw);
  const got = T.getCachedThread(U1, "guest", "c3");
  assert.equal(got[0].moderation.status, "flagged");
  assert.equal(got[0].content.text, "call me on ******");
  assert.equal(flagged.moderation.originalContent, "call me on 9812345601", "the on-screen copy is not mutated");
  T.setCachedThread(U1, "guest", "c1", [...Array(40)].map((_, i) => msg("c1", i + 20)));
});
check("thread copy: at most 12 threads, oldest dropped", () => {
  for (let i = 0; i < 15; i++) T.setCachedThread(U1, "guest", `t${i}`, [msg(`t${i}`, 1)]);
  const entry = JSON.parse(window.localStorage.getItem(`me:threadCache:v1:guest:${U1}`));
  assert.equal(Object.keys(entry.threads).length, 12);
  assert.equal(T.getCachedThread(U1, "guest", "c1"), null);
  assert.ok(T.getCachedThread(U1, "guest", "t14"));
});
check("thread copy: byte budget (long messages can't fill localStorage)", () => {
  window.localStorage.clear();
  const big = (conv) => [...Array(40)].map((_, i) => msg(conv, i, { content: { text: "x".repeat(4000) } }));
  for (let i = 0; i < 5; i++) T.setCachedThread(U1, "guest", `b${i}`, big(`b${i}`));
  const raw = window.localStorage.getItem(`me:threadCache:v1:guest:${U1}`) || "";
  assert.ok(raw.length <= 350000, raw.length);
  assert.ok(T.getCachedThread(U1, "guest", "b4"), "the newest thread is kept");
});
check("thread copy: expiry", () => {
  window.localStorage.clear();
  T.setCachedThread(U1, "guest", "c1", [msg("c1", 1)]);
  const key = `me:threadCache:v1:guest:${U1}`;
  const e = JSON.parse(window.localStorage.getItem(key));
  e.threads.c1.savedAt = Date.now() - 15 * 24 * 3600 * 1000;
  window.localStorage.setItem(key, JSON.stringify(e));
  assert.equal(T.getCachedThread(U1, "guest", "c1"), null);
});
check("clearCachedThreads removes every account's threads", () => {
  T.setCachedThread(U1, "guest", "c1", [msg("c1", 1)]);
  T.setCachedThread(U2, "host", "c1", [msg("c1", 1)]);
  T.clearCachedThreads();
  assert.equal([...window.localStorage.m.keys()].filter((k) => k.startsWith("me:threadCache:")).length, 0);
});
check("conversation list: persistent, isolated, previews trimmed", () => {
  window.localStorage.clear();
  const convs = [{ id: "c1", lastMessage: { content: "y".repeat(5000), sentAt: "2026-01-01" } }];
  C.setCachedConversations(U1, "guest", convs);
  assert.ok(window.localStorage.getItem("me:conversationsCache:v2:guest"));
  assert.equal(C.getCachedConversations(U1, "guest")[0].lastMessage.content.length, 280);
  assert.equal(C.getCachedConversations(U2, "guest"), null);
  assert.equal(C.getCachedConversations(U1, "host"), null);
  C.clearCachedConversations();
  assert.equal(C.getCachedConversations(U1, "guest"), null);
});
check("listing summaries: only row fields kept, bounded", () => {
  window.localStorage.clear();
  const full = { _id: "p1", title: "Villa", images: ["a.jpg", "b.jpg"], propertyType: "villa", basePrice: 6500, address: { street: "House 72", city: "Panaji", state: "Goa", pincode: "403001", latitude: 15.4 }, host: { firstName: "Hosty", lastName: "Secret", email: "h@x.in", phoneNumber: "98", profilePicture: "p.jpg" }, description: "long" };
  P.setCachedProperty("p1", full);
  const raw = window.localStorage.getItem("me:propertyDetailsCache:v2");
  assert.ok(!/House 72|Secret|h@x\.in|403001|latitude|description/.test(raw), raw);
  const got = P.getCachedProperty("p1");
  assert.equal(got.title, "Villa");
  assert.deepEqual(got.images, ["a.jpg"]);
  assert.equal(got.host.firstName, "Hosty");
  assert.equal(got.address.city, "Panaji");
  for (let i = 0; i < 60; i++) P.setCachedProperty(`q${i}`, full);
  assert.equal(Object.keys(JSON.parse(window.localStorage.getItem("me:propertyDetailsCache:v2"))).length, 50);
});

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall ux checks passed");
