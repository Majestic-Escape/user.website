"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  RotateCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RemoveScroll } from "react-remove-scroll";
import { hideOthers } from "aria-hidden";

// Full-screen photo viewer shared by the traveler stay page, the host listings
// table and the admin property view.
//
// Why it is built the way it is:
// - Radix Dialog primitives (not the shadcn DialogContent wrapper, which
//   hard-codes a centred max-w-lg card) give us Escape, aria roles and
//   return-focus for free. It runs non-modal so the floating chat widget
//   stays usable over the gallery; see LightboxShell for what that costs.
// - Embla drives the stage: real touch swipe with physics, keyboard/arrow
//   navigation and a slide transition, all with zero extra dependencies.
// - Only the current slide and its ±2 neighbours mount an <img>. Neighbours
//   are fetched eagerly so an arrow press or swipe never waits on the
//   network, while a 100-photo gallery still keeps the DOM and the image
//   optimizer budget bounded.
// - The enter/exit animation is a plain fade. Anything that scales the
//   content would make embla measure slide widths mid-animation.

export interface PhotoLightboxProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Photo to open on (clamped into range). */
  initialIndex?: number;
  /** Accessible dialog title, e.g. the listing name. */
  title?: string;
}

type Rotation = 0 | 90 | 180 | 270;

const PRELOAD_RADIUS = 2;
const FALLBACK_SRC = "/placeholder.svg";

function clampIndex(index: number, count: number) {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), count - 1);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Marker stored in history.state for the entry the open lightbox owns.
const HISTORY_MARKER = "meLightbox";
// Events from inside the chat widget's shadow DOM reach the document
// retargeted to its host element.
const CHAT_WIDGET_TAG = "majestic-chat-widget";
function isInChatWidget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(CHAT_WIDGET_TAG) !== null;
}

