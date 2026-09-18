"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildReplySnapshot, canQuote, replyAuthorLabel } from "@/lib/chat/reply";

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

  useEffect(() => {
    setReplyTo(null);
  }, [conversationId]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const labelFor = useCallback((senderId) => replyAuthorLabel(senderId, userId, otherName), [userId, otherName]);

  const pinToBottom = useCallback(() => {
    const scroller = getScroller?.();
    if (!scroller) return;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (distance < 80) {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
      });
    }
  }, [getScroller]);

  const startReply = useCallback(
    (message) => {
      if (!canQuote(message)) {
        toast("Wait for the message to finish sending");
        return;
      }
      // Focus first, synchronously: this runs inside the swipe/click gesture.
      getInput?.()?.focus();
      setReplyTo(buildReplySnapshot(message));
      pinToBottom();
    },
    [getInput, pinToBottom]
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
      el.classList.remove("me-reply-flash");
      void el.offsetWidth; // restart the animation if it is already running
      el.classList.add("me-reply-flash");
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => el.classList.remove("me-reply-flash"), 1300);
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
