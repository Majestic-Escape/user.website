// The newest messages of recently opened threads, so a thread paints on the
// first frame — also after the browser was closed and reopened — while the
// history request revalidates it in the background (the fresh page replaces
// what was painted; nothing is merged into the server's copy).
//
// What is stored is what the chat server returned (its history and its
// `message:new` broadcasts), which is already contact-masked, minus the
// moderation detector's raw copy of the text (`moderation.originalContent`):
// current chat servers no longer send it, older ones still do, and it must
// never land on disk. Optimistic local sends are never stored (they live in
// lib/chat/sendLifecycle.js).
//
// Isolation, as for the conversation list (conversationsCache.js): the entry
// is stamped with the user and the role (guest /messages vs host /host/inbox)
// and a read with anything else returns nothing. The session teardown
// (lib/session.ts clearSession, logout's localStorage.clear()) removes every
// entry, and a 401 from the chat server does too.
//
// Bounded: THREADS most recently opened threads × MESSAGES newest messages,
// and at most MAX_BYTES of JSON (oldest threads dropped first) so a few long
// messages can't crowd out the rest of localStorage.
const PREFIX = "me:threadCache:v1:";
const VALID_ROLES = ["guest", "host"];
const THREADS = 12;
const MESSAGES = 40;
const MAX_BYTES = 350_000;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const keyFor = (userId, role) =>
  userId && typeof userId === "string" && VALID_ROLES.includes(role) ? `${PREFIX}${role}:${userId}` : null;

/** A message the server has (not a local, still-sending or failed copy). */
const isServerMessage = (m, conversationId) =>
  !!m &&
  typeof m.id === "string" &&
  m.id !== m.clientMessageId &&
  m.status !== "sending" &&
  m.status !== "failed" &&
  String(m.conversationId) === String(conversationId);

/** The message without the unmasked text an older chat server attaches. */
const withoutRawText = (m) => {
  if (!m.moderation || typeof m.moderation !== "object" || !("originalContent" in m.moderation)) return m;
  const { originalContent: _raw, ...moderation } = m.moderation;
  return { ...m, moderation };
};

const read = (key) => {
  try {
    const entry = JSON.parse(window.localStorage.getItem(key) || "null");
    return entry && typeof entry === "object" && entry.threads && typeof entry.threads === "object" ? entry : null;
  } catch {
    return null;
  }
};

export function getCachedThread(userId, role, conversationId) {
  const key = keyFor(userId, role);
  if (!key || !conversationId || !isBrowser()) return null;
  const entry = read(key);
  if (!entry || entry.userId !== userId || entry.role !== role) return null;
  const t = entry.threads[conversationId];
  if (!t || !Array.isArray(t.messages) || Date.now() - (t.savedAt || 0) > MAX_AGE_MS) return null;
  return t.messages.length ? t.messages : null;
}

export function setCachedThread(userId, role, conversationId, messages) {
  const key = keyFor(userId, role);
  if (!key || !conversationId || !isBrowser() || !Array.isArray(messages)) return;
  try {
    const list = messages
      .filter((m) => isServerMessage(m, conversationId))
      .slice(-MESSAGES)
      .map(withoutRawText);
    // Nothing of this thread's own (yet): keep what is stored rather than
    // wiping it with a transient empty or foreign list.
    if (!list.length) return;
    const prev = read(key);
    const threads = prev && prev.userId === userId && prev.role === role ? { ...prev.threads } : {};
    delete threads[conversationId]; // re-insert as the most recent
    threads[conversationId] = { savedAt: Date.now(), messages: list };
    let ids = Object.keys(threads);
    while (ids.length > THREADS) delete threads[ids.shift()];
    let json = JSON.stringify({ userId, role, threads });
    while (json.length > MAX_BYTES && ids.length > 1) {
      delete threads[ids.shift()];
      ids = Object.keys(threads);
      json = JSON.stringify({ userId, role, threads });
    }
    if (json.length > MAX_BYTES) return; // one enormous thread: don't cache it
    window.localStorage.setItem(key, json);
  } catch {
    // quota / blocked storage: the thread still loads from the network
  }
}

/** Every thread of every account on this device (session teardown, 401). */
export function clearCachedThreads() {
  if (!isBrowser()) return;
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) window.localStorage.removeItem(k);
    }
  } catch {
    // nothing useful to do
  }
}
