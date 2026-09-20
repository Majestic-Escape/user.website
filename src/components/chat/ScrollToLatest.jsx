"use client";

import { ChevronDown } from "lucide-react";

/**
 * Floating "jump to the latest message" control for a thread the reader has
 * scrolled up in. A message that arrives while the reader is up in the
 * thread no longer drags the thread to the bottom (WhatsApp behaviour); this
 * is the way down, and it says so when something new is waiting.
 */
export default function ScrollToLatest({ visible, hasNew, onClick }) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={hasNew ? "New messages — scroll to the latest" : "Scroll to the latest messages"}
      data-scroll-to-latest={hasNew ? "new" : "idle"}
      className={`absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full border shadow-lg transition-all ${
        hasNew
          ? "bg-primaryGreen text-white border-primaryGreen pl-3 pr-2 py-1.5 text-xs font-medium"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 p-2"
      }`}
    >
      {hasNew && <span>New messages</span>}
      <ChevronDown className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
