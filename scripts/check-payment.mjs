// Checks lib/payment-verify.js without a test runner: which verify failures
// are retried, how many attempts are made, and that every path ends in a
// definite outcome (never silence) once Razorpay has taken the money.
//
// Usage: node scripts/check-payment.mjs   (npm run check:payment)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const projectRequire = createRequire(join(root, "package.json"));
const ts = projectRequire("typescript");

function load(file) {
  const src = readFileSync(file, "utf8");
  const out = ts.transpileModule(src, { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, allowJs: true } }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", out)(module, module.exports, projectRequire);
  return module.exports;
}

const { verifyFailureKind, verifyWithRetry, VERIFY_RETRY_DELAYS_MS } = load(join(root, "src", "lib", "payment-verify.js"));

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}

// attempt() scripted from a list of answers; "net" = the request never got an answer
function scripted(answers) {
  let calls = 0;
  const attempt = async () => {
    const a = answers[Math.min(calls++, answers.length - 1)];
    if (a === "net") throw new TypeError("Failed to fetch");
    return a;
  };
  return { attempt, calls: () => calls };
}
const ok = { ok: true, status: 200, body: { success: true, data: { _id: "p1" }, booking: { status: "confirmed" } } };
const err = (status, code) => ({ ok: false, status, body: code ? { success: false, code } : null });
const noSleep = { sleep: async () => {} };

console.log("payment-verify");

await check("classification: network/408/429/5xx retry, 401/403 session, other 4xx rejected", () => {
  for (const s of [0, 408, 429, 500, 502, 503, 504]) assert.equal(verifyFailureKind({ status: s }), "retry", `status ${s}`);
  for (const s of [401, 403]) assert.equal(verifyFailureKind({ status: s }), "session", `status ${s}`);
  for (const s of [400, 404, 409, 422]) assert.equal(verifyFailureKind({ status: s }), "rejected", `status ${s}`);
});

await check("first answer OK: one call, result passed through", async () => {
  const s = scripted([ok]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 1);
  assert.deepEqual(r, { ok: true, result: ok.body });
});

await check("transient then OK: retried until it succeeds", async () => {
  const s = scripted([err(500), "net", ok]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 3);
  assert.equal(r.ok, true);
});

await check("always 5xx: 3 attempts, then a definite 'retry' outcome", async () => {
  const s = scripted([err(503)]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), VERIFY_RETRY_DELAYS_MS.length + 1);
  assert.deepEqual(r, { ok: false, kind: "retry", status: 503, code: null });
});

await check("network always down: 3 attempts, kind retry, code NETWORK", async () => {
  const s = scripted(["net"]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 3);
  assert.deepEqual(r, { ok: false, kind: "retry", status: 0, code: "NETWORK" });
});

await check("definitive rejection (INVALID_SIGNATURE 400): no retry", async () => {
  const s = scripted([err(400, "INVALID_SIGNATURE")]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 1);
  assert.deepEqual(r, { ok: false, kind: "rejected", status: 400, code: "INVALID_SIGNATURE" });
});

await check("session ended (401): no retry with the same token", async () => {
  const s = scripted([err(401)]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 1);
  assert.equal(r.kind, "session");
});

await check("transient then rejected: stops at the rejection", async () => {
  const s = scripted([err(502), err(409, "PAYMENT_STATE")]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(s.calls(), 2);
  assert.deepEqual(r, { ok: false, kind: "rejected", status: 409, code: "PAYMENT_STATE" });
});

await check("200 with success:false is not treated as confirmed", async () => {
  const s = scripted([{ ok: true, status: 200, body: { success: false } }]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(r.ok, false);
});

await check("200 with an unreadable body is not treated as confirmed (retried)", async () => {
  const s = scripted([{ ok: true, status: 200, body: null }, ok]);
  const r = await verifyWithRetry(s.attempt, noSleep);
  assert.equal(r.ok, true);
  assert.equal(s.calls(), 2);
});

await check("waits between attempts follow VERIFY_RETRY_DELAYS_MS (~5.5 s total)", async () => {
  const waits = [];
  const s = scripted([err(500)]);
  await verifyWithRetry(s.attempt, { sleep: async (ms) => waits.push(ms) });
  assert.deepEqual(waits, VERIFY_RETRY_DELAYS_MS);
  assert.ok(waits.reduce((a, b) => a + b, 0) <= 6000);
});

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall payment checks passed");
