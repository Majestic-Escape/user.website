"use client";

/**
 * The quote block at the top of a bubble that replies to another message.
 * Rendered as text only (never HTML). Tapping it jumps to the original.
 */
export default function QuotedMessage({ replyTo, own, authorLabel, onJump }) {
  if (!replyTo?.messageId) return null;
  const text = replyTo.text || "[Attachment]";
  return (
    <button
      type="button"
      onClick={() => onJump?.(replyTo.messageId)}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={`Go to quoted message from ${authorLabel}`}
      className={`mb-1.5 block w-full min-w-[9rem] rounded-lg border-l-[3px] px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 ${
        own
          ? "border-lightGreen bg-white/15 focus-visible:ring-lightGreen"
          : "border-primaryGreen bg-gray-50 focus-visible:ring-primaryGreen"
      }`}
    >
      <span className={`block text-[11px] font-semibold leading-4 ${own ? "text-lightGreen" : "text-primaryGreen"}`}>
        {authorLabel}
      </span>
      <span className={`line-clamp-2 block break-words text-xs leading-4 ${own ? "text-white/85" : "text-gray-600"}`}>
        {text}
      </span>
    </button>
  );
}
