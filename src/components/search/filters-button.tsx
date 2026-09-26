"use client";

// "Filters" next to the results heading (tablet / desktop — phones have the
// sliders button in their header). Shows how many filters are on.
import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveFilterCount } from "@/components/search/filter-panel";
import { cn } from "@/lib/utils";

export default function FiltersButton({ className }: { className?: string }) {
  const { setModalFilter, setActiveTab } = useAuth();
  const count = useActiveFilterCount();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        setActiveTab("filters");
        setModalFilter(true);
      }}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-white px-4 text-sm font-medium text-absoluteDark transition-[border-color,box-shadow,transform] duration-150",
        "hover:border-absoluteDark active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2 motion-reduce:active:scale-100",
        count ? "border-absoluteDark ring-1 ring-absoluteDark" : "border-gray-300",
        className,
      )}
    >
      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
      Filters
      {count ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-absoluteDark px-1.5 text-[11px] font-semibold leading-none text-white">
          <span className="sr-only">(</span>
          {count}
          <span className="sr-only"> on)</span>
        </span>
      ) : null}
    </button>
  );
}
