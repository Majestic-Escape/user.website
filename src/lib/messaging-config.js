// Is guest↔host messaging available right now?
//
// Two independent reasons it can be unavailable, and the site hides the
// surfaces that would otherwise end in a "try again" error for either:
//
//   1. The chat service cannot be reached (paused to save money, down, being
//      deployed). Nothing messaging offers can work, so it is hidden automatically
//      — no admin action is needed or possible (the admin switch lives in the
//      widget service, which is usually paused together with the chat service).
//      Probe: the chat service's own `/health`.
//   2. An admin switched it off (admin.site → Settings → Messaging), read from
//      the widget service's `/api/chat/config`. If THAT cannot be read the answer
//      is "on": hiding messaging because a config lookup failed would be the
//      outage the switch exists to prevent, and the chat service enforces the
//      switch itself (see majestic-chat `middleware/messagingGate.ts`).
//
// WHERE the probing happens matters. A paused Railway service answers slowly (the
// edge takes 2–8 s to say "Application not found", measured from the live site's
// origin), engines disagree about how a refused connection settles, and a browser
// can't tell a slow answer from a main thread too busy to read it. So the probing
// runs on the SITE'S SERVER (`probeMessagingAvailability`, below), behind one
// same-origin endpoint (`/api/messaging-status`, CDN-cached) that browsers read with
// a single fast request. A browser never concludes "off" from its own failure to
// reach anything: if the endpoint cannot be read it reports "unknown" (treated as
// on). The server's route layouts call the probe directly.
//
// DEFINITE failure ≠ TIMEOUT, on the server too: a refused connection, an error
// status (Railway's 404) or a body that is not the chat service's all mean "down";
// a probe that simply has not answered in time means "can't tell" and never hides
// messaging.
//
// This is advisory: a forged answer unhides a button and the chat service still
// says no. Isomorphic on purpose; no React imports.

const DEV_WIDGET_PORT = process.env.NEXT_PUBLIC_CHAT_WIDGET_PORT ?? "3003";
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

/** `/api/chat/config` of the widget service, derived from the widget bundle URL. */
export function chatConfigUrl() {
  const bundle = process.env.NEXT_PUBLIC_CHAT_WIDGET_URL;
  if (bundle) {
    try {
      return new URL("/api/chat/config", bundle).toString();
    } catch {
      /* fall through to the dev default */
    }
  }
  return `http://localhost:${DEV_WIDGET_PORT}/api/chat/config`;
}

/** The chat service's unauthenticated health route (not behind the admin switch). */
export function chatHealthUrl() {
  return `${CHAT_URL.replace(/\/+$/, "")}/health`;
}

// Server-side bounds. Generous on purpose: the visitor never waits for them (the
// endpoint is CDN-cached with stale-while-revalidate) and Railway's edge can take
// several seconds to answer for a paused app.
const HEALTH_TIMEOUT_MS = 5000;
const CONFIG_TIMEOUT_MS = 3000;
// The browser's single same-origin request: normally milliseconds; the bound only
// matters when the endpoint's CDN cache is cold and the probe behind it is slow.
const BROWSER_TIMEOUT_MS = 8000;
const STATUS_PATH = "/api/messaging-status";

/**
 * GET `url` and parse JSON. Resolves to one of
 *   { state: "ok", data }  an answer arrived and parsed
 *   { state: "failed" }    a DEFINITE failure: network error, non-2xx, bad JSON
 *   { state: "timeout" }   nothing definite within `timeoutMs` — unknown, not "down"
 *
 * Two independent ways to give up: stop waiting AND abort the request (the abort
 * is issued after the wait is released, so its rejection can never be mistaken for
 * a definite failure).
 */
async function getJson(url, timeoutMs, revalidate) {
  const controller = new AbortController();
  let timer;
  const gaveUp = new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve({ state: "timeout" });
      controller.abort();
    }, timeoutMs);
  });
  const lookup = (async () => {
    try {
      const init = { signal: controller.signal };
      if (typeof revalidate === "number") init.next = { revalidate };
      else init.cache = "no-store";
      const res = await fetch(url, init);
      if (!res.ok) return { state: "failed" };
      return { state: "ok", data: await res.json() };
    } catch {
      return { state: "failed" };
    }
  })();
  try {
    return await Promise.race([lookup, gaveUp]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * SERVER ONLY. Probe the chat service and the admin switch. Always `true`/`false`:
 *   false → the chat service is DEFINITELY unreachable, OR an admin switched messaging off
 *   true  → everything else (it answers; or we could not tell; or the switch could not be read)
 *
 * `revalidate` (seconds) lets Next cache both answers across requests (used by the
 * route layouts); the status endpoint instead relies on HTTP caching.
 */
export async function probeMessagingAvailability({ revalidate } = {}) {
  const [health, config] = await Promise.all([
    getJson(chatHealthUrl(), HEALTH_TIMEOUT_MS, revalidate),
    getJson(chatConfigUrl(), CONFIG_TIMEOUT_MS, revalidate),
  ]);
  if (health.state === "failed") return false; // nothing to talk to
  if (health.state === "ok" && health.data?.status !== "ok") return false; // something answered, but not the chat service
  if (config.state === "ok" && config.data?.messagingEnabled === false) return false; // an admin switched it off
  return true; // reachable, or can't tell; an unreadable switch means "on"
}

/**
 * Is messaging available?
 *   server: the probe above → `true` / `false`
 *   browser: ONE same-origin request to `/api/messaging-status` → `true` / `false`,
 *            or `null` (unknown, treated as on) if that endpoint cannot be read
 */
export async function fetchMessagingEnabled({ revalidate } = {}) {
  if (typeof window === "undefined") return probeMessagingAvailability({ revalidate });
  const res = await getJson(STATUS_PATH, BROWSER_TIMEOUT_MS);
  return res.state === "ok" && typeof res.data?.enabled === "boolean" ? res.data.enabled : null;
}
