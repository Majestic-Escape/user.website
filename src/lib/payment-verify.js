// After Razorpay reports a successful payment the site asks the server to
// verify it (POST /payment/verify-payment). That call can fail even though the
// money was taken: a dropped connection, a server hiccup, an expired session.
// Retrying is safe — the server's transition is idempotent
// (services/payments.js applyPaymentSuccess) and Razorpay's webhook records
// the same payment independently — so the transient failures are retried a
// couple of times and every failure ends in a clear outcome for the guest
// instead of silence.

// Waits between attempts: 3 attempts over ~5.5 s, short enough for a guest
// watching a "Confirming your payment…" button.
export const VERIFY_RETRY_DELAYS_MS = [1500, 4000];

// "retry"    — worth asking again (network error, 408, 429, 5xx)
// "session"  — the guest's sign-in is no longer accepted (401 / 403)
// "rejected" — the server answered definitively that it can't confirm this
//              payment (bad signature, unknown order, mismatch, wrong state)
export function verifyFailureKind({ status }) {
  if (!status || status === 408 || status === 429 || status >= 500) return "retry";
  if (status === 401 || status === 403) return "session";
  return "rejected";
}

// attempt(): resolves { ok, status, body }, or throws on a network failure.
// Resolves { ok: true, result } or { ok: false, kind, status, code }.
export async function verifyWithRetry(attempt, { delays = VERIFY_RETRY_DELAYS_MS, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let last = { status: 0, code: null };
  for (let i = 0; i <= delays.length; i++) {
    if (i > 0) await sleep(delays[i - 1]);
    try {
      const res = await attempt();
      if (res.ok && res.body && res.body.success !== false) return { ok: true, result: res.body };
      // A 2xx whose body can't be read (proxy page, cut-off response) says
      // nothing either way: treat it like no answer, and ask again.
      last = res.ok && !res.body ? { status: 0, code: "BAD_RESPONSE" } : { status: res.status || 0, code: res.body?.code || null };
    } catch {
      last = { status: 0, code: "NETWORK" };
    }
    if (verifyFailureKind(last) !== "retry") break;
  }
  return { ok: false, kind: verifyFailureKind(last), status: last.status, code: last.code };
}
