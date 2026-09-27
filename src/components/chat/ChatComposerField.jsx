"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { flattenLineBreaks, hasLineBreak } from "@/lib/chat/composer";

// The desktop composers' look: ui/input's field with the chat pill on top.
// A line as tall as the field centres the text the way an <input> does
// (pixel-identical in A/B screenshots); md:leading-9 because md:text-sm
// brings its own line height.
export const DESKTOP_COMPOSER_CLASS =
  "flex-1 min-w-0 h-9 w-full px-3 py-0 text-base md:text-sm leading-9 md:leading-9 bg-gray-100 border-none rounded-full shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

// Insert as one edit — on the undo stack where the browser allows it — and
// within maxLength, which setRangeText alone wouldn't enforce.
function insertText(el, text) {
  if (document.activeElement !== el) el.focus({ preventScroll: true });
  if (document.activeElement === el && document.execCommand("insertText", false, text)) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const room = el.maxLength >= 0 ? el.maxLength - (el.value.length - (end - start)) : text.length;
  el.setRangeText(text.slice(0, Math.max(0, room)), start, end, "end");
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * The message field of a chat composer: one line, Enter sends — a drop-in for
 * the <input type="text"> the composers used to render.
 *
 * Why a <textarea>: Chrome on Android shows its autofill bar (passwords, cards,
 * addresses) above the keyboard for every text <input>, autocomplete="off" or
 * not, and never for a textarea. A chat message is never autofill data.
 *
 * It stays single-line, so what is sent is exactly what the input sent:
 *   - Enter never inserts a break; the caller's onKeyDown still decides
 *     whether Enter sends. Shift+Enter does nothing, as in an input.
 *   - A keyboard that commits "\n" instead of pressing Enter gets the same
 *     Enter, so its send key keeps working.
 *   - Pasted, dropped or committed breaks become spaces (lib/chat/composer).
 * Enter that confirms an IME composition (Japanese, Chinese, Korean…) only
 * confirms it: it never reaches onKeyDown, so half a word is never sent.
 */
const ChatComposerField = forwardRef(function ChatComposerField(
  { className, onChange, onKeyDown, ...props },
  ref
) {
  const fieldRef = useRef(null);
  const setRef = useCallback(
    (el) => {
      fieldRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && e.nativeEvent.isComposing) return;
      onKeyDown?.(e);
      if (e.key === "Enter") e.preventDefault();
    },
    [onKeyDown]
  );

  // Edits (beforeinput events) in the current task. WebKit applies a
  // multi-line paste or keyboard commit piece by piece — text, break, text —
  // all in one task, and the field must not be touched until it is done.
  const editsRef = useRef(0);

  const handleChange = useCallback(
    (e) => {
      const el = e.currentTarget;
      // mid-way through a multi-part insert the effect flattens at task end
      if (editsRef.current <= 1 && hasLineBreak(el.value)) {
        const { text, caret } = flattenLineBreaks(el.value, el.selectionStart ?? el.value.length);
        el.value = text;
        el.setSelectionRange(caret, caret);
      }
      onChange?.(e);
    },
    [onChange]
  );

  // Line breaks never get in:
  //   - text arriving with breaks as one edit (paste, drop, a keyboard
  //     committing several lines) is cancelled and inserted again flattened;
  //   - a break that is the only edit of its task is a keyboard committing
  //     "\n" instead of pressing Enter (some Android keyboards): it is
  //     replayed as Enter once the task is over, so the send key keeps
  //     working and reads the final text;
  //   - a break among other edits of its task is a piece of a multi-part
  //     insert: it is dropped, and becomes a space once the task is over,
  //     when anything else that slipped in is flattened too. A text piece is
  //     never cancelled — WebKit would carry on from the wrong place.
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return undefined;
    let breaks = []; // caret offsets of the breaks dropped in this task
    const endOfTask = () => {
      const lone = breaks.length === 1 && editsRef.current === 1;
      const at = breaks.sort((a, b) => b - a);
      editsRef.current = 0;
      breaks = [];
      if (lone) {
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
        return;
      }
      let changed = false;
      for (const i of at) {
        const v = el.value;
        const full = el.maxLength >= 0 && v.length >= el.maxLength;
        if (full || !v[i - 1]?.trim() || !v[i]?.trim()) continue; // edges and existing spaces stay as they are
        el.setRangeText(" ", i, i, "preserve");
        changed = true;
      }
      if (hasLineBreak(el.value)) {
        const { text, caret } = flattenLineBreaks(el.value, el.selectionStart ?? el.value.length);
        el.setRangeText(text, 0, el.value.length, "end"); // not el.value =: React must see the change
        el.setSelectionRange(caret, caret);
        changed = true;
      }
      if (changed) el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const onBeforeInput = (e) => {
      const first = editsRef.current++ === 0;
      if (first) setTimeout(endOfTask, 0);
      const text = e.data ?? e.dataTransfer?.getData("text/plain") ?? "";
      // a keyboard committing "\n" as text (never a paste or drop of one)
      const onlyBreaks = e.inputType === "insertText" && hasLineBreak(text) && flattenLineBreaks(text).text === " ";
      if (e.inputType === "insertLineBreak" || e.inputType === "insertParagraph" || onlyBreaks) {
        e.preventDefault();
        if (!e.isComposing) breaks.push(el.selectionStart ?? el.value.length);
        return;
      }
      if (!first || !e.cancelable || !hasLineBreak(text)) return;
      e.preventDefault();
      const flat = flattenLineBreaks(text).text;
      queueMicrotask(() => insertText(el, flat));
    };
    el.addEventListener("beforeinput", onBeforeInput);
    return () => el.removeEventListener("beforeinput", onBeforeInput);
  }, []);

  return (
    <textarea
      ref={setRef}
      rows={1}
      wrap="off"
      autoComplete="off"
      autoCorrect="on"
      autoCapitalize="sentences"
      enterKeyHint="send"
      inputMode="text"
      aria-multiline={false}
      {...props}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn("block resize-none overflow-x-auto overflow-y-hidden whitespace-pre no-scrollbar", className)}
    />
  );
});

export default ChatComposerField;
