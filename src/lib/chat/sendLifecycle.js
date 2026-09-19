// Send lifecycle for the messaging pages: outcome classification + the
// tab-scoped record of sends whose outcome is not yet known.
//
// A logical send is identified by its `clientMessageId` for its whole life.
// The chat server is idempotent on (conversationId, clientMessageId) — a retry
// with the SAME id can never create a second message — so a send whose fate is
// unknown (no ack, timeout, server error) is kept and retried under the same
// id, never re-minted. Only the server proving "nothing was stored" (a
// deterministic rejection code on the FIRST attempt) ends a logical send.
//
// sessionStorage mirrors the unresolved sends so a reload mid-send restores
// the "Couldn't confirm delivery · Retry" bubble instead of losing the text.
// Same storage/isolation choices as conversationsCache.js: keyed by userId +
// conversationId, tab-scoped, bounded, TTL'd, every access wrapped.

export const SEND_TIMEOUT_MS = 15000;

// Codes the chat server only returns BEFORE anything is stored. Anything else
// (INTERNAL_ERROR, DATABASE_ERROR, a missing code from an older server, a
// timeout, a disconnect) says nothing about persistence and is ambiguous.
export const DEFINITIVE_REJECTION_CODES = new Set([
  "VALIDATION_ERROR",
  "MESSAGE_NOT_FOUND",
  "CONVERSATION_NOT_FOUND",
  "USER_NOT_PARTICIPANT",
  "MODERATION_BLOCKED",
  // the sender's moderation section was busy / shared moderation state was
  // unreachable: nothing stored, the text stays in the composer
  "MODERATION_BUSY",
  "MODERATION_UNAVAILABLE",
  "RATE_LIMITED",
  "FORBIDDEN",
  "UNAUTHORIZED",
]);

/**
 * Classify an ack.
 *   err      — socket.io timeout / disconnect error (no ack arrived)
 *   res      — the ack payload { success, messageId?, code?, error? }
 *   attempt  — 1 for the first emit of this clientMessageId, 2+ for retries
 *
 * Returns "success" | "rejected" | "ambiguous". The definitive list applies to
 * the first attempt only: a retry of an unconfirmed send may be rate-limited
 * (the limiter runs before the server's idempotency lookup) or hit an auth
 * error, and neither proves the first attempt was not persisted.
 */
export function classifyAck(err, res, attempt = 1) {
  if (err) return "ambiguous";
  if (res && res.success === true) return "success";
  if (attempt > 1) return "ambiguous";
  if (res && DEFINITIVE_REJECTION_CODES.has(res.code)) return "rejected";
  return "ambiguous";
}

export function newClientMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ── unresolved-send records (sessionStorage) ────────────────────────────────

const STORAGE_PREFIX = "me:pendingSends:v1:";
const MAX_RECORDS = 20;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const keyFor = (userId, conversationId) =>
  userId && conversationId ? `${STORAGE_PREFIX}${userId}:${conversationId}` : null;

export function readPendingSends(userId, conversationId) {
  if (!isBrowser()) return [];
  const key = keyFor(userId, conversationId);
  if (!key) return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const now = Date.now();
    const fresh = list.filter(
      (r) => r && typeof r.clientMessageId === "string" && r.payload && now - (r.createdAt || 0) < MAX_AGE_MS
    );
    if (fresh.length !== list.length) writePendingSends(userId, conversationId, fresh);
    return fresh;
  } catch {
    return [];
  }
}

export function writePendingSends(userId, conversationId, list) {
  if (!isBrowser()) return;
  const key = keyFor(userId, conversationId);
  if (!key) return;
  try {
    if (!list.length) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(list.slice(-MAX_RECORDS)));
  } catch {
    /* quota / private mode — the in-memory map still covers this tab */
  }
}

export function addPendingSend(userId, conversationId, record) {
  const list = readPendingSends(userId, conversationId).filter((r) => r.clientMessageId !== record.clientMessageId);
  list.push({ ...record, createdAt: record.createdAt || Date.now() });
  writePendingSends(userId, conversationId, list);
}

export function removePendingSend(userId, conversationId, clientMessageId) {
  const list = readPendingSends(userId, conversationId);
  const next = list.filter((r) => r.clientMessageId !== clientMessageId);
  if (next.length !== list.length) writePendingSends(userId, conversationId, next);
}

// The optimistic bubble for a send (or a restored unresolved one).
export function optimisticMessage({ clientMessageId, conversationId, senderId, text, replyTo, createdAt, status }) {
  return {
    id: clientMessageId,
    clientMessageId,
    conversationId,
    senderId,
    content: { text },
    type: "text",
    createdAt: createdAt || new Date().toISOString(),
    status: status || "sending",
    readBy: [],
    ...(replyTo ? { replyTo } : {}),
  };
}
