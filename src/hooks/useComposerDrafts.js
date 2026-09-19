"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// A client component still renders on the server, where useLayoutEffect warns
// (React 18). The swap only matters in the browser anyway.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Drafts live in sessionStorage — per tab, gone when the tab closes, wiped by
// logout (which clears sessionStorage) — so a reload mid-sentence keeps the
// text, like WhatsApp Web. Keyed by user as well as thread so a different
// account in the same tab never sees them. When storage is unavailable
// (private mode, quota) the same map lives in memory for the page's lifetime.
const memory = new Map();
const keyFor = (userId, conversationId) => `me:draft:${userId || "anon"}:${conversationId}`;

function readDraft(userId, conversationId) {
  const key = keyFor(userId, conversationId);
  try {
    const stored = sessionStorage.getItem(key);
    if (stored !== null) return stored;
  } catch {
    /* fall through to memory */
  }
  return memory.get(key) || "";
}

function writeDraft(userId, conversationId, text) {
  const key = keyFor(userId, conversationId);
  const keep = typeof text === "string" && text.trim().length > 0;
  if (keep) memory.set(key, text);
  else memory.delete(key);
  try {
    if (keep) sessionStorage.setItem(key, text);
    else sessionStorage.removeItem(key);
  } catch {
    /* memory copy is enough */
  }
}

/**
 * Per-conversation composer drafts, WhatsApp-style.
 *
 * The chat pages keep one `newMessage` string for whichever thread is open, so
 * text typed into one thread followed everyone to the next: switch threads and
 * the half-written message was still sitting in the composer. This stashes
 * the draft under the thread it was written for when the selection changes
 * and restores that thread's draft when it is opened again. Sending still
 * clears the composer, so a sent draft never comes back; a whitespace-only
 * draft is dropped rather than kept.
 *
 * The switch runs in a layout effect so the swap lands before the frame with
 * the new thread paints — the other thread's text is never visible, not even
 * for one frame. The open thread's draft is mirrored to storage as it is
 * typed, so a reload keeps it.
 */
export function useComposerDrafts({ conversationId, value, setValue, userId = null }) {
  const currentIdRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  // Set when the switch below replaces the composer text: the commit that
  // carries the new thread id still renders the previous thread's text, and
  // the mirror effect must not store it under the new thread.
  const restoringRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const prev = currentIdRef.current;
    const next = conversationId || null;
    if (prev === next) return;

    if (prev) writeDraft(userId, prev, valueRef.current);
    currentIdRef.current = next;

    const restored = next ? readDraft(userId, next) : "";
    if (restored !== valueRef.current) {
      restoringRef.current = true;
      setValue(restored);
    }
  }, [conversationId, setValue, userId]);

  useEffect(() => {
    if (restoringRef.current) {
      restoringRef.current = false;
      return;
    }
    const id = conversationId || null;
    if (id && currentIdRef.current === id) writeDraft(userId, id, value);
  }, [value, conversationId, userId]);
}
