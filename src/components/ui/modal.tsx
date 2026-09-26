"use client";

// Search + Filters surface.
//
// Phones (< 768 px): a full-screen sheet that slides up — Search | Filters
// tabs, and on Search three cards (Where · When · Who) of which one is open
// at a time, like Airbnb. The calendar and guest counters are inline, so
// nothing floats over the sheet's own buttons; "Where" opens the full-screen
// destination picker that survives the on-screen keyboard. Back closes the
// sheet instead of leaving the page, and the floating chat launcher steps
// aside while it is open.
// Tablets (768–1024 px): the same, as a centred dialog.
// Desktop (≥ 1025 px): the dialog shows Filters only — the search itself is
// the pill in the header.
//
// Filter state lives in AuthContext (shared with the desktop pill); the
// where / when / who of the sheet come from the /filter URL being viewed, or
// else from the last search in this tab.
import * as React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LocationCombobox from "@/components/search/location-combobox";
import DestinationSheet from "@/components/search/destination-sheet";
import GuestCounter from "@/components/search/guest-counter";
import StayCalendar, { nightsLabel, type StayRange } from "@/components/search/stay-calendar";
import FilterPanel, { useActiveFilterCount } from "@/components/search/filter-panel";
import { buildFilterUrl } from "@/lib/search/search-url";
import { capacityGuests, guestSummary, NO_GUESTS, sanitizeGuests, searchFromParams, type Guests } from "@/lib/search/search-state";
import { leaveLayersThen, useBackToClose, useOverlayFlag, usePresence } from "@/lib/ui/layers";
import { cn } from "@/lib/utils";

type Step = "where" | "when" | "who" | null;

function readSavedSearch() {
  if (window.location.pathname.startsWith("/filter")) {
    return searchFromParams(new URLSearchParams(window.location.search));
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem("searchFilters") || "null");
    if (!saved || typeof saved !== "object") return null;
    const d = (v: unknown) => {
      const x = typeof v === "string" ? new Date(v) : undefined;
      return x && !Number.isNaN(x.getTime()) ? x : undefined;
    };
    const near = saved.near && Number.isFinite(saved.near.lat) && Number.isFinite(saved.near.lng) ? saved.near : null;
    return {
      searchTerm: typeof saved.searchTerm === "string" ? saved.searchTerm : "",
      placeId: typeof saved.placeId === "string" ? saved.placeId : null,
      near,
      from: d(saved.dateRange?.from),
      to: d(saved.dateRange?.to),
      guests: sanitizeGuests(saved.guests),
    };
  } catch {
    return null;
  }
}

function useWideScreen(query: string) {
  const [match, setMatch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** Keeps Tab inside the dialog (unless focus is in a layer above it). */
function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const root = ref.current;
      if (e.key !== "Tab" || !root || !root.contains(document.activeElement)) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ref, active]);
}

