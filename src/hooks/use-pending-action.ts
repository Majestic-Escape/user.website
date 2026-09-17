"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readStoredToken } from "@/lib/session";
import { takePendingAction } from "@/lib/auth-return";

// Replays an action the visitor started before being sent to /login (see
// lib/auth-return.ts), once, on the page it belongs to, only when a session
// exists. `ready` lets a page wait for the data the action needs.
export function usePendingAction(name: string, handler: (payload: unknown) => void, ready = true) {
  const pathname = usePathname();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const fired = useRef(false);
  useEffect(() => {
    if (!ready || fired.current) return;
    if (!readStoredToken()) return;
    const pending = takePendingAction(name, pathname);
    if (!pending) return;
    fired.current = true;
    handlerRef.current(pending.payload);
  }, [name, pathname, ready]);
}
