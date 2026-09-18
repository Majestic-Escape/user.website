"use client";

import { useCallback, useRef } from "react";
import {
  SEND_TIMEOUT_MS,
  classifyAck,
  newClientMessageId,
  optimisticMessage,
  addPendingSend,
  removePendingSend,
  readPendingSends,
} from "@/lib/chat/sendLifecycle";
import { replyPayloadFor } from "@/lib/chat/reply";

/**
 * Owns the life of a logical send on a messaging page.
 *
 *   send({ text, replyTo })  → optimistic bubble (status "sending"), emit with
 *                              an ack timeout
 *   ack success              → bubble gets the server id + status "sent"; the
 *                              echo (message:new) replaces it by id
 *   definitive rejection     → bubble removed, onRejected({ text, replyTo,
 *                              code, error }) so the page can restore the draft
 *   anything ambiguous       → bubble stays as "unconfirmed" with Retry /
 *                              Discard; retry re-emits the SAME clientMessageId
 *
 * The page keeps calling `notifyServerMessage(message)` for every message it
 * receives (echo or history) so a send resolves the moment the server's copy
 * shows up, and `reconcileHistory(list)` once history has loaded so unresolved
 * sends from before a reload come back as unconfirmed bubbles.
 *
 * `messages`/`setMessages` are the page's own state; `getSocket` returns the
 * live socket (or null while disconnected — then the send is simply unconfirmed
 * until the user retries).
 */
export function useSendLifecycle({ userId, conversationId, getSocket, messages, setMessages, onRejected }) {
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const pendingRef = useRef(new Map()); // clientMessageId → { payload, text, replyTo, conversationId, attempt }
  const onRejectedRef = useRef(onRejected);
  onRejectedRef.current = onRejected;
  const getSocketRef = useRef(getSocket);
  getSocketRef.current = getSocket;

  const resolvePending = useCallback(
    (clientMessageId) => {
      const entry = pendingRef.current.get(clientMessageId);
      pendingRef.current.delete(clientMessageId);
      removePendingSend(userId, entry?.conversationId || conversationId, clientMessageId);
    },
    [userId, conversationId]
  );

  const markStatus = useCallback(
    (clientMessageId, patch) => {
      setMessages((prev) =>
        prev.map((m) => (m.clientMessageId === clientMessageId || m.id === clientMessageId ? { ...m, ...patch } : m))
      );
    },
    [setMessages]
  );

  const handleAck = useCallback(
    (clientMessageId, err, res, attempt) => {
      const entry = pendingRef.current.get(clientMessageId);
      if (!entry) return; // already resolved by an echo / history / discard
      const outcome = classifyAck(err, res, attempt);
      if (outcome === "success") {
        markStatus(clientMessageId, { id: res.messageId || clientMessageId, status: "sent" });
        resolvePending(clientMessageId);
        return;
      }
      if (outcome === "rejected") {
        setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId && m.id !== clientMessageId));
        resolvePending(clientMessageId);
        onRejectedRef.current?.({ text: entry.text, replyTo: entry.replyTo, code: res?.code, error: res?.error });
        return;
      }
      // ambiguous — unless the server's copy already arrived meanwhile
      const known = messagesRef.current.find((m) => m.clientMessageId === clientMessageId);
      if (known && known.status !== "sending" && known.status !== "unconfirmed") {
        resolvePending(clientMessageId);
        return;
      }
      markStatus(clientMessageId, { status: "unconfirmed" });
    },
    [markStatus, resolvePending, setMessages]
  );

  const emit = useCallback(
    (clientMessageId) => {
      const entry = pendingRef.current.get(clientMessageId);
      if (!entry) return;
      entry.attempt += 1;
      const attempt = entry.attempt;
      const socket = getSocketRef.current?.();
      if (!socket) {
        markStatus(clientMessageId, { status: "unconfirmed" });
        return;
      }
      socket.timeout(SEND_TIMEOUT_MS).emit("message:send", entry.payload, (err, res) => {
        handleAck(clientMessageId, err, res, attempt);
      });
    },
    [handleAck, markStatus]
  );

  const send = useCallback(
    ({ text, replyTo }) => {
      if (!conversationId || !userId) return null;
      const clientMessageId = newClientMessageId();
      const payload = {
        conversationId,
        content: { text },
        type: "text",
        clientMessageId,
        ...replyPayloadFor(replyTo),
      };
      const entry = { payload, text, replyTo: replyTo || null, conversationId, attempt: 0 };
      pendingRef.current.set(clientMessageId, entry);
      addPendingSend(userId, conversationId, { clientMessageId, payload, text, replyTo: replyTo || null });
      setMessages((prev) => [
        ...prev,
        optimisticMessage({ clientMessageId, conversationId, senderId: userId, text, replyTo: replyTo || null }),
      ]);
      emit(clientMessageId);
      return clientMessageId;
    },
    [conversationId, userId, setMessages, emit]
  );

  const retry = useCallback(
    (clientMessageId) => {
      if (!pendingRef.current.has(clientMessageId)) return;
      markStatus(clientMessageId, { status: "sending" });
      emit(clientMessageId);
    },
    [emit, markStatus]
  );

  const discard = useCallback(
    (clientMessageId) => {
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId && m.id !== clientMessageId));
      resolvePending(clientMessageId);
    },
    [setMessages, resolvePending]
  );

  // A server copy (echo or history) for a pending clientMessageId settles it.
  const notifyServerMessage = useCallback(
    (message) => {
      const cid = message?.clientMessageId;
      if (cid && pendingRef.current.has(cid)) resolvePending(cid);
    },
    [resolvePending]
  );

  // After history loads: settle what the server has, restore what it hasn't.
  const reconcileHistory = useCallback(
    (list) => {
      const present = new Set(list.map((m) => m.clientMessageId).filter(Boolean));
      const restored = [];
      for (const record of readPendingSends(userId, conversationId)) {
        if (present.has(record.clientMessageId)) {
          resolvePending(record.clientMessageId);
          continue;
        }
        if (!pendingRef.current.has(record.clientMessageId)) {
          pendingRef.current.set(record.clientMessageId, {
            payload: record.payload,
            text: record.text ?? record.payload?.content?.text ?? "",
            replyTo: record.replyTo || null,
            conversationId,
            attempt: 0,
          });
        }
        restored.push(
          optimisticMessage({
            clientMessageId: record.clientMessageId,
            conversationId,
            senderId: userId,
            text: record.text ?? record.payload?.content?.text ?? "",
            replyTo: record.replyTo || null,
            createdAt: new Date(record.createdAt || Date.now()).toISOString(),
            status: "unconfirmed",
          })
        );
      }
      return restored.length ? [...list, ...restored] : list;
    },
    [userId, conversationId, resolvePending]
  );

  // Nothing to tear down: ack callbacks that fire after unmount only touch a
  // detached state setter, and the storage record keeps the send retryable.

  return { send, retry, discard, notifyServerMessage, reconcileHistory };
}
