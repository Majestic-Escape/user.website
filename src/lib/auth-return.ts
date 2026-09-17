// Resume-after-login.
//
// Anywhere the app sends a visitor to /login remembers where they were going
// (and, when the trigger was an action rather than a page, what they were
// doing), so that signing in continues the flow instead of landing on the
// home page. The destination travels in `?returnUrl=` and is mirrored in
// sessionStorage (per tab, survives the full page load /login can be, no
// network, no server state). The login and register forms consume it.
//
// Only same-origin paths are ever followed: an attacker cannot use
// /login?returnUrl=https://evil.example to bounce a signed-in user off-site.
import type { useRouter } from "next/navigation";

const RETURN_KEY = "me:returnTo";
const ACTION_KEY = "me:pendingAction";
const MAX_LENGTH = 2000;
// Never "return" to an auth page: that would loop.
const AUTH_PAGES = ["/login", "/login-options", "/register", "/host/login", "/host/register"];

type Router = ReturnType<typeof useRouter>;

export type PendingAction = { name: string; path: string; payload?: unknown; at: number };

// A same-origin, non-auth path ("/stay/abc?x=1") or null. Accepts raw or
// URL-encoded input; rejects absolute URLs, protocol-relative URLs
// ("//evil"), backslash tricks and anything with a scheme.
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim();
  try {
    if (/%[0-9a-fA-F]{2}/.test(value)) value = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (value.length > MAX_LENGTH) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f]/.test(value) || /^\/[^/?#]*:/.test(value)) return null;
  const pathOnly = value.split(/[?#]/)[0];
  if (AUTH_PAGES.some((p) => pathOnly === p || pathOnly.startsWith(p + "/"))) return null;
  return value;
}

// The path (+ query) of the current page, for "come back here" cases.
export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}

function store(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Private mode / blocked storage: the ?returnUrl query still carries it.
  }
}
function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

// Remembers `returnTo` (default: the current page) and returns the /login
// href that carries it. Optionally records an action to replay on return.
export function loginHref(returnTo?: string, action?: { name: string; payload?: unknown }): string {
  const target = safeReturnPath(returnTo ?? currentPath());
  if (!target) {
    store(RETURN_KEY, null);
    store(ACTION_KEY, null);
    return "/login";
  }
  store(RETURN_KEY, target);
  if (action) {
    const pending: PendingAction = { name: action.name, path: target.split(/[?#]/)[0], payload: action.payload, at: Date.now() };
    store(ACTION_KEY, JSON.stringify(pending));
  } else {
    store(ACTION_KEY, null);
  }
  return `/login?returnUrl=${encodeURIComponent(target)}`;
}

// Navigates to /login, remembering where to come back to.
export function goToLogin(router: Router, returnTo?: string, action?: { name: string; payload?: unknown }) {
  router.push(loginHref(returnTo, action));
}

// The page a plain full-page link to /login came from (e.g. the chat
// widget's "Sign in"), when it is one of ours; null otherwise.
function referrerPath(): string | null {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

// Where to go after a successful sign-in: the ?returnUrl on the login page,
// else the remembered destination, else the same-origin page that linked
// here, else `fallback`. Clears the remembered destination (the pending
// action stays until its page consumes it).
export function takeReturnPath(fallback = "/"): string {
  let fromQuery: string | null = null;
  if (typeof window !== "undefined") {
    fromQuery = new URLSearchParams(window.location.search).get("returnUrl");
  }
  const target =
    safeReturnPath(fromQuery) ?? safeReturnPath(read(RETURN_KEY)) ?? safeReturnPath(referrerPath()) ?? fallback;
  store(RETURN_KEY, null);
  // A pending action only makes sense on the page it was started from; if
  // the sign-in ends up elsewhere (header link from another page), drop it.
  const raw = read(ACTION_KEY);
  if (raw) {
    try {
      const pending = JSON.parse(raw) as PendingAction;
      if (pending.path !== target.split(/[?#]/)[0]) store(ACTION_KEY, null);
    } catch {
      store(ACTION_KEY, null);
    }
  }
  return target;
}

// The pending action for this page, if any — removed on read so it replays
// exactly once. Actions older than 30 minutes are dropped.
export function takePendingAction(name: string, pathname: string): PendingAction | null {
  const raw = read(ACTION_KEY);
  if (!raw) return null;
  let pending: PendingAction | null = null;
  try {
    pending = JSON.parse(raw);
  } catch {
    pending = null;
  }
  if (!pending || pending.name !== name || pending.path !== pathname) return null;
  store(ACTION_KEY, null);
  if (Date.now() - pending.at > 30 * 60 * 1000) return null;
  return pending;
}

// The checkout URL a Reserve click would open (same query the checkout page
// reads), or the listing page when no dates are chosen yet.
export function checkoutPathFor(propertyId: string | undefined, query: Record<string, unknown> | null | undefined): string {
  if (!propertyId) return currentPath();
  if (!query || !query.checkin || !query.checkout) return `/stay/${propertyId}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return `/book/stay/${propertyId}?${params.toString()}`;
}

// Logging out must never carry a pending destination into the next session.
export function clearReturnState() {
  store(RETURN_KEY, null);
  store(ACTION_KEY, null);
}
