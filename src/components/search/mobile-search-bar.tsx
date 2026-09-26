"use client";

// Phone header search: the pill opens the search sheet, the round button the
// filters. On /filter the pill shows the search being viewed
// ("Goa · 3–5 Oct · 2 guests") instead of a generic prompt.
import * as React from "react";
import { format } from "date-fns";
import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveFilterCount } from "@/components/search/filter-panel";
import { guestSummary, searchFromParams } from "@/lib/search/search-state";
import { cn } from "@/lib/utils";

function Prompt() {
  return <span className="truncate text-sm font-normal text-absoluteDark">Start your search</span>;
}

function CurrentSearch() {
  const params = useSearchParams();
  const pathname = usePathname();
  if (!pathname.startsWith("/filter")) return <Prompt />;
  const s = searchFromParams(new URLSearchParams(params.toString()));
  const when = s.from && s.to ? `${format(s.from, "d MMM")} – ${format(s.to, "d MMM")}` : "Any week";
  const who = guestSummary(s.guests) || "Add guests";
  return (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="truncate text-sm font-semibold text-absoluteDark">{s.searchTerm || "Anywhere"}</span>
      <span className="truncate text-xs text-stone">
        {when} · {who}
      </span>
    </span>
  );
}

export default function MobileSearchBar() {
  const { setModalFilter, setActiveTab } = useAuth();
  const count = useActiveFilterCount();
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setActiveTab("search");
          setModalFilter(true);
        }}
        className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 text-left shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen motion-reduce:active:scale-100"
      >
        <Search className="h-4 w-4 shrink-0 text-absoluteDark" aria-hidden="true" />
        <React.Suspense fallback={<Prompt />}>
          <CurrentSearch />
        </React.Suspense>
      </button>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={count ? `Filters, ${count} on` : "Filters"}
        onClick={() => {
          setActiveTab("filters");
          setModalFilter(true);
        }}
        className="group relative flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
      >
        {/* same 38 px circle as before; the button around it is the 44 px target */}
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border bg-white text-absoluteDark transition-[border-color,transform] duration-150 group-active:scale-95 motion-reduce:group-active:scale-100",
            count ? "border-absoluteDark" : "border-input",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </span>
        {count ? (
          <span aria-hidden="true" className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-absoluteDark px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {count}
          </span>
        ) : null}
      </button>
    </div>
  );
}
