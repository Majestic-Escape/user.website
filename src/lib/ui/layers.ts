"use client";

// Full-screen layers (the phone search sheet, "Where to?") read as pages on a
// phone, so the system Back button / gesture must close the top layer rather
// than leave the page underneath.
//
// Each open layer owns one history entry: same URL, its id appended to
// history.state[KEY]. Back pops the entry → the layer closes. Closing any
// other way (X, Escape, a pick) pops the entry again, so Back afterwards goes
// where it did before. Next.js keeps its own router state in history.state;
// it is spread through untouched, so a traversal between our entries is a
// no-op for the router (the photo lightbox uses the same technique).
//
// Navigating away FROM inside layers must unwind their entries first
// (leaveLayersThen): pushing the new page on top of them would leave entries
// behind that Back walks into, and a pending history.back() racing the push
// could even undo the navigation.
import * as React from "react";

const KEY = "meLayers";
const OVERLAY_ATTR = "data-me-overlay";
const open = new Set<string>(); // layers that currently own a history entry
let overlays = 0;

function layersIn(state: unknown): string[] {
  const v = state && typeof state === "object" ? (state as Record<string, unknown>)[KEY] : null;
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
}

/** Back closes this layer while `active`. */
export function useBackToClose(active: boolean, onClose: () => void) {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    if (!active) return;
    const id = newId();
    const href = window.location.href;
    let owns = false;
    try {
      const state = window.history.state ?? {};
      window.history.pushState({ ...state, [KEY]: [...layersIn(state), id] }, "");
      owns = true;
      open.add(id);
    } catch {
      // history unavailable (sandboxed frame): the layer still closes by X / Escape
    }
    const onPop = (e: PopStateEvent) => {
      if (layersIn(e.state).includes(id)) return; // still on (or forward onto) our entry
      owns = false;
      open.delete(id);
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      open.delete(id);
      // Closed by X / a pick while our entry is still on top → pop it. Not when
      // the URL changed underneath (a navigation already moved on).
      if (owns && window.location.href === href && layersIn(window.history.state).at(-1) === id) {
        window.history.back();
      }
    };
  }, [active]);
}

/**
 * Run `navigate` once the open layers' history entries are gone, so the new
 * page replaces them instead of stacking on top. The layers close themselves
 * as their entries pop. Falls back to navigating anyway if no popstate comes.
 */
export function leaveLayersThen(navigate: () => void) {
  if (typeof window === "undefined") return navigate();
  const stack = layersIn(window.history.state);
  let n = 0;
  for (let i = stack.length - 1; i >= 0 && open.has(stack[i]); i--) n++;
  if (!n) return navigate();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("popstate", finish);
    window.clearTimeout(timer);
    navigate();
  };
  // added after the layers' own listeners → they close first, then we navigate
  window.addEventListener("popstate", finish);
  const timer = window.setTimeout(finish, 600);
  window.history.go(-n);
}

/**
 * Marks the document while a full-screen layer is open (nesting-safe). CSS
 * hides the floating chat launcher then: it sits above every layer and would
 * cover the sheet's own buttons.
 */
export function useOverlayFlag(active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    overlays++;
    document.documentElement.setAttribute(OVERLAY_ATTR, "");
    return () => {
      overlays = Math.max(0, overlays - 1);
      if (!overlays) document.documentElement.removeAttribute(OVERLAY_ATTR);
    };
  }, [active]);
}

/** Keeps a closing layer mounted for its exit animation. */
export function usePresence(open: boolean, exitMs: number) {
  const [present, setPresent] = React.useState(open);
  React.useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !exitMs) {
      setPresent(false);
      return;
    }
    const t = window.setTimeout(() => setPresent(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);
  return open || present;
}
