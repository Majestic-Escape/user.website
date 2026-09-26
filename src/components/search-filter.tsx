"use client";

// Desktop / tablet search pill: Where · Check in · Check out · Who · Search.
//
// Airbnb-style: every segment is a pill inside the pill. Hover tints it, the
// open one turns into a raised white pill while the rest of the bar greys out,
// dividers next to a hovered/open segment fade, and one panel is open at a
// time. The flow walks forward on its own — pick a place → dates open, pick
// check-out → guests open — and the Search button grows a label while a panel
// is open. On /filter the fields show the search the results came from.
import * as React from "react";
import { format } from "date-fns";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LocationCombobox from "@/components/search/location-combobox";
import DestinationSheet, { useCoarsePointer } from "@/components/search/destination-sheet";
import GuestCounter from "@/components/search/guest-counter";
import StayCalendar, { nightsLabel, type RangeFocus, type StayRange } from "@/components/search/stay-calendar";
import { buildFilterUrl } from "@/lib/search/search-url";
import { capacityGuests, guestSummary, NO_GUESTS, sanitizeGuests, searchFromParams, type Guests, type UrlSearch } from "@/lib/search/search-state";
import { leaveLayersThen } from "@/lib/ui/layers";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  isScrolled: boolean;
  fromDate?: string;
  toDate?: string;
  location?: string;
  guest?: string;
  active?: boolean;
  grownup?: string;
  child?: string;
  baby?: string;
  property?: string;
  propertyType?: string;
}

type Panel = "where" | "dates" | "who" | null;

const safeParseDate = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
};

// Never taller than the room left on screen (a landscape phone or a short
// window): the panel scrolls inside itself instead of running off the page.
const POPOVER =
  "max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain rounded-3xl border-0 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.16)] ring-1 ring-black/5 font-poppins motion-reduce:animate-none";

/** Seeds the pill from a /filter URL (useSearchParams needs its own Suspense). */
function UrlSearchSync({ onSearch }: { onSearch: (s: UrlSearch) => void }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const key = params.toString();
  const onSearchRef = React.useRef(onSearch);
  onSearchRef.current = onSearch;
  React.useEffect(() => {
    if (pathname.startsWith("/filter")) onSearchRef.current(searchFromParams(new URLSearchParams(key)));
  }, [pathname, key]);
  return null;
}

type SegId = "where" | "in" | "out" | "who";

