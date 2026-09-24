"use client";

// Full-screen "Where to?" for phones and touch devices (Airbnb-style).
//
// A popover anchored to a field cannot survive the on-screen keyboard: the
// keyboard shrinks the visible area, the popover flips above its trigger and
// the input it contains scrolls off the top of the screen. Here the input is
// pinned at the top and the list fills exactly the VISIBLE area above the
// keyboard (window.visualViewport, which shrinks with it on iOS Safari and
// Android Chrome), scrolling inside itself.
import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

function useVisibleArea(active: boolean) {
  const [area, setArea] = React.useState<{ height: number; top: number } | null>(null);
  React.useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => setArea(vv ? { height: vv.height, top: vv.offsetTop } : { height: window.innerHeight, top: 0 });
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);
  return area;
}

export default function DestinationSheet({ open, onClose, title = "Where to?", children }: Props) {
  const area = useVisibleArea(open);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;

  React.useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind never scrolls under the sheet
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-x-0 z-[10050] flex flex-col bg-white font-poppins"
      style={{ top: area ? area.top : 0, height: area ? area.height : "100dvh" }}
    >
      <div className="flex shrink-0 items-center gap-1 border-b px-2 py-1.5">
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-graphite hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="font-bricolage text-base font-semibold text-absoluteDark">{title}</h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>,
    document.body,
  );
}

/** True on touch-first devices (phones, tablets): they get the sheet, not a popover. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}
