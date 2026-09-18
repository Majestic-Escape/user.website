"use client";

import { useEffect, useRef, useState } from "react";
import { socketManager } from "@/lib/socket";

const INITIAL_GRACE_MS = 8000;

/**
 * What the chat header should say about the socket — and, more importantly,
 * when it should say nothing.
 *
 * Returns "none" | "connecting" | "reconnecting" | "offline" | "error".
 *
 * The socket manager is a singleton that outlives page navigation, so a page
 * mounting on an already-connected socket must not flash "Connecting". The
 * initial handshake after a cold load is also silent: it takes well under a
 * second and a badge for it is noise. Only a connection that was established
 * and then lost shows "Reconnecting…"/"Offline"/"Error" — and a first connect
 * that is genuinely stuck surfaces after INITIAL_GRACE_MS.
 */
export function useConnectionBadge() {
  const [badge, setBadge] = useState("none");
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    let graceTimer = null;
    const clearGrace = () => {
      if (graceTimer) {
        clearTimeout(graceTimer);
        graceTimer = null;
      }
    };

    const unsubscribe = socketManager.onConnectionChange((state) => {
      if (state === "connected") {
        hasConnectedRef.current = true;
        clearGrace();
        setBadge("none");
        return;
      }
      if (state === "error") {
        clearGrace();
        setBadge("error");
        return;
      }
      if (state === "disconnected") {
        // Before the first connection the manager idles in "disconnected";
        // that is not an outage, so stay silent until it actually tries.
        clearGrace();
        setBadge(hasConnectedRef.current ? "offline" : "none");
        return;
      }
      // "connecting"
      if (hasConnectedRef.current) {
        setBadge("reconnecting");
        return;
      }
      setBadge("none");
      clearGrace();
      graceTimer = setTimeout(() => {
        graceTimer = null;
        if (!hasConnectedRef.current) setBadge("connecting");
      }, INITIAL_GRACE_MS);
    });

    return () => {
      clearGrace();
      unsubscribe();
    };
  }, []);

  return badge;
}
