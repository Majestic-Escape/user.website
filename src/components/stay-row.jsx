"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A titled, horizontally scrolling row of cards (the stay page's related
// rows). Native scrolling + CSS scroll-snap: touch, trackpad, Shift+wheel and
// keyboard focus all work without a carousel library, and the next card
// peeks in at the edge so the row reads as scrollable. Previous / Next
// buttons appear at ≥ md only when the row overflows; they are real buttons,
// disabled at the ends. The section is a labelled region holding a list.
//
// Motion: the cards are visible in the server HTML. After hydration, a row
// that is still below the viewport fades / rises 8 px once when it scrolls
// in (first 4 cards staggered by 40 ms) — opacity and transform only, never
// with prefers-reduced-motion, and never without IntersectionObserver.
const EDGE_PX = 2;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function StayRow({ title, subtitle, items, renderItem, testId }) {
  const headingId = useId();
  const sectionRef = useRef(null);
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ overflow: false, start: true, end: true });
  const [reveal, setReveal] = useState("off"); // off → armed → shown

  // Overflow / end state, from a passive scroll listener (one read per
  // frame) and a ResizeObserver (viewport, zoom, fonts, images).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const next = { overflow: max > EDGE_PX, start: el.scrollLeft <= EDGE_PX, end: el.scrollLeft >= max - EDGE_PX };
      setEdges((p) => (p.overflow === next.overflow && p.start === next.start && p.end === next.end ? p : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", schedule, { passive: true });
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", schedule);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  // Entry motion, armed only for a row that is still out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion() || typeof IntersectionObserver !== "function") return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    setReveal("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReveal("shown");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const page = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.85, 200), behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  if (!items.length) return null;
  const btn =
    "inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border border-gray-300 bg-white text-absoluteDark shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <section ref={sectionRef} aria-labelledby={headingId} data-testid={testId} data-reveal={reveal} className="font-poppins">
      <div className="mb-4 flex items-end justify-between gap-4 md:min-h-[44px]">
        <div className="min-w-0">
          <h2 id={headingId} className="font-bricolage text-xl font-semibold text-gray-900 [overflow-wrap:anywhere] md:text-2xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-stone">{subtitle}</p> : null}
        </div>
        {edges.overflow ? (
          <div className="hidden shrink-0 gap-2 md:flex">
            <button type="button" className={btn} onClick={() => page(-1)} disabled={edges.start} aria-label={`Previous stays: ${title}`}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" className={btn} onClick={() => page(1)} disabled={edges.end} aria-label={`Next stays: ${title}`}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      {/* Bleeds to the screen edge on phones / tablets (the page gutter moves
          inside the scroller); py keeps focus rings from being clipped. */}
      {/* role="list": Safari drops list semantics from a ul without bullets */}
      <ul
        ref={scrollerRef}
        role="list"
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 py-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:gap-5 lg:px-0"
      >
        {items.map((item, i) => (
          <li
            key={item._id}
            className="me-reveal-item flex w-[78%] max-w-[300px] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[calc((100%-3*1.25rem)/4)] lg:max-w-none"
            style={i < 4 ? { transitionDelay: `${i * 40}ms` } : undefined}
          >
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </section>
  );
}
