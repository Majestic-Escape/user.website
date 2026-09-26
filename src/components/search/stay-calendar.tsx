"use client";

// Check-in / check-out picker (Airbnb-style): the first tap is check-in, the
// next later day check-out; tapping again after a full range starts a new
// one. Past days are disabled, today is not (a same-day booking). Round day
// buttons with a continuous band across the nights in between.
import * as React from "react";
import { addMonths, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { isPastDay, nextRange, type RangeFocus, type StayRange } from "@/lib/search/search-state";

export type { StayRange, RangeFocus } from "@/lib/search/search-state";
export { nextRange, nightsLabel } from "@/lib/search/search-state";

type Props = {
  range: StayRange;
  onChange: (range: StayRange) => void;
  focus?: RangeFocus;
  months?: 1 | 2;
  className?: string;
};

export default function StayCalendar({ range, onChange, focus = "from", months = 2, className }: Props) {
  const today = React.useMemo(() => startOfToday(), []);
  const band = !!(range.from && range.to);
  return (
    <Calendar
      mode="range"
      selected={{ from: range.from, to: range.to }}
      onDayClick={(day, modifiers) => {
        if (modifiers.disabled) return;
        onChange(nextRange(range, day, focus));
      }}
      numberOfMonths={months}
      showOutsideDays={false}
      defaultMonth={range.from ?? today}
      fromMonth={today}
      toMonth={addMonths(today, 18)}
      disabled={isPastDay}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col gap-6 sm:flex-row sm:gap-8",
        month: "w-full space-y-3",
        caption: "relative flex h-10 items-center justify-center",
        caption_label: "text-base font-semibold text-absoluteDark",
        nav: "flex items-center",
        nav_button:
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen disabled:pointer-events-none disabled:opacity-30",
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "h-8 flex-1 text-center text-xs font-medium leading-8 text-stone",
        row: "mt-0.5 flex w-full",
        cell: cn(
          "relative flex flex-1 justify-center p-0 text-center",
          band &&
            "[&:has(>.day-range-middle)]:bg-gray-100 [&:has(>.day-range-start)]:bg-[linear-gradient(90deg,transparent_50%,#f3f4f6_50%)] [&:has(>.day-range-end)]:bg-[linear-gradient(270deg,transparent_50%,#f3f4f6_50%)]",
        ),
        day: "h-10 w-10 rounded-full text-sm font-medium text-absoluteDark transition-shadow duration-150 hover:ring-1 hover:ring-inset hover:ring-absoluteDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
        day_selected: "bg-absoluteDark text-white hover:bg-absoluteDark hover:text-white focus-visible:ring-offset-2",
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_range_middle: "day-range-middle !bg-transparent !text-absoluteDark",
        day_today: "underline decoration-2 underline-offset-4",
        day_outside: "invisible",
        day_disabled: "cursor-not-allowed !text-gray-300 line-through hover:ring-0",
        day_hidden: "invisible",
      }}
    />
  );
}
