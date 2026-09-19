"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildReplySnapshot, canQuote, replyAuthorLabel } from "@/lib/chat/reply";
import { holdThreadPosition } from "@/lib/chat/threadPosition";

/**
 * Reply-to state for a messaging page.
 *
 *   startReply(message)  → focuses the composer synchronously (must be called
 *                          inside the user's gesture so iOS opens the keyboard),
 *                          then shows the preview bar
 *   cancelReply()        → ✕, Escape (via onComposerKeyDown), conversation change
 *   restoreReply(ref)    → put a reply target back after a rejected send
 *   scrollToMessage(id)  → jump to the quoted original inside the thread's
 *                          scroller and flash it; toast when it isn't loaded
 *   labelFor(senderId)   → "You" / the other participant's first name
 *
 * `getInput` and `getScroller` return the live composer input and the messages
 * scroll container (the guest page has two render branches; lookups are
 * always scoped to the mounted one, never the document).
 */
export function useReplyTo({ conversationId, userId, otherName, getInput, getScroller }) {
  const [replyTo, setReplyTo] = useState(null);
  const flashTimer = useRef(null);
  const flashedRef = useRef(null);

  useEffect(() => {
    setReplyTo(null);
  }, [conversationId]);

  useEffect(
    () => () => {
      clearTimeout(flashTimer.current);
      flashedRef.current?.classList.remove("me-reply-flash");
    },
    []
  );

  const labelFor = useCallback((senderId) => replyAuthorLabel(senderId, userId, otherName), [userId, otherName]);

  const startReply = useCallback(
    (message) => {
      if (!canQuote(message)) {
        toast("Wait for the message to finish sending");
        return;
      }
      // Decide where the thread stays BEFORE focusing: the composer's own
      // focus handling, the keyboard and the preview bar all move the layout
      // right after this. A thread at the bottom stays pinned there; one the
      // user had scrolled up keeps its place with the swiped message in view
      // (WhatsApp behaviour — the reply target is never yanked off screen).
      holdThreadPosition(getScroller, { messageId: message.id });
      // Focus synchronously: this runs inside the swipe/click gesture, which
      // is what lets iOS open the keyboard.
      getInput?.()?.focus();
      setReplyTo(buildReplySnapshot(message));
    },
    [getInput, getScroller]
  );

  const cancelReply = useCallback(() => setReplyTo(null), []);

  const restoreReply = useCallback((ref) => {
    if (ref?.messageId) setReplyTo(ref);
  }, []);

  const scrollToMessage = useCallback(
    (messageId) => {
      const scroller = getScroller?.();
      const el = scroller?.querySelector?.(`[data-message-id="${messageId}"]`);
      if (!el) {
        toast("Original message is older than the messages currently loaded");
        return;
      }
      const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      clearTimeout(flashTimer.current);
      if (flashedRef.current && flashedRef.current !== el) flashedRef.current.classList.remove("me-reply-flash");
      flashedRef.current = el;
      el.classList.remove("me-reply-flash");
      void el.offsetWidth; // restart the animation if it is already running
      el.classList.add("me-reply-flash");
      flashTimer.current = setTimeout(() => {
        el.classList.remove("me-reply-flash");
        if (flashedRef.current === el) flashedRef.current = null;
      }, 1300);
    },
    [getScroller]
  );

  // Escape cancels the reply; everything else is left to the page's handler.
  const onComposerKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && replyTo) {
        e.preventDefault();
        setReplyTo(null);
        return true;
      }
      return false;
    },
    [replyTo]
  );

  return { replyTo, startReply, cancelReply, restoreReply, scrollToMessage, onComposerKeyDown, labelFor };
}
