"use client";

import { Reply, X } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/reply";

const COUNTER_FROM = MAX_MESSAGE_LENGTH - 200;

/**
 * Strip above the composer: "Replying to {name}" + snippet, with ✕ to cancel.
 * Only the description is a live region; the cancel button sits outside it so
 * screen readers announce the reply once, not the control.
 *
 * Also hosts the character counter, shown only near the limit.
 */
export default function ReplyPreviewBar({ replyTo, authorLabel, onCancel, length = 0 }) {
  const showCounter = length >= COUNTER_FROM;
  if (!replyTo && !showCounter) return null;
  const cancel = (e) => {
    e.preventDefault();
    onCancel?.();
  };
  return (
    <div className="mb-2 flex items-center gap-2">
      {replyTo ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border-l-[3px] border-primaryGreen bg-gray-50 px-3 py-1.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-150">
          <Reply className="h-4 w-4 shrink-0 text-primaryGreen" aria-hidden="true" />
          <div role="status" aria-live="polite" className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold leading-4 text-primaryGreen">Replying to {authorLabel}</p>
            <p className="line-clamp-1 break-words text-xs leading-4 text-gray-600">{replyTo.text || "[Attachment]"}</p>
          </div>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={onCancel}
            onMouseDown={(e) => e.preventDefault()}
            onTouchEnd={cancel}
            className="-mr-1 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {showCounter && (
        <span
          className={`shrink-0 text-[11px] tabular-nums ${length >= MAX_MESSAGE_LENGTH ? "text-red-600" : "text-gray-400"}`}
          aria-live="polite"
        >
          {length}/{MAX_MESSAGE_LENGTH}
        </span>
      )}
    </div>
  );
}
