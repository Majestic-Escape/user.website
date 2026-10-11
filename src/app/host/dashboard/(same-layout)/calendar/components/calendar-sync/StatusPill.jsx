import { TONES } from "./status";

// Colour is never the only signal: every pill carries its text label.
export function StatusPill({ tone = "neutral", label }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    // One line, never wrapped inside the pill; the row around it wraps instead.
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-200 motion-reduce:transition-none ${t.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
