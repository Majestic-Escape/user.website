// Quote / reply helpers for the host ↔ traveler messaging pages.
//
// The site does not import `@majestic/chat-shared`, so the two limits and the
// snippet rule are MIRRORED from `majestic-chat/packages/shared` (config.ts +
// utils/reply.ts). They must stay in lockstep: the server is the source of
// truth (it rejects >MAX_MESSAGE_LENGTH and derives the stored snippet
// itself); the copies here only shape the optimistic bubble and the composer.

export const MAX_MESSAGE_LENGTH = 4000;
export const REPLY_SNIPPET_MAX = 280;

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

// Same rule as the server: whitespace collapsed, trimmed, "[Attachment]" when
// there is no text but attachments, hard cut at REPLY_SNIPPET_MAX UTF-16 units
// without splitting a surrogate pair, no ellipsis (the UI clamps visually).
export function buildReplySnippet(text, hasAttachments) {
  const collapsed = (text ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return hasAttachments ? "[Attachment]" : "";
  if (collapsed.length <= REPLY_SNIPPET_MAX) return collapsed;
  let cut = collapsed.slice(0, REPLY_SNIPPET_MAX);
  const last = cut.charCodeAt(cut.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut = cut.slice(0, -1);
  return cut;
}

// The snapshot the optimistic bubble shows until the server echo (which carries
// the authoritative one) replaces it.
export function buildReplySnapshot(message) {
  if (!message) return null;
  return {
    messageId: message.id,
    senderId: message.senderId,
    text: buildReplySnippet(message.content?.text, (message.content?.attachments?.length ?? 0) > 0),
    type: message.type || "text",
  };
}

// A message can be quoted once the server has stored it: the explicit pending
// flag is the primary check, the id shape a belt-and-braces invariant (an
// optimistic bubble uses its clientMessageId as id, which is never 24 hex).
export function canQuote(message) {
  if (!message) return false;
  if (message.status === "sending" || message.status === "unconfirmed") return false;
  return OBJECT_ID_RE.test(String(message.id || ""));
}

export function replyAuthorLabel(senderId, userId, otherName) {
  if (senderId && userId && String(senderId) === String(userId)) return "You";
  return otherName || "Them";
}

// Payload fragment for `message:send` — only the id crosses the wire.
export function replyPayloadFor(replyTo) {
  return replyTo?.messageId ? { replyTo: { messageId: replyTo.messageId } } : {};
}
