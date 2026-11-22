"use client";

// Client side of the admin "Messaging" switch (see lib/messaging-config.js).
//
// One module-level store, so every consumer (nav items, the unread-count
// provider, the socket manager, the route guard) shares one answer and one
// request:
//   - at most one config request per CONFIG_TTL_MS, de-duplicated while in flight
//   - the last answer is kept in sessionStorage, so the next page of the same
//     visit paints the right nav straight away (no hidden→shown flicker)
//   - the chat service's own refusals (a 503 `MESSAGING_DISABLED`, a refused
//     socket handshake, a `messaging:disabled` event) switch it off at once,
//     without waiting for the next config read
//   - while it is off, one quiet re-check a minute (visible tab only), so the
//     nav comes back by itself when an admin switches messaging on again
//
// "On" means the chat service answers AND no admin switched messaging off (see
// lib/messaging-config.js — an unreachable chat service, e.g. one paused to save
// money, reads as OFF so nobody meets a "try again" dead end; an unreadable admin
// switch reads as ON). The browser asks the site's own `/api/messaging-status`; it
// never decides "off" from its own failure to reach anything. Status is
// 'on' | 'off' | 'pending' (first lookup still running) | 'unreadable' (that
// endpoint itself could not be read — treated as ON everywhere, so a failed LOOKUP
// never takes away a working inbox). UI that merely shows or hides something uses
// `useMessagingEnabled()` (only 'off' hides).

import { useEffect, useSyncExternalStore } from "react";
import { fetchMessagingEnabled } from "@/lib/messaging-config";

const STORAGE_KEY = "me:messaging-enabled";
const CONFIG_TTL_MS = 60_000;
const SESSION_MAX_AGE_MS = 5 * 60_000;
const RETRY_AFTER_FAIL_MS = 30_000; // do not hammer an unreachable service on every mount
const RECHECK_WHILE_OFF_MS = 60_000;

let status = "unknown"; // 'on' | 'off' | 'unknown' (no answer yet)
let lookedUp = false; // a lookup has finished, whatever it returned
let fetchedAt = 0;
let lastAttemptAt = 0;
let inflight = null;
let bound = false;
let offTimer = null;
const listeners = new Set();

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const { v, t } = JSON.parse(raw);
    if (typeof v === "boolean" && typeof t === "number" && Date.now() - t < SESSION_MAX_AGE_MS) {
      status = v ? "on" : "off";
      fetchedAt = t;
    }
  } catch {
    /* storage blocked or malformed: start unknown */
  }
}
if (typeof window !== "undefined") readSession();

const notify = () => listeners.forEach((l) => l());

function syncOffTimer() {
  if (typeof document === "undefined") return;
  if (status === "off" && !offTimer) {
    offTimer = setInterval(() => {
      if (document.visibilityState === "visible") ensureMessagingConfig({ force: true });
    }, RECHECK_WHILE_OFF_MS);
  } else if (status !== "off" && offTimer) {
    clearInterval(offTimer);
    offTimer = null;
  }
}

function setStatus(enabled) {
  const next = enabled ? "on" : "off";
  fetchedAt = Date.now();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ v: enabled, t: fetchedAt }));
  } catch {
    /* ignore */
  }
  if (next === status) return;
  status = next;
  syncOffTimer();
  notify();
}
// A session that starts out "off" (restored from sessionStorage) needs its timer too.
if (typeof window !== "undefined") syncOffTimer();

function bindRefresh() {
  if (bound || typeof document === "undefined") return;
  bound = true;
  // A tab left open for hours: look again when it comes back (TTL-limited).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ensureMessagingConfig();
  });
}

/** Was the current answer (on or off) read or reported within CONFIG_TTL_MS? */
export function isMessagingStatusFresh() {
  return status !== "unknown" && Date.now() - fetchedAt < CONFIG_TTL_MS;
}

/**
 * Was the current answer obtained by THIS page load (rather than carried over from
 * the previous page via sessionStorage)? Such an answer is newer than anything the
 * server rendered into the page, so it wins over the server's view.
 */
export function isMessagingStatusFromThisPage() {
  return status !== "unknown" && typeof performance !== "undefined" && fetchedAt >= performance.timeOrigin;
}

/** Resolve the current answer (`true` unless known off). Never rejects. */
export function ensureMessagingConfig({ force = false } = {}) {
  bindRefresh();
  if (!force) {
    if (isMessagingStatusFresh()) return Promise.resolve(status !== "off");
    if (status === "unknown" && lookedUp && Date.now() - lastAttemptAt < RETRY_AFTER_FAIL_MS) {
      return Promise.resolve(true); // unreadable a moment ago: stay fail-open, retry later
    }
  }
  if (inflight) return inflight;
  lastAttemptAt = Date.now();
  inflight = fetchMessagingEnabled()
    .then((enabled) => {
      const firstSettle = !lookedUp;
      lookedUp = true;
      if (enabled === null) {
        // Unreadable: keep what we knew; consumers waiting on 'pending' move on.
        if (firstSettle) notify();
        return status !== "off";
      }
      setStatus(enabled);
      return enabled;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** The chat service itself said no (503 `MESSAGING_DISABLED`, refused handshake, drop event). */
export function markMessagingDisabled() {
  lookedUp = true;
  setStatus(false);
}

/** True for the chat service's switched-off answer (REST body or socket error data). */
export function isMessagingDisabledResponse(body) {
  return !!body && (body.code === "MESSAGING_DISABLED" || body.data?.code === "MESSAGING_DISABLED");
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const snapshot = () => (status !== "unknown" ? status : lookedUp ? "unreadable" : "pending");

/** 'on' | 'off' | 'pending' | 'unreadable'; starts the (shared, cached) lookup. */
export function useMessagingStatus() {
  const s = useSyncExternalStore(subscribe, snapshot, () => "pending");
  useEffect(() => {
    ensureMessagingConfig();
  }, []);
  return s;
}

/** For show/hide only: false only when messaging is known to be off. */
export function useMessagingEnabled() {
  return useMessagingStatus() !== "off";
}
