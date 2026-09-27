// Chat composers are single-line: a message never contains a line break, as
// with the <input type="text"> they used to be. The field is a <textarea>
// (see components/chat/ChatComposerField) so a paste, drop or keyboard commit
// can still carry breaks in; they become one space each run.

const LINE_BREAKS = /[\r\n\u2028\u2029]+/g;

export const hasLineBreak = (text) => /[\r\n\u2028\u2029]/.test(text);

/**
 * Replace every run of line breaks with one space and map the caret so it
 * stays after the same character. Never makes the text longer, so a
 * maxLength that held before still holds.
 */
export function flattenLineBreaks(text, caret = text.length) {
  const at = Math.max(0, Math.min(caret, text.length));
  // The flattened prefix is a prefix of the flattened whole, even when the
  // caret sits inside a run of breaks (the run still becomes a single space).
  const flat = text.replace(LINE_BREAKS, " ");
  return { text: flat, caret: text.slice(0, at).replace(LINE_BREAKS, " ").length };
}
