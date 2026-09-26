"use client";

// Adults / children / infants steppers, shared by the desktop "Who" popover
// and the phone search sheet (bigger touch targets there).
import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GUEST_ROWS, canDecrease, stepGuests, type GuestKey, type Guests } from "@/lib/search/search-state";

type StepperProps = {
  label: string;
  value: number;
  onChange: (delta: 1 | -1) => void;
  canDecrease: boolean;
  canIncrease?: boolean;
  /** what 0 reads as ("Any" for rooms); numbers otherwise */
  zeroLabel?: string;
  size?: "md" | "lg";
};

export function Stepper({ label, value, onChange, canDecrease: dec, canIncrease = true, zeroLabel, size = "md" }: StepperProps) {
  const btn = cn(
    "flex shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-graphite transition-[transform,border-color,color,opacity] duration-150",
    "[@media(hover:hover)]:hover:border-absoluteDark [@media(hover:hover)]:hover:text-absoluteDark active:scale-90 motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-300 disabled:active:scale-100",
    size === "lg" ? "h-[44px] w-[44px]" : "h-9 w-9",
  );
  const shown = value === 0 && zeroLabel ? zeroLabel : String(value);
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(-1)} disabled={!dec} aria-label={`Fewer ${label.toLowerCase()}`}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className={cn("text-center tabular-nums text-absoluteDark", zeroLabel ? "min-w-[2.5rem]" : "min-w-[1.5rem]", size === "lg" ? "text-base" : "text-sm")} aria-live="polite" aria-atomic="true">
        <span className="sr-only">{label}: </span>
        {shown}
      </span>
      <button type="button" className={btn} onClick={() => onChange(1)} disabled={!canIncrease} aria-label={`More ${label.toLowerCase()}`}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function GuestCounter({ guests, onChange, size = "md" }: { guests: Guests; onChange: (g: Guests) => void; size?: "md" | "lg" }) {
  const step = (key: GuestKey, delta: 1 | -1) => onChange(stepGuests(guests, key, delta));
  return (
    <div className="divide-y divide-gray-200">
      {GUEST_ROWS.map((row) => (
        <div key={row.key} className={cn("flex items-center justify-between gap-4", size === "lg" ? "py-4" : "py-3.5", "first:pt-0 last:pb-0")}>
          <div className="min-w-0">
            <div className="font-medium text-absoluteDark">{row.label}</div>
            <div className="text-sm text-stone">{row.hint}</div>
          </div>
          <Stepper label={row.label} value={guests[row.key]} canDecrease={canDecrease(guests, row.key)} canIncrease={guests[row.key] < 99} onChange={(d) => step(row.key, d)} size={size} />
        </div>
      ))}
    </div>
  );
}
