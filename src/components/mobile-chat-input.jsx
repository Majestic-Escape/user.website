"use client";

import { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

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
  isSending = false,
  placeholder = "Type a message...",
  className = "",
  autoFocus = false,
}) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

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

  // Scroll chat to bottom when input is focused (keyboard opens)
  const handleFocus = useCallback(() => {
    const scrollToBottom = () => {
      const chatContainer = document.querySelector('[data-chat-messages="true"]');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };
    
    // Scroll immediately and after multiple delays for keyboard animation
    scrollToBottom();
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 150);
    setTimeout(scrollToBottom, 200);
    setTimeout(scrollToBottom, 300);
    setTimeout(scrollToBottom, 400);
    setTimeout(scrollToBottom, 500);
  }, []);

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled && !isSending) {
      onSend();
    }
  }, [value, disabled, isSending, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    onKeyDown?.(e);
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
      <div className="flex items-center gap-2 w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
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
          disabled={!value.trim() || disabled || isSending}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
