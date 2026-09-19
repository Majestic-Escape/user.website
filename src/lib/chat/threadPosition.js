// Keep the thread where the user was when the composer takes focus.
//
// Every "keyboard opened" / "composer focused" path used to slam the thread to
// the bottom on a burst of timers. Right for the common case — the reader is
// at the bottom and the keyboard must not cover the last message — but wrong
// whenever the user had scrolled up: swiping an older message to reply to it
// focused the composer, and the message they were replying to was yanked out
// of view. WhatsApp never does that: a thread at the bottom stays pinned to
// the bottom while the keyboard animates in; a thread scrolled up keeps its
// place, and the message being replied to stays visible.
//
// `holdThreadPosition` must be called synchronously at the start of the
// focus / resize event — before the keyboard, the reply bar or a viewport
// change shrinks the scroller — so "near the bottom" is judged against what
// the user was actually looking at.

const NEAR_BOTTOM_PX = 80;
// The keyboard animates in over a few hundred ms; the reply bar renders on the
// next frame. Same cadence the old scroll bursts used …
const SETTLE_STEPS_MS = [0, 50, 100, 150, 200, 300, 400, 500];
// … plus a ResizeObserver on the scroller for this long, so a keyboard that
// takes longer than the timers (older phones, an animation already running)
// is still answered the moment the thread actually changes height.
const HOLD_MS = 1500;
let activeHold = null;

export function isNearBottom(scroller, px = NEAR_BOTTOM_PX) {
  if (!scroller) return true;
  return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < px;
}

// Scroll only the thread's own scroller (never the window) by the minimum
// needed to bring `el` fully into view, with a little breathing room.
function keepVisible(scroller, el, margin = 8) {
  const r = el.getBoundingClientRect();
  const s = scroller.getBoundingClientRect();
  if (r.top < s.top + margin) scroller.scrollTop -= s.top + margin - r.top;
  else if (r.bottom > s.bottom - margin) scroller.scrollTop += r.bottom - (s.bottom - margin);
}

/**
 * @param {() => HTMLElement | null} getScroller  the thread's scroll container
 * @param {{ messageId?: string | null }} [opts]  a message that must stay in view
 *   (the one being replied to); ignored when the thread is pinned to the bottom
 */
export function holdThreadPosition(getScroller, { messageId = null } = {}) {
  const scroller = getScroller?.();
  if (!scroller) return;
  const stick = isNearBottom(scroller);
  const target = messageId ? scroller.querySelector(`[data-message-id="${messageId}"]`) : null;
  const apply = () => {
    const sc = getScroller?.();
    if (!sc) return;
    if (stick) {
      sc.scrollTop = sc.scrollHeight;
      return;
    }
    if (target && target.isConnected) keepVisible(sc, target);
  };
  // One hold at a time. A reply starts a hold with its message and then
  // focuses the composer, whose own focus handling calls this again without
  // one — that second call must not replace the hold that knows the message
  // (nor may the keyboard-resize handler a moment later). A hold that names a
  // message always takes over.
  if (activeHold) {
    if (!target) return;
    activeHold.stop();
  }
  const timers = SETTLE_STEPS_MS.map((ms) => (ms === 0 ? (apply(), null) : setTimeout(apply, ms)));
  let observer = null;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(apply);
    observer.observe(scroller);
  }
  let stopped = false;
  const stop = () => {
    if (stopped) return; // the deadline timer still fires after an explicit stop
    stopped = true;
    timers.forEach((t) => t && clearTimeout(t));
    observer?.disconnect();
    if (activeHold?.stop === stop) activeHold = null;
  };
  activeHold = { stop };
  setTimeout(stop, HOLD_MS);
}
