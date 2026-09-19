"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// A client component still renders on the server, where useLayoutEffect warns
// (React 18). The swap only matters in the browser anyway.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Per-conversation composer drafts, WhatsApp-style.
 *
 * The chat pages keep one `newMessage` string for whichever thread is open, so
 * text typed into one thread followed everyone to the next: switch threads and
 * the half-written message was still sitting in the composer. This stashes
 * the draft under the thread it was written for when the selection changes
 * and restores that thread's draft when it is opened again. Sending clears
 * the composer as before, so a sent draft never comes back; a whitespace-only
 * draft is dropped rather than kept.
 *
 * Runs in a layout effect so the swap lands before the frame with the new
 * thread paints — the other thread's text is never visible, not even for one
 * frame. In-memory only: drafts live as long as the page does.
 */
export function useComposerDrafts({ conversationId, value, setValue }) {
  const draftsRef = useRef(new Map());
  const currentIdRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useIsomorphicLayoutEffect(() => {
    const prev = currentIdRef.current;
    const next = conversationId || null;
    if (prev === next) return;

    if (prev) {
      const text = valueRef.current;
      if (text && text.trim()) draftsRef.current.set(prev, text);
      else draftsRef.current.delete(prev);
    }
    currentIdRef.current = next;

    const restored = next ? draftsRef.current.get(next) || "" : "";
    if (restored !== valueRef.current) setValue(restored);
  }, [conversationId, setValue]);
}
