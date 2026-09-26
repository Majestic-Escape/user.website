"use client";

// Unread / count bubble for icons in menus. The number is decoration: the
// parent control carries it in its accessible name ("Messages, 3 unread"),
// so the bubble itself is hidden from screen readers. red-600 on white text
// keeps 4.8:1 contrast (red-500 was 3.8:1).
import * as React from "react";
import { cn } from "@/lib/utils";

export function countLabel(count: number, max = 9): string {
  return count > max ? `${max}+` : String(count);
}

export default function CountBadge({ count, max = 9, className }: { count: number; max?: number; className?: string }) {
  if (!count || count < 1) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white",
        "animate-in zoom-in-50 duration-200 motion-reduce:animate-none",
        className,
      )}
    >
      {countLabel(count, max)}
    </span>
  );
}
