// Single place that knows how to tear down an authenticated session and how
// long a token verification stays "fresh" on the client.
//
// This is deliberately a leaf module (no imports from contexts, hooks or
// components) so AuthContext, ProtectedRoute and useCheckToken can all depend
// on it without creating import cycles.
//
// Security note: none of this is the security boundary. The API validates the
// token on every request. What lives here is (a) how quickly the *client*
// notices a dead session and (b) making sure nothing user-scoped survives a
// logout / expiry so the next account on the same browser never sees it.

import type { QueryClient } from "@tanstack/react-query";
import { removeByPrefix } from "./storage";
import { clearReturnState } from "./auth-return";

// Keys that hold auth or per-user state. Everything else in storage
// (wishlist, search filters, modal flags…) is device-local UX state that must
// survive an automatic token expiry — losing your dates because your session
// timed out mid-search is a bad experience.
const AUTH_LOCAL_STORAGE_KEYS = ["token", "userId", "user", "userInfo"];
const AUTH_SESSION_STORAGE_KEYS = ["messages_last_init", "hostinbox_last_init"];
// Per-user conversation snapshots (lib/conversationsCache.js), keyed by role.
// They are userId-stamped, but nothing user-scoped should survive a teardown.
const AUTH_SESSION_STORAGE_PREFIXES = ["me:conversationsCache:"];

// Fired on `window` after a session is torn down so in-memory state
// (AuthContext's `user`) can reset without importing the context here.
export const SESSION_CLEARED_EVENT = "me:session-cleared";

// A successful /auth/check-token or /auth/verify is trusted for this long
// before the client re-checks. Keyed by the exact token, so a new login never
// inherits the previous token's window.
export const TOKEN_VERIFY_TTL_MS = 5 * 60 * 1000;

let verifiedToken: string | null = null;
let verifiedAt = 0;
const inFlight = new Map<string, Promise<unknown>>();

export function isRecentlyVerified(token: string | null | undefined): boolean {
  if (!token || token !== verifiedToken) return false;
  return Date.now() - verifiedAt < TOKEN_VERIFY_TTL_MS;
}

export function markVerified(token: string) {
  verifiedToken = token;
  verifiedAt = Date.now();
}

export function resetVerification() {
  verifiedToken = null;
  verifiedAt = 0;
  inFlight.clear();
}

// De-duplicates concurrent verification requests (focus + visibilitychange
// often fire together). `key` separates callers that expect different result
// shapes (e.g. "check-token" vs "verify"); the caller supplies the network call.
export function runVerificationOnce<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;
  const p = fn().finally(() => {
    if (inFlight.get(key) === p) inFlight.delete(key);
  });
  inFlight.set(key, p);
  return p;
}

// Reads the raw token from localStorage. It is stored JSON-encoded
// (`JSON.stringify(token)`) by the login flow, but be tolerant of a bare
// string too — ProtectedRoute already had to cope with both shapes.
export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return null;
    if (raw.startsWith('"')) {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" && parsed ? parsed : null;
    }
    return raw;
  } catch {
    return null;
  }
}

// Authorization header for the signed-in user's own API calls (profile,
// KYC, uploads). Empty when logged out, so a request still goes out and the
// backend answers 401 instead of the client crashing.
export function authHeaders(): Record<string, string> {
  const token = readStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearSession(queryClient?: QueryClient | null) {
  if (typeof window === "undefined") return;
  try {
    for (const key of AUTH_LOCAL_STORAGE_KEYS) localStorage.removeItem(key);
    for (const key of AUTH_SESSION_STORAGE_KEYS) sessionStorage.removeItem(key);
    for (const prefix of AUTH_SESSION_STORAGE_PREFIXES)
      removeByPrefix(sessionStorage, prefix);
  } catch {
    // Storage can throw in private mode / when blocked; nothing else to do.
  }
  queryClient?.clear();
  resetVerification();
  clearReturnState();
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}
