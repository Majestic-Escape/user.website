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
// localStorage, so the list is on screen the moment /messages or the inbox
// opens — also after the browser was closed and reopened (a restored tab), not
// only on a revisit within the tab. It is always revalidated on mount. The
// session teardown (lib/session.ts clearSession, logout's localStorage.clear())
// removes it, and a 401 from the chat server clears it before anything else
// renders (the account's session is gone). Entries older than MAX_AGE_MS are
// ignored and a previewed message is trimmed to what a row can show.

const STORAGE_PREFIX = "me:conversationsCache:v2:";
// v1 was a single un-roled key. Anything written by it is unreadable here (the
// key no longer matches), so old entries simply age out with the tab — but we
// drop it on first use so a stale guest list can't linger in storage.
const LEGACY_KEY = "me:conversationsCache:v1";

const VALID_ROLES = ["guest", "host"];
const MAX_CONVERSATIONS = 60;
// We always revalidate on mount; this only stops a list from weeks ago being
// painted before the fresh one lands.
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
// A row shows one line of the last message; the full text is in the thread.
const PREVIEW_CHARS = 280;

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const store = () => window.localStorage;

const trimPreview = (conv) => {
  const text = conv?.lastMessage?.content;
  if (typeof text !== "string" || text.length <= PREVIEW_CHARS) return conv;
  return { ...conv, lastMessage: { ...conv.lastMessage, content: text.slice(0, PREVIEW_CHARS) } };
};

// Refuse anything that isn't a role we know about, so a caller can never build
// an arbitrary storage key (or silently share one between surfaces).
const keyFor = (role) =>
  VALID_ROLES.includes(role) ? `${STORAGE_PREFIX}${role}` : null;

const dropLegacy = () => {
  try {
    window.sessionStorage.removeItem(LEGACY_KEY);
    // the tab-scoped copies this cache used to keep
    VALID_ROLES.forEach((r) => window.sessionStorage.removeItem(`${STORAGE_PREFIX}${r}`));
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
    const raw = store().getItem(key);
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
    store().setItem(
      key,
      JSON.stringify({
        userId,
        role,
        savedAt: Date.now(),
        conversations: conversations.slice(0, MAX_CONVERSATIONS).map(trimPreview),
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
      if (key) store().removeItem(key);
    });
    dropLegacy();
  } catch {
    // nothing useful to do
  }
};