function StepCard({
  label,
  value,
  title,
  expanded,
  onExpand,
  children,
}: {
  label: string;
  value: string;
  title: string;
  expanded: boolean;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  const id = React.useId();
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 text-left shadow-[0_1px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen motion-reduce:active:scale-100"
      >
        <span className="text-sm text-stone">{label}</span>
        <span className="min-w-0 truncate text-sm font-semibold text-absoluteDark">{value}</span>
      </button>
    );
  }
  return (
    <section
      aria-labelledby={id}
      className="rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5 animate-in fade-in-0 zoom-in-[0.98] duration-200 motion-reduce:animate-none"
    >
      <h3 id={id} className="font-bricolage text-2xl font-semibold text-absoluteDark">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function FilterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    priceRange,
    setResetClicked,
    rooms,
    addAmenities,
    addPlaceType,
    addPropertyType,
    bookingType,
    petAllowed,
    checkinType,
    clearAllFilters,
    activeTab,
    setActiveTab,
  } = useAuth();
  const router = useRouter();
  const filterCount = useActiveFilterCount();
  // below 1025 px there is no header pill, so the sheet also carries the search
  const desktop = useWideScreen("(min-width: 1025px)");
  const tab: "search" | "filters" = !desktop && activeTab === "search" ? "search" : "filters";

  const [searchTerm, setSearchTerm] = React.useState("");
  const [placeId, setPlaceId] = React.useState<string | null>(null);
  const [near, setNear] = React.useState<{ lat: number; lng: number } | null>(null);
  const [dateRange, setDateRange] = React.useState<StayRange>({ from: undefined, to: undefined });
  const [guests, setGuests] = React.useState<Guests>(NO_GUESTS);
  const [step, setStep] = React.useState<Step>("where");
  const [openDestination, setOpenDestination] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const present = usePresence(isOpen, 220);
  useBackToClose(isOpen, onClose);
  useOverlayFlag(isOpen);
  useFocusTrap(dialogRef, isOpen);

  // A reset requested elsewhere (the "Reset filter" chip) applies on next mount.
  React.useEffect(() => {
    if (sessionStorage.getItem("modalFilterReset") == "true") {
      clearAllFilters();
      sessionStorage.setItem("modalFilterReset", "false");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opening: show the search being viewed (or the last one), focus the dialog,
  // freeze the page behind it; closing gives focus and scroll back.
  React.useEffect(() => {
    if (!isOpen) return;
    const s = readSavedSearch();
    const next = {
      searchTerm: s?.searchTerm ?? "",
      placeId: s?.placeId ?? null,
      near: s?.near ?? null,
      from: s?.from,
      to: s?.from ? s?.to : undefined,
      guests: s?.guests ?? NO_GUESTS,
    };
    setSearchTerm(next.searchTerm);
    setPlaceId(next.placeId);
    setNear(next.near);
    setDateRange({ from: next.from, to: next.to });
    setGuests(next.guests);
    setStep(!next.searchTerm ? "where" : !(next.from && next.to) ? "when" : "who");

    const opener = document.activeElement as HTMLElement | null;
    const y = window.scrollY;
    const body = document.body.style;
    const prev = { position: body.position, top: body.top, left: body.left, right: body.right, overflow: body.overflow };
    body.position = "fixed";
    body.top = `-${y}px`;
    body.left = "0";
    body.right = "0";
    body.overflow = "hidden";
    const f = requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(f);
      Object.assign(body, prev);
      window.scrollTo(0, y);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Remember the sheet's search in this tab, like the desktop pill does.
  React.useEffect(() => {
    if (!isOpen) return;
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
      // storage blocked: nothing to remember
    }
  }, [isOpen, searchTerm, placeId, near, dateRange, guests]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !openDestination) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, openDestination, onClose]);

  if (!present) return null;

  const url = () =>
    buildFilterUrl({
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
  // Leave through the sheet's own history entries so Back from the results
  // returns to this page, not to a closed sheet.
  const go = (href: string) => {
    setResetClicked(false);
    leaveLayersThen(() => {
      onClose();
      router.push(href);
    });
  };
  const clearSearch = () => {
    setSearchTerm("");
    setPlaceId(null);
    setNear(null);
    setDateRange({ from: undefined, to: undefined });
    setGuests(NO_GUESTS);
    setStep("where");
  };

  const whenValue =
    dateRange.from && dateRange.to ? `${format(dateRange.from, "d MMM")} – ${format(dateRange.to, "d MMM")}` : dateRange.from ? `${format(dateRange.from, "d MMM")} – ?` : "Any week";
  const hasSearch = !!(searchTerm || dateRange.from || guests.adults || guests.children || guests.infants);
  const closing = !isOpen;

  return (
    <div className={cn("fixed inset-0 z-[1003] flex items-end justify-center md:items-center md:p-6", closing && "pointer-events-none")} role="presentation">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 hidden bg-black/40 md:block motion-reduce:animate-none",
          closing ? "animate-out fade-out-0 duration-200 fill-mode-forwards" : "animate-in fade-in-0 duration-300",
        )}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={tab === "search" ? "Search stays" : "Filters"}
        tabIndex={-1}
        className={cn(
          "relative flex h-[100dvh] w-full flex-col bg-white font-poppins outline-none md:h-auto md:max-h-[min(88vh,860px)] md:max-w-[640px] md:overflow-hidden md:rounded-3xl md:shadow-2xl",
          "motion-reduce:animate-none",
          closing
            ? "animate-out fade-out-0 slide-out-to-bottom duration-200 ease-in fill-mode-forwards md:slide-out-to-bottom-4 md:zoom-out-95"
            : "animate-in fade-in-0 slide-in-from-bottom duration-300 ease-out md:slide-in-from-bottom-4 md:zoom-in-95",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6 md:py-4">
          {desktop ? (
            <h2 className="font-bricolage text-lg font-semibold text-absoluteDark">Filters</h2>
          ) : (
            <div role="tablist" aria-label="Search or filter" className="relative grid grid-cols-2 rounded-full bg-gray-100 p-1">
              <span
                aria-hidden="true"
                className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: tab === "filters" ? "translateX(100%)" : "none" }}
              />
              {(["search", "filters"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "relative z-[1] inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
                    tab === t ? "text-absoluteDark" : "text-stone hover:text-absoluteDark",
                  )}
                >
                  {t === "search" ? <Search className="h-4 w-4" aria-hidden="true" /> : <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
                  {t === "search" ? "Search" : "Filters"}
                  {t === "filters" && filterCount > 0 ? (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-absoluteDark px-1.5 text-[11px] font-semibold leading-none text-white">
                      {filterCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-absoluteDark transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", tab === "search" ? "bg-gray-50 px-3 py-4 md:px-6" : "px-4 md:px-6")}>
          {tab === "search" ? (
            <div key="search" className="space-y-3 animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              <StepCard label="Where" value={searchTerm || "Anywhere"} title="Where to?" expanded={step === "where"} onExpand={() => setStep("where")}>
                <button
                  type="button"
                  onClick={() => setOpenDestination(true)}
                  aria-haspopup="dialog"
                  aria-expanded={openDestination}
                  className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-gray-300 px-4 text-left transition-colors hover:border-absoluteDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
                >
                  {searchTerm ? <MapPin className="h-5 w-5 shrink-0 text-primaryGreen" aria-hidden="true" /> : <Search className="h-5 w-5 shrink-0 text-absoluteDark" aria-hidden="true" />}
                  <span className={cn("min-w-0 flex-1 truncate text-base", searchTerm ? "font-medium text-absoluteDark" : "text-stone")}>{searchTerm || "Search destinations"}</span>
                </button>
                {searchTerm ? (
                  <div className="mt-3 flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setPlaceId(null);
                        setNear(null);
                      }}
                      className="min-h-[44px] rounded-full px-1 text-sm font-semibold text-absoluteDark underline underline-offset-4"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("when")}
                      className="min-h-[44px] rounded-full bg-absoluteDark px-6 text-sm font-semibold text-white transition-transform active:scale-95 motion-reduce:active:scale-100"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </StepCard>

              <StepCard label="When" value={whenValue} title="When's your trip?" expanded={step === "when"} onExpand={() => setStep("when")}>
                <StayCalendar
                  range={dateRange}
                  focus={dateRange.from ? "to" : "from"}
                  months={1}
                  onChange={(r) => {
                    setDateRange(r);
                    if (r.from && r.to) setStep("who");
                  }}
                />
                <p className="mt-3 text-sm text-graphite" aria-live="polite">
                  {nightsLabel(dateRange)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => (dateRange.from ? setDateRange({ from: undefined, to: undefined }) : setStep("who"))}
                    className="min-h-[44px] rounded-full px-1 text-sm font-semibold text-absoluteDark underline underline-offset-4"
                  >
                    {dateRange.from ? "Clear" : "Skip"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("who")}
                    className="min-h-[44px] rounded-full bg-absoluteDark px-6 text-sm font-semibold text-white transition-transform active:scale-95 motion-reduce:active:scale-100"
                  >
                    Next
                  </button>
                </div>
              </StepCard>

              <StepCard label="Who" value={guestSummary(guests) || "Add guests"} title="Who's coming?" expanded={step === "who"} onExpand={() => setStep("who")}>
                <GuestCounter guests={guests} onChange={setGuests} size="lg" />
              </StepCard>
            </div>
          ) : (
            <div key="filters" className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              <FilterPanel size={desktop ? "md" : "lg"} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 md:py-4">
          <button
            type="button"
            onClick={tab === "search" ? clearSearch : clearAllFilters}
            disabled={tab === "search" ? !hasSearch : filterCount === 0}
            className="min-h-[44px] rounded-full px-2 text-sm font-semibold text-absoluteDark underline underline-offset-4 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline disabled:hover:bg-transparent"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => go(url())}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-primaryGreen px-6 text-base font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-brightGreen active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2 motion-reduce:active:scale-100"
          >
            {tab === "search" ? <Search className="h-5 w-5" aria-hidden="true" /> : null}
            {tab === "search" ? "Search" : "Show results"}
          </button>
        </div>
      </div>

      <DestinationSheet open={openDestination} onClose={() => setOpenDestination(false)}>
        <LocationCombobox
          variant="sheet"
          value={searchTerm}
          onTextChange={(text) => {
            setSearchTerm(text);
            setPlaceId(null);
            setNear(null);
          }}
          onPick={(place) => {
            setSearchTerm(place.name);
            setPlaceId(place.id);
            setNear(null);
            setOpenDestination(false);
            setStep("when");
          }}
          onNearMe={(point) => {
            setSearchTerm("Nearby");
            setPlaceId(null);
            setNear(point);
            setOpenDestination(false);
            setStep("when");
          }}
          onSubmitText={() => go(url())}
          onPickStay={(stayId) => go(`/stay/${stayId}`)}
        />
      </DestinationSheet>
    </div>
  );
}
