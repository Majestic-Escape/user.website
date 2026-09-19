"use client";

import { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { holdThreadPosition } from "@/lib/chat/threadPosition";

/**
 * Mobile-optimized chat input component.
 * Uses native input and prevents focus loss on send.
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
      <div className="flex items-center gap-2 w-full">
        <input
          ref={setInputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={disabled}
          className="flex-1 min-w-0 h-10 px-4 bg-gray-100 rounded-full text-base outline-none focus:ring-2 focus:ring-primaryGreen disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          enterKeyHint="send"
          inputMode="text"
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