export default function PhotoLightbox({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
  title,
}: PhotoLightboxProps) {
  const count = images.length;
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  // Give the open lightbox its own history entry so the browser / OS Back
  // button closes the gallery instead of leaving the listing (a full-screen
  // viewer reads as a "page" to users, especially on phones). Closing via X
  // or Escape pops that entry again, so Back afterwards still goes where it
  // did before. Next's App Router patches pushState to carry its own state,
  // so a same-URL push is a no-op for routing.
  React.useEffect(() => {
    if (!open || count === 0 || typeof window === "undefined") return;
    const hrefAtOpen = window.location.href;
    let ownsEntry = true;
    try {
      window.history.pushState(
        { ...(window.history.state ?? {}), [HISTORY_MARKER]: true },
        "",
      );
    } catch {
      ownsEntry = false;
    }
    const onPopState = (event: PopStateEvent) => {
      // Back from our entry lands on the previous state (no marker) → close.
      // Forward back onto our entry (marker present) is ignored.
      if (event.state?.[HISTORY_MARKER]) return;
      ownsEntry = false;
      onOpenChangeRef.current(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed by X / Escape / programmatically while our entry is still on
      // top: pop it so we don't leave a phantom entry. Skip if the URL
      // changed underneath us (a route change unmounted the lightbox).
      if (
        ownsEntry &&
        window.location.href === hrefAtOpen &&
        window.history.state?.[HISTORY_MARKER]
      ) {
        window.history.back();
      }
    };
  }, [open, count]);

  // Nothing to show → never open (an empty black dialog is worse than none).
  if (count === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPrimitive.Portal>
        {/* Non-modal Radix renders no Overlay: the stage carries the black. */}
        <DialogPrimitive.Content
          // No description element; silence the Radix warning explicitly.
          aria-describedby={undefined}
          // Talking to the chat widget must not close the gallery: not the
          // tap on its launcher, and not an Escape typed into its input.
          onInteractOutside={(event) => {
            if (isInChatWidget(event.target)) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isInChatWidget(event.target)) event.preventDefault();
          }}
          className="me-dialog-fade fixed inset-0 z-[9999] flex flex-col bg-black text-white outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            {title ? `${title} photos` : "Photo gallery"}
          </DialogPrimitive.Title>
          <LightboxShell>
            {/* Mounted only while open, so index/rotation state resets per open. */}
            <LightboxStage
              images={images}
              initialIndex={clampIndex(initialIndex, count)}
            />
          </LightboxShell>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// What a modal Radix dialog would have given us, minus the parts that break
// the floating chat widget. Modal Radix puts `pointer-events: none` on <body>
// and, worse, its focus trap yanks focus back into the dialog whenever the
// chat's input (in the widget's shadow DOM, outside the dialog) is focused —
// typing into the chat over an open gallery went nowhere. So the dialog is
// non-modal and this shell re-adds the useful parts itself:
// - body scroll lock (react-remove-scroll, the same package Radix uses);
// - aria-hidden on everything except the gallery and the chat widget;
// - a Tab cycle inside the gallery, which only sees keys typed inside it.
function LightboxShell({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chat = document.querySelector(CHAT_WIDGET_TAG);
    return hideOthers(chat ? [el, chat] : el);
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !ref.current) return;
    const focusable = Array.from(
      ref.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => node.offsetWidth > 0 || node.offsetHeight > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !ref.current.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !ref.current.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <RemoveScroll className="flex flex-1 flex-col min-h-0">
      <div ref={ref} className="flex flex-1 flex-col min-h-0" onKeyDown={onKeyDown}>
        {children}
      </div>
    </RemoveScroll>
  );
}

function LightboxStage({
  images,
  initialIndex,
}: {
  images: string[];
  initialIndex: number;
}) {
  const count = images.length;
  const [current, setCurrent] = React.useState(initialIndex);
  const [rotation, setRotation] = React.useState<Record<number, Rotation>>({});
  const [loaded, setLoaded] = React.useState<Record<number, true>>({});
  const [failed, setFailed] = React.useState<Record<number, true>>({});
  const [stage, setStage] = React.useState({ w: 0, h: 0 });

  const stageRef = React.useRef<HTMLDivElement>(null);
  const hStripRef = React.useRef<HTMLDivElement>(null);
  const vStripRef = React.useRef<HTMLDivElement>(null);

  const [viewportRef, embla] = useEmblaCarousel({
    loop: count > 1,
    startIndex: initialIndex,
    skipSnaps: false,
    duration: 20,
    watchDrag: count > 1,
  });

  // Keep `current` in sync with embla (swipe, arrows, keyboard, thumbnails).
  React.useEffect(() => {
    if (!embla) return;
    const sync = () => setCurrent(embla.selectedScrollSnap());
    embla.on("select", sync);
    embla.on("reInit", sync);
    return () => {
      embla.off("select", sync);
      embla.off("reInit", sync);
    };
  }, [embla]);

  // The maps above are index-keyed. If the caller swaps or reorders the
  // photos while we are open, index N no longer means the same picture, so
  // start over (embla's watchSlides handles its own re-init).
  const signature = images.join("\n");
  React.useEffect(() => {
    setRotation((r) => (Object.keys(r).length ? {} : r));
    setLoaded((l) => (Object.keys(l).length ? {} : l));
    setFailed((f) => (Object.keys(f).length ? {} : f));
  }, [signature]);

  // Stage size feeds the rotated layout (a 90° photo needs a height×width box).
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setStage({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the active thumbnail centred in whichever strip is visible. Scroll
  // the strip itself rather than scrollIntoView, which would also scroll the
  // (locked) document behind the dialog.
  React.useEffect(() => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    const h = hStripRef.current;
    const hThumb = h?.children[current] as HTMLElement | undefined;
    if (h && hThumb) {
      h.scrollTo({
        left: hThumb.offsetLeft - h.clientWidth / 2 + hThumb.clientWidth / 2,
        behavior,
      });
    }
    const v = vStripRef.current;
    const vThumb = v?.children[current] as HTMLElement | undefined;
    if (v && vThumb) {
      v.scrollTo({
        top: vThumb.offsetTop - v.clientHeight / 2 + vThumb.clientHeight / 2,
        behavior,
      });
    }
  }, [current]);

  const loopDistance = React.useCallback(
    (index: number) => {
      const d = Math.abs(index - current);
      return Math.min(d, count - d);
    },
    [current, count],
  );

  const goTo = (index: number) => {
    // Jump (no animation) when the target is outside the mounted window so we
    // never animate across empty slides.
    embla?.scrollTo(index, loopDistance(index) > PRELOAD_RADIUS);
  };

  const rotate = React.useCallback(() => {
    setRotation((r) => ({
      ...r,
      [current]: (((r[current] ?? 0) + 90) % 360) as Rotation,
    }));
  }, [current]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      embla?.scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      embla?.scrollNext();
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      rotate();
    }
  };

  const deg = rotation[current] ?? 0;
  const currentAlt = `Photo ${current + 1} of ${count}`;

  return (
    <div
      className="flex h-full min-h-0 flex-col select-none"
      onKeyDown={onKeyDown}
    >
      {/* Header: counter + actions (padded for notches / dynamic island). */}
      <div
        className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 md:px-4"
        style={{
          paddingTop: "max(0.5rem, env(safe-area-inset-top))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <div
          className="text-sm font-medium tabular-nums text-white/90"
          aria-hidden="true"
        >
          {current + 1} / {count}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={rotate}
            className="rounded-full p-2 transition-colors hover:bg-white/15 active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Rotate image"
            title="Rotate (R)"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <DialogPrimitive.Close
            className="rounded-full p-2 transition-colors hover:bg-white/15 active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Stage */}
        <div ref={stageRef} className="relative min-h-0 flex-1">
          <div
            ref={viewportRef}
            className="absolute inset-0 overflow-hidden"
            style={{ touchAction: "pan-y pinch-zoom" }}
          >
            <div className="flex h-full">
              {images.map((src, index) => {
                const mounted = loopDistance(index) <= PRELOAD_RADIUS;
                const isCurrent = index === current;
                const slideDeg = rotation[index] ?? 0;
                const swapped = slideDeg === 90 || slideDeg === 270;
                const sized = stage.w > 0 && stage.h > 0;
                return (
                  <div
                    key={`${src}-${index}`}
                    className="relative h-full min-w-0 flex-[0_0_100%]"
                    aria-hidden={!isCurrent}
                  >
                    {mounted && (
                      <div
                        className={cn(
                          "absolute transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none",
                          sized ? "left-1/2 top-1/2" : "inset-0",
                        )}
                        style={
                          sized
                            ? {
                                width: swapped ? stage.h : stage.w,
                                height: swapped ? stage.w : stage.h,
                                transform: `translate(-50%, -50%) rotate(${slideDeg}deg)`,
                              }
                            : { transform: `rotate(${slideDeg}deg)` }
                        }
                      >
                        {failed[index] ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/60">
                            <ImageOff className="h-8 w-8" aria-hidden="true" />
                            <span className="text-sm">Image unavailable</span>
                          </div>
                        ) : (
                          <>
                            {!loaded[index] && (
                              <div
                                className="absolute inset-0 animate-pulse bg-white/10 motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                            )}
                            <Image
                              src={src || FALLBACK_SRC}
                              alt={`Photo ${index + 1} of ${count}`}
                              fill
                              sizes={swapped ? "100vh" : "100vw"}
                              className={cn(
                                "object-contain transition-opacity duration-200 motion-reduce:transition-none",
                                loaded[index] ? "opacity-100" : "opacity-0",
                              )}
                              draggable={false}
                              loading="eager"
                              fetchPriority={isCurrent ? "high" : "low"}
                              onLoad={() =>
                                setLoaded((l) =>
                                  l[index] ? l : { ...l, [index]: true },
                                )
                              }
                              onError={() =>
                                setFailed((f) =>
                                  f[index] ? f : { ...f, [index]: true },
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => embla?.scrollPrev()}
                className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md transition hover:bg-white active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:p-2.5"
                style={{ left: "max(0.75rem, env(safe-area-inset-left))" }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => embla?.scrollNext()}
                className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md transition hover:bg-white active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:p-2.5"
                style={{ right: "max(0.75rem, env(safe-area-inset-right))" }}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <span className="sr-only" aria-live="polite">
            {currentAlt}
            {deg ? `, rotated ${deg} degrees` : ""}
          </span>
        </div>

        {/* Desktop thumbnails: vertical strip */}
        {count > 1 && (
          <div
            ref={vStripRef}
            className="hidden w-24 shrink-0 flex-col gap-2 overflow-y-auto bg-black/60 p-2 no-scrollbar md:flex lg:w-28"
            style={{ paddingRight: "max(0.5rem, env(safe-area-inset-right))" }}
          >
            {images.map((src, index) => (
              <Thumbnail
                key={`${src}-${index}`}
                src={src}
                index={index}
                active={index === current}
                failed={!!failed[index]}
                onSelect={goTo}
                className="aspect-square w-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile thumbnails: horizontal strip */}
      {count > 1 && (
        <div
          ref={hStripRef}
          className="flex shrink-0 gap-2 overflow-x-auto bg-black/60 p-2 no-scrollbar md:hidden"
          style={{
            paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
            paddingRight: "max(0.5rem, env(safe-area-inset-right))",
          }}
        >
          {images.map((src, index) => (
            <Thumbnail
              key={`${src}-${index}`}
              src={src}
              index={index}
              active={index === current}
              failed={!!failed[index]}
              onSelect={goTo}
              className="h-14 w-14 shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Thumbnail({
  src,
  index,
  active,
  failed,
  onSelect,
  className,
}: {
  src: string;
  index: number;
  active: boolean;
  failed: boolean;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Go to image ${index + 1}`}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative overflow-hidden rounded-md transition active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        active
          ? "ring-2 ring-white"
          : "opacity-60 hover:opacity-100 focus-visible:opacity-100",
        failed && "opacity-80",
        className,
      )}
    >
      {failed ? (
        <span className="flex h-full w-full items-center justify-center bg-white/20 text-white/80">
          <ImageOff className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : (
        <Image
          src={src || FALLBACK_SRC}
          alt=""
          fill
          sizes="112px"
          className="object-cover"
          draggable={false}
        />
      )}
    </button>
  );
}
