import { useEffect, useState } from "react";

/**
 * True once the page is scrolled past `threshold` px. One passive listener,
 * read at most once per frame, and a state change only when the answer flips
 * (the headers used to set state on every scroll event).
 */
export function useScrolled(threshold = 0): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return scrolled;
}

/**
 * Compact once the page has scrolled `collapseAt` px down; full again only
 * back near the very top (`expandAt`). The gap between the two keeps the
 * header from flickering at the boundary (iOS rubber-banding, small jiggles).
 * Scroll jumps caused by a sheet freezing the page (body position: fixed →
 * scrollY reads 0) are ignored, so the header doesn't expand behind a sheet
 * and collapse again when it closes.
 */
export function useCompactOnScroll(collapseAt = 48, expandAt = 8): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      if (document.body.style.position === "fixed") return;
      const y = window.scrollY;
      setCompact((c) => (c ? y > expandAt : y > collapseAt));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [collapseAt, expandAt]);
  return compact;
}
