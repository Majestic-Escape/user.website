// Session-scoped cache of the signed-in guest's conversation list.
//
// /messages is a client component, so every navigation to it remounts and
// refetches from scratch. Before this, `conversations` started as `[]` with
// `loading = true`, which blanked the entire page to a spinner on every single
// tab switch — even though the list is almost always identical to the one the
// user was looking at seconds earlier.
//
// Seeding state from here lets the list paint on the first frame and revalidate
// in the background (stale-while-revalidate). Mirrors the shape and storage
// choices of `propertyDetailsCache.js` so the two behave predictably together —
// between them, a revisit renders the full list with zero network wait.
//
// SECURITY — read this before changing the key:
//   Entries are stamped with the userId they belong to and a read with a
//   different (or missing) userId returns null rather than the previous user's
//   data. Without that, logging out and back in as someone else on the same tab
//   would paint the previous account's threads, host names and message
//   previews. `clearCachedConversations()` is the belt-and-braces companion for
//   logout. sessionStorage (not localStorage) keeps this tab-scoped and wipes it
//   when the tab closes.

const STORAGE_KEY = "me:conversationsCache:v1";
const MAX_CONVERSATIONS = 60;
// Sanity bound only. sessionStorage already dies with the tab and we always
// revalidate on mount, so this exists purely so a tab left open overnight
// doesn't flash a very stale list before the fresh one lands.
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

/**
 * Decode the userId from the stored JWT without waiting for React state.
 *
 * Messaging.jsx sets `userId` in an effect, which runs *after* the first paint —
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

export const getCachedConversations = (userId) => {
  if (!userId || !isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== "object") return null;
    // Different account on this tab — never serve their threads.
    if (entry.userId !== userId) return null;
    if (!Array.isArray(entry.conversations)) return null;
    if (!entry.savedAt || Date.now() - entry.savedAt > MAX_AGE_MS) return null;
    return entry.conversations;
  } catch {
    return null;
  }
};

export const setCachedConversations = (userId, conversations) => {
  if (!userId || !isBrowser() || !Array.isArray(conversations)) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userId,
        savedAt: Date.now(),
        conversations: conversations.slice(0, MAX_CONVERSATIONS),
      })
    );
  } catch {
    // quota or serialization error — silently degrade to the network path
  }
};

export const clearCachedConversations = () => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing useful to do
  }
};
