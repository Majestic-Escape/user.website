// Session-scoped cache of a signed-in user's conversation list.
//
// Both /messages (guest) and /host/inbox (host) are client components, so every
// navigation to them remounts and refetches from scratch. Before this, each
// started as `[]` with a loading flag, which meant a spinner on every single tab
// switch even though the list is almost always identical to the one the user was
// looking at seconds earlier.
//
// Seeding state from here lets the list paint on the first frame and revalidate
// in the background (stale-while-revalidate). Mirrors the shape and storage
// choices of `propertyDetailsCache.js` so the two behave predictably together —
// between them, a revisit renders the full list with zero network wait.
//
// SECURITY — two separate isolation axes, both load-bearing:
//
//   1. userId. Entries are stamped with the user they belong to; a read with a
//      different (or missing) userId returns null rather than the previous
//      user's data. Without it, logging out and back in as someone else on the
//      same tab would paint the previous account's threads and message
//      previews.
//
//   2. role. `/api/chat/conversations?role=guest` and `?role=host` return
//      DIFFERENT lists for the SAME userId — a person who both books and hosts
//      sees their guest threads on /messages and their guest-inquiry threads on
//      /host/inbox. A single shared key would let one surface paint the other's
//      conversations, which is a data-exposure bug even though it is the same
//      person: the host inbox would leak threads where they are the guest, and
//      vice versa. Role is therefore part of the storage key, not just a field,
//      and an unrecognised role is refused outright.
//
// sessionStorage (not localStorage) keeps this tab-scoped and wipes it when the
// tab closes.

const STORAGE_PREFIX = "me:conversationsCache:v2:";
// v1 was a single un-roled key. Anything written by it is unreadable here (the
// key no longer matches), so old entries simply age out with the tab — but we
// drop it on first use so a stale guest list can't linger in storage.
const LEGACY_KEY = "me:conversationsCache:v1";

const VALID_ROLES = ["guest", "host"];
const MAX_CONVERSATIONS = 60;
// Sanity bound only. sessionStorage already dies with the tab and we always
// revalidate on mount, so this exists purely so a tab left open overnight
// doesn't flash a very stale list before the fresh one lands.
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

// Refuse anything that isn't a role we know about, so a caller can never build
// an arbitrary storage key (or silently share one between surfaces).
const keyFor = (role) =>
  VALID_ROLES.includes(role) ? `${STORAGE_PREFIX}${role}` : null;

const dropLegacy = () => {
  try {
    window.sessionStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing useful to do */
  }
};

/**
 * Decode the userId from the stored JWT without waiting for React state.
 *
 * Both pages set `userId` in an effect, which runs *after* the first paint —
 * too late to seed initial state. This mirrors that same decode so the very
 * first render can already be scoped to the right account. Returns null for any
 * malformed or missing token; callers then simply get no cache.
 */
export const readUserIdFromStoredToken = () => {
  if (typeof window === "undefined") return null;
  try {
    let stored = window.localStorage.getItem("token");
    if (!stored) return null;
    try {
      stored = JSON.parse(stored);
    } catch {
      // not JSON-encoded — use the raw string
    }
    if (typeof stored !== "string") return null;
    const payload = JSON.parse(atob(stored.split(".")[1]));
    return payload?.userId ?? null;
  } catch {
    return null;
  }
};

export const getCachedConversations = (userId, role) => {
  const key = keyFor(role);
  if (!userId || !key || !isBrowser()) return null;
  try {
    dropLegacy();
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== "object") return null;
    // Belt and braces: the role is in the key, but re-check the stamped value
    // so a hand-edited or migrated entry can't be served to the wrong surface.
    if (entry.userId !== userId || entry.role !== role) return null;
    if (!Array.isArray(entry.conversations)) return null;
    if (!entry.savedAt || Date.now() - entry.savedAt > MAX_AGE_MS) return null;
    return entry.conversations;
  } catch {
    return null;
  }
};

export const setCachedConversations = (userId, role, conversations) => {
  const key = keyFor(role);
  if (!userId || !key || !isBrowser() || !Array.isArray(conversations)) return;
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        userId,
        role,
        savedAt: Date.now(),
        conversations: conversations.slice(0, MAX_CONVERSATIONS),
      })
    );
  } catch {
    // quota or serialization error — silently degrade to the network path
  }
};

/** Clear one role's cache, or every role when called with no argument (logout). */
export const clearCachedConversations = (role) => {
  if (!isBrowser()) return;
  try {
    const roles = role ? [role] : VALID_ROLES;
    roles.forEach((r) => {
      const key = keyFor(r);
      if (key) window.sessionStorage.removeItem(key);
    });
    dropLegacy();
  } catch {
    // nothing useful to do
  }
};
