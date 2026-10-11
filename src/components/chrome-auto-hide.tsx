"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Landscape phones are ~320-390px tall, and the site's fixed bars (header,
// bottom tab bar, the stay page's Reserve bar, the wizard header/footer) took
// 30-40% of that, leaving a sliver for the page. On those screens the bars
// slide away while the reader scrolls DOWN and come back on any scroll UP.
//
// It only does anything on short touch screens (QUERY). Everywhere else no
// listener is attached at all, so desktop, tablet and portrait pay nothing.
// Where it does run: one passive scroll listener, work throttled to one run
// per frame, and a single attribute write on <html> when the state actually
// flips. The motion itself is CSS (globals.css, `[data-chrome-bar]`): the
// independent `translate` property, so it never fights a bar's own transform.
//
// A bar is always shown near the top of the page, at the very bottom (a
// wizard's "Next" can never be stranded off-screen), whenever it holds keyboard
// focus (CSS :focus-within), and again after every navigation.
const QUERY = "(max-height: 500px) and (pointer: coarse)";
const TOP_ZONE = 64; // px from the top where the bars always stay
const HIDE_AFTER = 24; // px scrolled down before hiding (ignores jitter)
const SHOW_AFTER = 8; // px scrolled up before showing again
const JUMP = 250; // px in one frame: programmatic, not the reader

export function ChromeAutoHide() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia(QUERY);
    let last = 0;
    let down = 0;
    let up = 0;
    let hidden = false;
    let frame = 0;

    const apply = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      root.dataset.chrome = next ? "hidden" : "shown";
    };

    const run = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY); // iOS rubber-banding reports < 0
      const dy = y - last;
      last = y;
      // A touch fling moves well under JUMP px a frame; a bigger step is the
      // page jumping by itself (the booking sheet locks the body and restores
      // the position on close, anchors, back/forward) and is not the reader
      // scrolling, so it must not hide or show anything.
      if (Math.abs(dy) > JUMP) {
        down = 0;
        up = 0;
      } else if (dy > 0) {
        down += dy;
        up = 0;
      } else if (dy < 0) {
        up -= dy;
        down = 0;
      }
      const atBottom = window.innerHeight + y >= root.scrollHeight - 8;
      if (y <= TOP_ZONE || atBottom || up > SHOW_AFTER) apply(false);
      else if (down > HIDE_AFTER) apply(true);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      hidden = false;
      delete root.dataset.chrome;
    };
    const attach = () => {
      last = Math.max(0, window.scrollY);
      down = 0;
      up = 0;
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    const sync = () => {
      detach();
      if (mq.matches) attach();
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      detach();
    };
  }, [pathname]); // a new page starts with its bars showing

  return null;
}
