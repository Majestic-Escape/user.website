"use client";

import { RotateCw, Trash2 } from "lucide-react";

/**
 * Under an own bubble whose delivery could not be confirmed (no ack, timeout,
 * server error). Never says "failed": the server may well have stored it, and
 * Retry re-sends under the same clientMessageId, which the server treats as
 * the same message. Discard is the only way to give it up — it stops retrying
 * and drops the local copy; a frame the network already holds can still reach
 * the server later, in which case the message simply shows up as delivered.
 */
export default function SendStatus({ message, onRetry, onDiscard }) {
  if (message?.status !== "unconfirmed") return null;
  const cid = message.clientMessageId || message.id;
  return (
    <div className="mt-0.5 mr-1 flex items-center gap-1 text-[11px] text-amber-700">
      <span role="status">Couldn&apos;t confirm delivery</span>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => onRetry?.(cid)}
        aria-label="Retry sending message"
        className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 font-medium text-primaryGreen hover:bg-lightGreen/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
      >
        <RotateCw className="h-3 w-3" aria-hidden="true" />
        Retry
      </button>
      <button
        type="button"
        onClick={() => {
          if (
            typeof window === "undefined" ||
            window.confirm("Stop trying to send this message? If it was already delivered, it will still show in the conversation.")
          )
            onDiscard?.(cid);
        }}
        aria-label="Discard unsent message"
        className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
      >
        <Trash2 className="h-3 w-3" aria-hidden="true" />
        Discard
      </button>
    </div>
  );
}
