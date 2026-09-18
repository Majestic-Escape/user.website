"use client";

import { useRef } from "react";
import { Reply } from "lucide-react";

// Gesture geometry (px). Direction is decided once, LOCK px from the start;
// a swipe of THRESHOLD px replies; the bubble follows the finger to MAX with
// rubber-banding past THRESHOLD; nothing starts inside EDGE (the OS back
// gesture zone on iOS/Android).
const LOCK = 8;
const THRESHOLD = 48;
const MAX = 72;
const EDGE = 24;

const rubber = (dx) => Math.min(MAX, dx <= THRESHOLD ? dx : THRESHOLD + (dx - THRESHOLD) * 0.35);

/**
 * WhatsApp-style "swipe right to reply" wrapper for one message bubble.
 *
 * Touch/pen: hand-rolled Pointer Events — all gesture state lives in a ref and
 * the bubble is moved with a direct `style.transform` write, so a drag never
 * re-renders React. `touch-action: pan-y pinch-zoom` leaves vertical scrolling
 * and pinch-zoom to the browser (which then fires `pointercancel`, resetting
 * us); a second finger cancels; once the direction is locked horizontal the
 * gesture is ours until release.
 *
 * Mouse: no drag. A small ↩ button beside the bubble appears on hover / focus
 * (CSS only, so server and client render the same markup); on hover-less
 * devices it is `sr-only` — still in the accessibility tree.
 *
 * `onReply` is invoked synchronously inside `pointerup` / `click`, which keeps
 * the user-gesture context alive so the composer can open the keyboard on iOS.
 */
export default function SwipeToReply({ messageId, own, authorName, onReply, children }) {
  const slideRef = useRef(null);
  const hintRef = useRef(null);
  const g = useRef({ state: "idle", pointerId: null, x0: 0, y0: 0, dx: 0, buzzed: false, dragEndedAt: 0 });

  const reset = () => {
    const s = slideRef.current;
    const h = hintRef.current;
    const st = g.current;
    if (s) {
      s.style.transition = "";
      s.style.transform = "";
      s.style.userSelect = "";
      s.style.webkitUserSelect = "";
      s.style.willChange = "";
    }
    if (h) {
      h.style.opacity = "0";
      h.style.transform = "translateY(-50%) scale(.6)";
    }
    st.state = "idle";
    st.pointerId = null;
    st.dx = 0;
    st.buzzed = false;
  };

  const onPointerDown = (e) => {
    const st = g.current;
    if (!e.isPrimary) {
      // a second finger (pinch): whatever was in progress is not a reply
      if (st.state !== "idle") reset();
      st.state = "cancelled";
      return;
    }
    if (e.button !== 0 || e.pointerType === "mouse") return;
    if (e.clientX < EDGE) return;
    if (e.target.closest?.("[data-reply-button]")) return;
    st.state = "pending";
    st.pointerId = e.pointerId;
    st.x0 = e.clientX;
    st.y0 = e.clientY;
    st.dx = 0;
    st.buzzed = false;
  };

  const onPointerMove = (e) => {
    const st = g.current;
    if (st.pointerId !== e.pointerId || st.state === "idle" || st.state === "cancelled") return;
    const dx = e.clientX - st.x0;
    const dy = e.clientY - st.y0;
    if (st.state === "pending") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK) return;
      if (dx > Math.abs(dy)) {
        st.state = "dragging";
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* synthetic pointers may not be capturable */
        }
        const s = slideRef.current;
        if (s) {
          s.style.transition = "none";
          s.style.userSelect = "none";
          s.style.webkitUserSelect = "none";
          s.style.willChange = "transform";
        }
      } else {
        // vertical (or leftwards) intent: the browser scrolls, we stay out
        st.state = "cancelled";
        return;
      }
    }
    st.dx = dx;
    const forward = Math.max(0, dx);
    const offset = rubber(forward);
    const progress = Math.min(1, forward / THRESHOLD);
    if (slideRef.current) slideRef.current.style.transform = `translateX(${offset}px)`;
    if (hintRef.current) {
      hintRef.current.style.opacity = String(progress);
      hintRef.current.style.transform = `translateY(-50%) scale(${0.6 + 0.4 * progress})`;
    }
    if (forward >= THRESHOLD && !st.buzzed) {
      st.buzzed = true;
      try {
        navigator.vibrate?.(8);
      } catch {
        /* not supported */
      }
    }
  };

  const finish = (e, allowReply) => {
    const st = g.current;
    if (st.pointerId !== e.pointerId) {
      // a non-primary finger lifting; the primary's own up/cancel resets
      if (st.state === "cancelled" && e.isPrimary) st.state = "idle";
      return;
    }
    const fire = allowReply && st.state === "dragging" && st.dx >= THRESHOLD;
    if (st.state === "dragging") st.dragEndedAt = Date.now();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* nothing captured */
    }
    reset();
    if (fire) onReply();
  };

  const onPointerUp = (e) => finish(e, true);
  const onPointerCancel = (e) => finish(e, false);
  // Touch pointers are implicitly captured by the pointerdown target (the
  // bubble). Taking explicit capture on the wrapper releases that implicit
  // capture, and the child's lostpointercapture bubbles up here — that must
  // not reset a drag we just started. Only our own lost capture matters.
  const onLostPointerCapture = (e) => {
    if (e.target === e.currentTarget && g.current.state === "dragging") reset();
  };

  // A drag must not double as a click on whatever it started on (the quote
  // block is a button). Browsers only synthesize that click right after the
  // release, so a short window is enough — and a later, genuine click (e.g.
  // Space on the ↩ button) must never be swallowed.
  const onClickCapture = (e) => {
    if (Date.now() - g.current.dragEndedAt < 350) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      data-message-id={messageId}
      className={`group relative flex items-center max-w-[75%] rounded-2xl ${own ? "flex-row-reverse" : ""}`}
      style={{ touchAction: "pan-y pinch-zoom" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
      onClickCapture={onClickCapture}
    >
      <span
        ref={hintRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 opacity-0"
        style={{ transform: "translateY(-50%) scale(.6)" }}
      >
        <Reply className="h-3.5 w-3.5" />
      </span>
      <div ref={slideRef} className="relative min-w-0 max-w-full transition-transform duration-200 ease-out motion-reduce:transition-none">
        {children}
      </div>
      <button
        type="button"
        data-reply-button
        aria-label={`Reply to message from ${authorName}`}
        onClick={onReply}
        onMouseDown={(e) => e.preventDefault()}
        className={`absolute top-1/2 -translate-y-1/2 ${own ? "right-full mr-1" : "left-full ml-1"} flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm opacity-0 transition-opacity hover:text-primaryGreen focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen group-hover:opacity-100 [@media(hover:none)]:sr-only [@media(hover:none)]:focus-visible:not-sr-only`}
      >
        <Reply className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