function Segment({
  id,
  active,
  onHover,
  className,
  children,
}: {
  id: SegId;
  active: boolean;
  onHover: (id: SegId | null) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-active={active}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(id)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
      className={cn(
        "relative flex h-full min-w-0 items-center rounded-full transition-[background-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
        active
          ? "bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
          : "hover:bg-gray-100 group-data-[open=true]/bar:hover:bg-gray-200/80",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Thin rule between two segments; it fades when either neighbour is lit. */
function Divider({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-8 w-px shrink-0 bg-gray-200 transition-opacity duration-200", hidden && "opacity-0")}
    />
  );
}

function ClearButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClear}
      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-graphite transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark animate-in fade-in-0 zoom-in-75 duration-150 motion-reduce:animate-none"
    >
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

export default function SearchFilter({ isScrolled, fromDate, toDate, location, active, grownup, child, baby }: SearchFilterProps) {
  const {
    priceRange,
    rooms,
    addAmenities,
    setResetClicked,
    addPlaceType,
    addPropertyType,
    bookingType,
    petAllowed,
    checkinType,
  } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const coarse = useCoarsePointer(); // touch tablets get the full-screen sheet, not a popover

  const [searchTerm, setSearchTerm] = React.useState(active ? location || "" : "");
  // A picked suggestion (authoritative for the server) or "near me" (~1 km).
  const [placeId, setPlaceId] = React.useState<string | null>(null);
  const [near, setNear] = React.useState<{ lat: number; lng: number } | null>(null);
  const [dateRange, setDateRange] = React.useState<StayRange>({
    from: active ? safeParseDate(fromDate) : undefined,
    to: active ? safeParseDate(toDate) : undefined,
  });
  const [guests, setGuests] = React.useState<Guests>(
    active ? sanitizeGuests({ adults: grownup, children: child, infants: baby }) : NO_GUESTS,
  );
  const [panel, setPanel] = React.useState<Panel>(null);
  const [dateFocus, setDateFocus] = React.useState<RangeFocus>("from");
  const [hovered, setHovered] = React.useState<SegId | null>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<Panel>(null);
  panelRef.current = panel;

  // Home starts a fresh search; elsewhere the last one is restored (tab-scoped).
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    if (pathname === "/") {
      sessionStorage.setItem(
        "searchFilters",
        JSON.stringify({ dateRange: { from: null, to: null }, searchTerm: "", placeId: null, near: null, guests: NO_GUESTS }),
      );
    } else if (!pathname.startsWith("/filter")) {
      // /filter is seeded from its URL instead (UrlSearchSync)
      try {
        const saved = JSON.parse(sessionStorage.getItem("searchFilters") || "null");
        if (saved) {
          setDateRange({
            from: saved.dateRange?.from ? safeParseDate(saved.dateRange.from) : undefined,
            to: saved.dateRange?.to ? safeParseDate(saved.dateRange.to) : undefined,
          });
          if (typeof saved.searchTerm === "string") setSearchTerm(saved.searchTerm);
          setPlaceId(typeof saved.placeId === "string" ? saved.placeId : null);
          setNear(saved.near && Number.isFinite(saved.near.lat) && Number.isFinite(saved.near.lng) ? saved.near : null);
          if (saved.guests) setGuests(sanitizeGuests(saved.guests));
        }
      } catch {
        // unreadable / blocked storage: start empty
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        "searchFilters",
        JSON.stringify({
          dateRange: { from: dateRange.from ? dateRange.from.toISOString() : null, to: dateRange.to ? dateRange.to.toISOString() : null },
          searchTerm,
          placeId,
          near,
          guests,
        }),
      );
    } catch {
      // storage full / blocked: the search still works, it just isn't remembered
    }
  }, [dateRange, searchTerm, placeId, near, guests, hydrated]);

  const applyUrlSearch = React.useCallback((s: UrlSearch) => {
    setSearchTerm(s.searchTerm);
    setPlaceId(s.placeId);
    setNear(s.near);
    setDateRange({ from: s.from, to: s.to });
    setGuests(s.guests);
  }, []);

  const open = (p: Panel, focus: RangeFocus = "from") => {
    setDateFocus(focus);
    setPanel(p);
  };
  // A controlled popover reports "closed"; only clear the panel if it is still ours.
  const closeIf = (p: Panel) => (o: boolean) => {
    if (o) setPanel(p);
    else setPanel((cur) => (cur === p ? null : cur));
  };
  // Clicking another segment switches panels without closing the bar first.
  const stayOpenInsideBar = (e: { target: EventTarget | null; preventDefault: () => void }) => {
    if (e.target instanceof Node && barRef.current?.contains(e.target)) e.preventDefault();
  };
  // Don't pull focus back to the old segment when another panel is opening.
  const focusBackUnlessSwitching = (e: Event) => {
    if (panelRef.current !== null) e.preventDefault();
  };

  const submit = () => {
    setPanel(null);
    setResetClicked(false);
    const url = buildFilterUrl({
      location: near ? "" : searchTerm,
      placeId: near ? null : placeId,
      near,
      from: dateRange.from,
      to: dateRange.to,
      totalGuests: capacityGuests(guests),
      adults: guests.adults,
      children: guests.children,
      infants: guests.infants,
      propertyType: addPropertyType,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      placeType: addPlaceType,
      amenities: addAmenities,
      bedrooms: rooms?.bedrooms,
      beds: rooms?.beds,
      bathrooms: rooms?.bathrooms,
      bookingType,
      checkinType,
      pets: petAllowed,
    });
    leaveLayersThen(() => router.push(url));
  };

  const pickHandlers = {
    value: searchTerm,
    onTextChange: (text: string) => {
      setSearchTerm(text);
      setPlaceId(null);
      setNear(null);
    },
    onPick: (place: { id: string; name: string }) => {
      setSearchTerm(place.name);
      setPlaceId(place.id);
      setNear(null);
      open("dates");
    },
    onNearMe: (point: { lat: number; lng: number }) => {
      setSearchTerm("Nearby");
      setPlaceId(null);
      setNear(point);
      open("dates");
    },
    onSubmitText: submit,
    onPickStay: (stayId: string) => {
      setPanel(null);
      leaveLayersThen(() => router.push(`/stay/${stayId}`));
    },
  };

  const whoText = guestSummary(guests);
  const lit = (id: SegId) =>
    hovered === id ||
    (id === "where" && panel === "where") ||
    (id === "in" && panel === "dates" && dateFocus === "from") ||
    (id === "out" && panel === "dates" && dateFocus === "to") ||
    (id === "who" && panel === "who");
  const barOpen = panel !== null;
  const compact = isScrolled;
  const title = "text-xs font-semibold tracking-wide text-absoluteDark";
  const value = (set: boolean) => cn("truncate text-sm", set ? "text-absoluteDark" : "text-stone");
  const segButton = cn(
    "flex h-full w-full min-w-0 flex-col items-start justify-center rounded-full text-left outline-none",
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-absoluteDark",
    compact ? "px-4" : "px-6",
  );

  return (
    <>
      <React.Suspense fallback={null}>
        <UrlSearchSync onSearch={applyUrlSearch} />
      </React.Suspense>
      <div
        ref={barRef}
        role="search"
        aria-label="Search stays"
        data-open={barOpen}
        className={cn(
          "group/bar relative z-30 mx-auto hidden max-w-full items-center rounded-full border p-1 font-poppins shadow-[0_3px_14px_rgba(0,0,0,0.10)] transition-[background-color,border-color,width,transform] duration-300 ease-out md:flex",
          barOpen ? "border-gray-200 bg-gray-100" : "border-gray-200 bg-white",
          // production's height (62px) in both states; scrolling only narrows it and hides the subtitles
          compact ? "h-[62px] -translate-y-full md:w-[520px]" : "h-[62px] translate-y-0 md:w-[850px] lg:my-4",
        )}
      >
        {/* WHERE */}
        <Popover open={panel === "where" && !coarse} onOpenChange={closeIf("where")}>
          <Segment id="where" active={panel === "where"} onHover={setHovered} className="flex-[1.35]">
            <PopoverTrigger asChild>
              <button
                type="button"
                className={segButton}
                aria-haspopup="dialog"
                aria-expanded={panel === "where"}
                onClick={(e) => {
                  // a coarse pointer opens the sheet; the popover toggles itself otherwise
                  if (coarse) {
                    e.preventDefault();
                    open("where");
                  }
                }}
              >
                {compact ? (
                  <span className={cn(title, "truncate text-sm")}>{searchTerm || "Anywhere"}</span>
                ) : (
                  <>
                    <span className={title}>Where</span>
                    <span className={cn(value(!!searchTerm), "max-w-full pr-6")}>{searchTerm || "Search destinations"}</span>
                  </>
                )}
              </button>
            </PopoverTrigger>
            {panel === "where" && searchTerm && !compact ? (
              <ClearButton
                label="Clear destination"
                onClear={() => {
                  setSearchTerm("");
                  setPlaceId(null);
                  setNear(null);
                }}
              />
            ) : null}
          </Segment>
          <PopoverContent
            align="start"
            sideOffset={12}
            className={cn(POPOVER, "w-[400px] overflow-hidden p-0")}
            onInteractOutside={stayOpenInsideBar}
            onCloseAutoFocus={focusBackUnlessSwitching}
          >
            <LocationCombobox {...pickHandlers} />
          </PopoverContent>
        </Popover>
        <DestinationSheet open={panel === "where" && coarse} onClose={() => setPanel(null)}>
          <LocationCombobox variant="sheet" {...pickHandlers} />
        </DestinationSheet>

        <Divider hidden={lit("where") || lit("in")} />

        {/* CHECK IN · CHECK OUT (one calendar) */}
        <Popover open={panel === "dates"} onOpenChange={closeIf("dates")}>
          <PopoverAnchor asChild>
            <div className="flex h-full min-w-0 flex-[1.6] items-center">
              <Segment id="in" active={panel === "dates" && dateFocus === "from"} onHover={setHovered} className="flex-1">
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={segButton}
                    aria-haspopup="dialog"
                    aria-expanded={panel === "dates"}
                    onClick={(e) => {
                      e.preventDefault();
                      if (panel === "dates" && dateFocus === "from") setPanel(null);
                      else open("dates", "from");
                    }}
                  >
                    <span className={title}>{compact && dateRange.from ? format(dateRange.from, "d MMM") : "Check in"}</span>
                    {!compact ? <span className={value(!!dateRange.from)}>{dateRange.from ? format(dateRange.from, "d MMM") : "Add dates"}</span> : null}
                  </button>
                </PopoverTrigger>
              </Segment>
              <Divider hidden={lit("in") || lit("out")} />
              <Segment id="out" active={panel === "dates" && dateFocus === "to"} onHover={setHovered} className="flex-1">
                <button
                  type="button"
                  className={segButton}
                  aria-haspopup="dialog"
                  aria-expanded={panel === "dates"}
                  onClick={() => {
                    if (panel === "dates" && dateFocus === "to") setPanel(null);
                    else open("dates", dateRange.from ? "to" : "from");
                  }}
                >
                  <span className={title}>{compact && dateRange.to ? format(dateRange.to, "d MMM") : "Check out"}</span>
                  {!compact ? <span className={value(!!dateRange.to)}>{dateRange.to ? format(dateRange.to, "d MMM") : "Add dates"}</span> : null}
                </button>
                {panel === "dates" && dateRange.from && !compact ? (
                  <ClearButton label="Clear dates" onClear={() => { setDateRange({ from: undefined, to: undefined }); setDateFocus("from"); }} />
                ) : null}
              </Segment>
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="center"
            sideOffset={12}
            className={cn(POPOVER, "w-auto p-6")}
            onInteractOutside={stayOpenInsideBar}
            onCloseAutoFocus={focusBackUnlessSwitching}
          >
            <StayCalendar
              range={dateRange}
              focus={dateFocus}
              months={2}
              className="w-[616px] max-w-[calc(100vw-5rem)]"
              onChange={(r) => {
                setDateRange(r);
                if (r.from && r.to) open("who");
                else setDateFocus(r.from ? "to" : "from");
              }}
            />
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <p className="text-sm text-graphite" aria-live="polite">{nightsLabel(dateRange)}</p>
              <button
                type="button"
                disabled={!dateRange.from}
                onClick={() => {
                  setDateRange({ from: undefined, to: undefined });
                  setDateFocus("from");
                }}
                className="rounded-full px-3 py-2 text-sm font-semibold text-absoluteDark underline underline-offset-4 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Clear dates
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Divider hidden={lit("out") || lit("who")} />

        {/* WHO + SEARCH */}
        <Popover open={panel === "who"} onOpenChange={closeIf("who")}>
          <Segment id="who" active={panel === "who"} onHover={setHovered} className="flex-[1.35]">
            <PopoverTrigger asChild>
              <button type="button" className={cn(segButton, compact ? "pr-16" : "pr-[4.5rem]")} aria-haspopup="dialog" aria-expanded={panel === "who"}>
                <span className={title}>{compact ? whoText || "Guests" : "Who"}</span>
                {!compact ? <span className={value(!!whoText)}>{whoText || "Add guests"}</span> : null}
              </button>
            </PopoverTrigger>
            <button
              type="button"
              onClick={submit}
              aria-label="Search"
              className={cn(
                "absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-primaryGreen font-semibold text-white shadow-sm",
                "transition-[background-color,padding,transform] duration-200 ease-out hover:bg-brightGreen active:scale-95 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2",
                "h-12 min-w-12 px-3",
              )}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span
                aria-hidden="true"
                className={cn(
                  "overflow-hidden whitespace-nowrap text-sm transition-[max-width,opacity,margin] duration-200 ease-out motion-reduce:transition-none",
                  barOpen && !compact ? "ml-2 max-w-[4.5rem] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                Search
              </span>
            </button>
          </Segment>
          <PopoverContent
            align="end"
            sideOffset={12}
            className={cn(POPOVER, "w-[380px] p-6")}
            onInteractOutside={stayOpenInsideBar}
            onCloseAutoFocus={focusBackUnlessSwitching}
          >
            <GuestCounter guests={guests} onChange={setGuests} />
            {whoText ? (
              <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setGuests(NO_GUESTS)}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-absoluteDark underline underline-offset-4 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
