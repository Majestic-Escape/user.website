"use client";

import { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { holdThreadPosition } from "@/lib/chat/threadPosition";
import ChatComposerField from "@/components/chat/ChatComposerField";

/**
 * Mobile-optimized chat input component.
 * Uses a native single-line field and prevents focus loss on send.
 * Prevents scrolling when touching the input area.
 */
export default function MobileChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  canSend = true,
  isSending = false,
  placeholder = "Type a message...",
  className = "",
  autoFocus = false,
  // Optional: rendered above the input row (e.g. the reply preview bar).
  topSlot = null,
  // Optional: lets the page focus the input (reply-to focuses synchronously).
  inputRef: externalRef = null,
  maxLength,
}) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const setInputRef = useCallback(
    (el) => {
      inputRef.current = el;
      if (externalRef) externalRef.current = el;
    },
    [externalRef]
  );

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [autoFocus]);

  // Prevent touch scrolling on the input container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e) => {
      // Prevent touch move from scrolling the page/container
      e.preventDefault();
    };

    // Add passive: false to allow preventDefault
    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // Keyboard opens: stay pinned to the bottom if the reader was there,
  // otherwise keep the thread where it is (a reply to an older message must
  // not scroll it away).
  const handleFocus = useCallback(() => {
    holdThreadPosition(() => document.querySelector('[data-chat-messages="true"]'));
  }, []);

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled && !isSending && canSend) {
      onSend();
    }
  }, [value, disabled, isSending, canSend, onSend]);

  // The page handler runs first; when it consumed the key (Enter → its own
  // send, Escape → cancel reply) we must not send a second time.
  const handleKeyDown = useCallback((e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend, onKeyDown]);

  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  // Prevent focus loss when clicking/touching send button
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  return (
    <div 
      ref={containerRef}
      className={`p-4 border-t bg-white flex-shrink-0 ${className}`} 
      style={{ width: '100%', touchAction: 'none' }}
    >
      {topSlot}
      {/* items-end, not items-center: as the field grows past one line the
          send button stays pinned to its bottom edge (WhatsApp-style), not
          re-centred in the whole grown height. */}
      <div className="flex items-end gap-2 w-full">
        <ChatComposerField
          ref={setInputRef}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={disabled}
          // A fixed 20px radius (not rounded-full) — half of the 40px resting
          // height, so it still reads as a full pill at rest — stays sensible
          // instead of ballooning once the field grows.
          className="flex-1 min-w-0 min-h-10 px-4 py-2 bg-gray-100 rounded-[1.25rem] text-base leading-6 outline-none focus:ring-2 focus:ring-primaryGreen disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          size="icon"
          className="rounded-full bg-primaryGreen hover:bg-brightGreen flex-shrink-0"
          onClick={handleSend}
          onMouseDown={handleMouseDown}
          onTouchEnd={handleTouchEnd}
          disabled={!value.trim() || disabled || isSending || !canSend}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
