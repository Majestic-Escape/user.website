"use client";
import "../../../../booking.css";
import { useState, useEffect, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type RefObject } from "react";
import { eachDayOfInterval, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Flag } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface BookingWidgetProps {
  propertyId: string;
  manual: string;
  propertyImages: Array<string>;
  pricePerNight: number;
  date: DateRange | undefined;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  unavailableDates: Array<string>;
  checkinTime: string;
  checkoutTime: string;
  showCalendar: boolean;
  setDate: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
  showGuestsDropdown: boolean;
  onDateSelect: (range: DateRange | undefined) => void;
  onGuestChange: (
    type: "adults" | "children" | "infants" | "pets",
    value: number,
  ) => void;
  toggleCalendar: () => void;
  toggleGuestsDropdown: () => void;
  activation: boolean;
  allowedGuests: number;
  loading: boolean;
}
import { X } from "lucide-react";
import { createPortal, flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { goToLogin, checkoutPathFor } from "@/lib/auth-return";
// The card calendar overlaps the 63 px date row by this much (as it always has).
const CARD_SIDE_OFFSET = -70;
const EDGE = 8;
const TOP_BAR = '[data-chrome-bar="top"]'; // the fixed site header (179 px at the page top, 75 px scrolled)
const topBarBottom = () => Math.max(0, document.querySelector(TOP_BAR)?.getBoundingClientRect().bottom ?? 0);
// Where the header ends when shown: on short screens it slides away while scrolling
// and back in on the way up, so closing is decided against its full height.
const topBarShownBottom = () => {
  const bar = document.querySelector<HTMLElement>(TOP_BAR);
  return bar ? Math.max(bar.getBoundingClientRect().bottom, bar.offsetHeight) : 0;
};
// The chat widget hides its launcher while <html> carries this (it sat on the calendar's Close button).
const HIDE_LAUNCHER = "data-majestic-chat-hide-launcher";

type CardPlace = { side: "top" | "bottom"; offset: number; alignOffset: number; cap: number; top: number; h: number; rowTop: number };

// Under the date row if the calendar fits there, else above it (as it always
// did), else on the side it overflows less; then nudged into the free space
// between the fixed site header and the window bottom, centred on the row and
// kept 8 px inside the window. Only a window shorter than the calendar caps its
// height (it then scrolls inside).
function placeCardCalendar(row: DOMRect, w: number, natH: number, keepSide?: CardPlace["side"]): CardPlace {
  const freeTop = topBarBottom() + EDGE;
  const freeBottom = window.innerHeight - EDGE;
  const cap = Math.max(0, freeBottom - freeTop);
  const h = Math.min(natH, cap);
  const below = row.bottom + CARD_SIDE_OFFSET; // its top edge when under the row
  const above = row.top - CARD_SIDE_OFFSET - h; // its top edge when above the row
  const side =
    keepSide ?? (below + h <= freeBottom ? "bottom" : above >= freeTop ? "top" : below + h - freeBottom <= freeTop - above ? "bottom" : "top");
  const top = Math.min(Math.max(side === "bottom" ? below : above, freeTop), freeBottom - h);
  const left = Math.min(Math.max(row.left + row.width / 2 - w / 2, EDGE), document.documentElement.clientWidth - EDGE - w);
  return {
    side,
    offset: Math.round(side === "bottom" ? top - row.bottom : row.top - (top + h)),
    alignOffset: Math.round(left - row.left),
    cap,
    top,
    h,
    rowTop: row.top,
  };
}

// Card calendar: placed once when it opens (placeCardCalendar) and never moves
// the page; Radix's own flipping and shifting are off, so nothing re-decides
// afterwards. It rides with the date row; once a scroll would push it under the
// header or off the bottom, it closes.
function CardCalendarContent({
  open,
  onOpenChange,
  rowRef,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverContent> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowRef: RefObject<HTMLDivElement | null>;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const scrolledAway = useRef(false);
  const [place, setPlace] = useState<CardPlace | null>(null);

  // Every open starts unplaced (invisible for a frame or two until measured);
  // on close it keeps its place while it fades out.
  useLayoutEffect(() => {
    if (open) setPlace(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrolledAway.current = false;
    const root = document.documentElement;
    const hidLauncher = !root.hasAttribute(HIDE_LAUNCHER);
    if (hidLauncher) root.setAttribute(HIDE_LAUNCHER, "");
    let placed: CardPlace | null = null;
    let frame = 0;
    let ro: ResizeObserver | null = null;
    const fit = (keepSide?: CardPlace["side"]) => {
      frame = 0;
      const pop = contentRef.current;
      const row = rowRef.current;
      if (!row) return;
      if (!pop) {
        frame = requestAnimationFrame(() => fit(keepSide)); // portal not mounted yet
        return;
      }
      if (!ro && typeof ResizeObserver !== "undefined") {
        // A month with 5 or 6 weeks changes its height: re-fit on the same side.
        ro = new ResizeObserver(() => {
          if (!frame) frame = requestAnimationFrame(() => fit(placed?.side));
        });
        for (const child of Array.from(pop.children)) ro.observe(child);
      }
      const next = placeCardCalendar(row.getBoundingClientRect(), pop.offsetWidth, pop.scrollHeight + pop.offsetHeight - pop.clientHeight, keepSide); // + borders
      placed = next;
      setPlace((p) =>
        p && p.side === next.side && p.offset === next.offset && p.alignOffset === next.alignOffset && p.cap === next.cap ? p : next,
      );
    };
    // Computed from the date row (the calendar is fixed to it), never from the
    // popover's own box, which Radix parks off-screen until it is positioned.
    const onScroll = () => {
      const row = rowRef.current?.getBoundingClientRect();
      if (!placed || !row) return;
      const top = placed.top + row.top - placed.rowTop;
      const bar = topBarShownBottom();
      if (top < bar - 1 || top + placed.h > window.innerHeight + 1 || row.bottom < bar || row.top > window.innerHeight) {
        scrolledAway.current = true;
        flushSync(() => onOpenChange(false)); // closed in this frame, not the next
      }
    };
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(() => fit());
    };
    frame = requestAnimationFrame(() => fit());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (hidLauncher) root.removeAttribute(HIDE_LAUNCHER);
      cancelAnimationFrame(frame);
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open, rowRef, onOpenChange]);

  return (
    <PopoverContent
      {...props}
      ref={contentRef}
      side={place?.side ?? "bottom"}
      sideOffset={place?.offset ?? CARD_SIDE_OFFSET}
      align="start"
      alignOffset={place?.alignOffset ?? 0}
      avoidCollisions={false}
      style={place ? { maxHeight: place.cap } : { opacity: 0 }}
      // Closed by scrolling: do not pull focus (and the page) back to the date row.
      onCloseAutoFocus={(e) => {
        if (scrolledAway.current) e.preventDefault();
      }}
    />
  );
}

export default function BookingWidget({
  propertyId,
  manual,
  propertyImages,
  pricePerNight,
  date,
  guests,
  showCalendar,
  showGuestsDropdown,
  checkinTime,
  checkoutTime,
  onDateSelect,
  onGuestChange,
  toggleCalendar,
  toggleGuestsDropdown,
  unavailableDates,
  activation,
  allowedGuests,
  loading,
  setDate,
}: BookingWidgetProps) {
  const { openPriceModal, setOpenPriceModal, setBookingQuery } = useAuth();
  // Incomplete listings can arrive without a basePrice. Never show ₹0 or
  // NaN for those: render "Price on request" and keep Reserve disabled.
  const hasPrice = Number.isFinite(pricePerNight);
  const safePrice = hasPrice ? pricePerNight : 0;
  const [totalPrice, setTotalPrice] = useState<number>(safePrice);
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const guestsRef = useRef<HTMLDivElement | null>(null);
  const [matches, setMatches] = useState(false);
  const scrollPosRef = useRef(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const dateRowRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const handleModalChange = () => {
      if (openPriceModal) {
        setCurrentIndex(0);

        // Save scroll position
        scrollPosRef.current = window.scrollY;
        const overlay = document.createElement("div");
        overlay.id = "modal-overlay";
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      pointer-events: auto;
      cursor: default;
    `;
        document.body.appendChild(overlay);
        // Freeze background
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPosRef.current}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      } else {
        // Get the saved scroll position
        const overlay = document.getElementById("modal-overlay");
        if (overlay) {
          overlay.remove();
        }
        const savedScrollPos = scrollPosRef.current;

        // Unlock body
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Force reflow before restoring scroll
        document.body.offsetHeight; // Trigger reflow

        // Restore scroll position
        window.scrollTo({
          top: savedScrollPos,
          behavior: "instant", // Use 'instant' to avoid smooth scrolling
        });
      }
    };

    // Execute with a tiny delay to ensure proper timing
    setTimeout(handleModalChange, 0);

    return () => {
      // Cleanup on unmount
      if (openPriceModal) {
        const overlay = document.getElementById("modal-overlay");
        if (overlay) {
          overlay.remove();
        }
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        window.scrollTo({
          top: scrollPosRef.current,
          behavior: "instant",
        });
      }
    };
  }, [openPriceModal]);
  useEffect(() => {
    if (date?.from && date?.to) {
      const nights = Math.ceil(
        (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24),
      );
      setNightsCount(nights);
      setTotalPrice(safePrice * nights);
    }
  }, [date, safePrice]);
  useEffect(() => {
    if (!openPriceModal) return;

    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpenPriceModal(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openPriceModal, setOpenPriceModal]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showGuestsDropdown &&
        guestsRef.current &&
        !guestsRef.current.contains(event.target as Node)
      ) {
        toggleGuestsDropdown(); // close dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGuestsDropdown, toggleGuestsDropdown]);

  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = getLocalData ? JSON.parse(getLocalData) : null;
    if (data) {
      setIsAuth(true);
    }
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("nonssssssss", isAuth, isValid);
  }
  useEffect(() => {
    auth();
  }, []);

  function useMediaQuery(query: string) {
    useEffect(() => {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  }
  const isMobile = useMediaQuery("(max-width: 640px)");
  function findNextAvailableRange(startFrom: Date, unavailableDates: string[]) {
    const unavailableSet = new Set(unavailableDates);

    let from = startFrom;
    let to = addDays(from, 1);

    // while (
    //   unavailableSet.has(format(from, "yyyy-MM-dd")) ||
    //   unavailableSet.has(format(to, "yyyy-MM-dd"))
    // ) {
    //   from = addDays(from, 1);
    //   to = addDays(to, 1);
    // }

    // Bounded: if a listing is blocked for every day of the next year this
    // used to spin forever and hang the tab; give up and return today.
    for (let attempts = 0; attempts < 366; attempts++) {
      const fromStr = format(from, "yyyy-MM-dd");
      const toStr = format(to, "yyyy-MM-dd");

      if (!unavailableSet.has(fromStr) && !unavailableSet.has(toStr)) {
        // Both dates are available, we found our range
        break;
      }

      // Move both dates forward by 1 day
      from = addDays(from, 1);
      to = addDays(to, 1);
    }
    console.log("NEW", from, to);
    return { from, to };
  }
  useEffect(() => {
    const today = new Date();

    const { from, to } = findNextAvailableRange(today, unavailableDates);

    setDate({ from: new Date(from), to: new Date(to) });
  }, [unavailableDates]);
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("logite", propertyImages?.[0]);
  }
  const priceLabel = hasPrice
    ? `₹${pricePerNight.toLocaleString("en-IN")}`
    : "Price on request";
  const totalLabel = hasPrice ? `₹${totalPrice.toLocaleString("en-IN")}` : "—";

  const calculatePriceWithTax = (basePrice: number) => {
    const serviceFee = Math.round((basePrice * 14) / 100);
    const priceWithServiceFee = basePrice + serviceFee;

    let gstRate = 0;
    if (priceWithServiceFee >= 7500) {
      gstRate = 18;
    } else if (priceWithServiceFee >= 1000) {
      gstRate = 12;
    }

    const gstAmount = Math.round((priceWithServiceFee * gstRate) / 100);
    const totalPrice = priceWithServiceFee + gstAmount;

    // Format number in Indian style
    return totalPrice.toLocaleString("en-IN");
  };

  const calculatePriceWithoutTax = (basePrice: number) => {
    const serviceFee = calculateServicFee(basePrice);
    const priceWithServiceFee = Number(basePrice) + serviceFee;

    // Format number in Indian style
    return priceWithServiceFee.toLocaleString("en-IN");
  };

  const calculateServicFee = (basePrice: number) => {
    const serviceFee = Math.round((basePrice * 12) / 100);
    return serviceFee;
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "dd/MM/yyyy") : "";
  };
  const formatRevDate = (date: Date | undefined) => {
    return date ? format(date, "yyyy-MM-dd") : "";
  };

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("not what", formatRevDate(new Date()));
  }
  const getTotalGuests = () => {
    return guests.adults + guests.children;
  };
  useEffect(() => {
    if (!openPriceModal) {
      setCalendarOpen(false);
    }
  }, [openPriceModal]);
  const getGuestsText = () => {
    const totalGuests = getTotalGuests();
    return `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
  };
  const createReserveRecord = async (): Promise<void> => {
    try {
      const getLocalData = await localStorage.getItem("token");

      const data = getLocalData ? JSON.parse(getLocalData) : null;
      const getUserId = await localStorage.getItem("userId");
      const userId = getUserId ? JSON.parse(getUserId) : null;
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("this is user log", userId);
      }
      if (!data) {
        // toast.error("You need to signup or login to reserve.");
        // Sign in, then land on this checkout (dates and guests included);
        // without dates, back on the listing.
        goToLogin(
          router,
          checkoutPathFor(propertyId, {
            checkin: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
            checkout: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
            guests: getTotalGuests(),
            nights: nightsCount,
            adults: guests.adults,
            children: guests.children,
            infants: guests.infants,
            checkinTime,
            checkoutTime,
            propertyImage: filename,
          }),
        );
        return;
      }

      const response = await fetch(`${API_URL}/booking-interest/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          propertyId: propertyId,
          dateFrom: date?.from,
          dateTo: date?.to,
          guests: getTotalGuests(),
        }),
      });
      if (!response.ok) {
        return;
      }
      setIsValid(true);
    } catch (err) {
      console.error(err);
    }
  };
  function getDateRange(start: Date, end: Date) {
    const dates = [];
    const current = new Date(start);
    const final = new Date(end);

    while (current < final) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Remove checkout date

    return dates;
  }

  // Check for overlap
  function hasDateOverlap() {
    if (!date?.from || !date?.to) return false;

    const range = getDateRange(date.from, date.to).map((d) => formatRevDate(d)); // You already have formatRevDate()

    return range.some((d) => unavailableDates.includes(d));
  }
  const filename = propertyImages?.[0]?.split("/").pop() ?? "";
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("bailan", filename);
  }

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("get tyep", Object.prototype.toString.call(date?.from));
  }
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("we have got this date", date?.from);
  }
  useEffect(() => {
    if (!propertyId) return;

    setBookingQuery({
      propertyId,
      checkin: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      checkout: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
      guests: getTotalGuests(),
      nights: nightsCount,
      adults: guests.adults,
      children: guests.children,
      infants: guests.infants,
      checkinTime,
      checkoutTime,
      propertyImage: filename,
    });
  }, [
    propertyId,
    date?.from,
    date?.to,
    nightsCount,
    guests.adults,
    guests.children,
    guests.infants,
    checkinTime,
    checkoutTime,
    filename,
  ]);
  // function findDate(){
  //   unavailableDates.forEach((item)=>{date?.from==})
  // }

  console.log(
    "All dates",

    unavailableDates,
    date?.from?.toISOString().slice(0, 10),
  );
  function getModalRoot() {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    return root;
  }
  if (openPriceModal) {
    return createPortal(
      <div
        id="modal"
        ref={modalRef}
        className={
          openPriceModal
            ? "fixed inset-x-0 bottom-0 z-[1001] bg-white rounded-t-xl shadow-xl"
            : "hidden md:block"
        }
      >
        {/* return (
    <div
      id="modal"
      className={
        openPriceModal
          ? "slide-up border rounded-xl shadow-lg isolate z-[9999]"
          : "hidden md:block border rounded-xl shadow-lg"
      }
    > */}
        <Card className="">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-semibold font-bricolage">
                    {priceLabel}
                  </span>
                  {hasPrice ? (
                    <span className="text-gray-600"> per night</span>
                  ) : null}
                </div>
                <div
                  onClick={() => setOpenPriceModal(false)}
                  className="md:hidden"
                >
                  <X />
                </div>
              </div>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <div className="border border-gray-300 rounded-lg mb-4">
                  {/* Anchor = the whole date row, so the calendar centres on the card
                      (two triggers alone anchored it to CHECK-OUT and it spilled right). */}
                  <PopoverAnchor className="grid grid-cols-2 divide-x divide-gray-300">
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full text-left p-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen hover:bg-gray-50 transition-colors rounded-tl-lg">
                        <span className="block text-xs font-semibold uppercase">
                          CHECK-IN
                        </span>
                        <span className="block mt-1 text-base">
                          {/* {findDate()} */}
                          {/*filterformatDate(date?.from) */}
                          {formatDate(date?.from)}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full text-left p-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen hover:bg-gray-50 transition-colors rounded-tr-lg">
                        <span className="block text-xs font-semibold uppercase">
                          CHECK-OUT
                        </span>
                        <span className="block mt-1 text-base">
                          {formatDate(date?.to)}
                        </span>
                      </button>
                    </PopoverTrigger>
                  </PopoverAnchor>

                  {/* <div
                className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-b-lg flex justify-between items-center"
                onClick={toggleGuestsDropdown}
              >
                <div>
                  <div className="text-xs font-semibold uppercase">GUESTS</div>
                  <div className="mt-1 text-base">{getGuestsText()}</div>
                </div>
                <div>
                  {showGuestsDropdown ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div> */}
                  <div ref={guestsRef} className="relative">
                    <div
                      className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-b-lg flex justify-between items-center"
                      onClick={toggleGuestsDropdown}
                    >
                      <div>
                        <div className="text-xs font-semibold uppercase">
                          GUESTS
                        </div>
                        <div className="mt-1 text-base">{getGuestsText()}</div>
                      </div>
                      {showGuestsDropdown ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>

                    {showGuestsDropdown && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 left-0 right-0 mt-2">
                        <div className="">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Adults</div>
                                <div className="text-sm text-gray-600">
                                  Age 18+
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("adults", guests.adults - 1)
                                  }
                                  disabled={guests.adults <= 1}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.adults}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("adults", guests.adults + 1)
                                  }
                                  disabled={getTotalGuests() >= allowedGuests}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Children</div>
                                <div className="text-sm text-gray-600">
                                  Ages 2-12
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange(
                                      "children",
                                      guests.children - 1,
                                    )
                                  }
                                  disabled={guests.children <= 0}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.children}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange(
                                      "children",
                                      guests.children + 1,
                                    )
                                  }
                                  disabled={getTotalGuests() >= allowedGuests}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Infants</div>
                                <div className="text-sm text-gray-600">
                                  Under 2
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("infants", guests.infants - 1)
                                  }
                                  disabled={guests.infants <= 0}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.infants}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    if (guests.infants < 5) {
                                      onGuestChange(
                                        "infants",
                                        guests.infants + 1,
                                      );
                                    }
                                  }}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            {/* <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Pets</div>
                    <div className="text-sm text-gray-600">
                      Bringing a service animal?
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets - 1)}
                      disabled={guests.pets <= 0}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.pets}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div> */}

                            <div className="text-sm text-gray-600 pt-2 border-t">
                              {/* This place has a maximum of 2 guests, not including infants.
                  Pets aren't allowed. */}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="default"
                                className="bg-primaryGreen hover:brightGreen"
                                onClick={toggleGuestsDropdown}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <PopoverContent
                  className="w-auto h-auto max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0 z-[10001] origin-[--radix-popover-content-transform-origin] motion-reduce:!animate-none"
                  align="center"
                  container={modalRef.current}
                  side={isMobile ? "top" : "bottom"}
                  sideOffset={isMobile ? -120 : -70}
                >
                  <div className="p-4 border-b">
                    <h3 className="text-base font-semibold">Select dates</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Add your travel dates for exact pricing
                    </div>
                  </div>
                  {/* Calendar always rendered (no size jump); covered while dates load. */}
                  <div className="p-4 relative" aria-busy={loading || undefined}>
                    {loading ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80" role="status">
                        <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full animate-spin motion-reduce:animate-none"></div>
                        <p className="text-sm mt-2 text-gray-600">
                          Loading dates...
                        </p>
                      </div>
                    ) : null}
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={activation ? date : undefined}
                        onSelect={onDateSelect}
                        numberOfMonths={isMobile ? 1 : 2}
                        disabled={[
                          { before: new Date() }, // disable past dates
                          ...unavailableDates.map((d) => new Date(d)), // disable specific unavailable dates
                          // ...(date?.from
                          //   ? [
                          //       (d: Date) =>
                          //         d.toDateString() === date.from!.toDateString(),
                          //     ]
                          //   : []),
                        ]}
                        classNames={{
                          day_selected:
                            "bg-black text-white hover:bg-black hover:text-white ",
                          day_range_middle:
                            "aria-selected:bg-gray-100 aria-selected:text-black",
                          day_range_end:
                            "bg-black text-white hover:bg-black hover:text-white",
                          day_range_start:
                            "bg-black text-white hover:bg-black hover:text-white",
                        }}
                      />
                  </div>
                  <div className="p-4 flex justify-between border-t">
                    <Button
                      variant="ghost"
                      disabled={!date?.from}
                      onClick={() => onDateSelect(undefined)}
                    >
                      Clear dates
                    </Button>
                    <Button
                      className="bg-primaryGreen hover:bg-brightGreen text-white"
                      onClick={() => setCalendarOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div onClick={() => hasPrice && createReserveRecord()}>
                {!hasPrice ? (
                  <Button
                    disabled
                    className="w-full flex justify-center items-center text-center py-3 px bg-gray-300 text-base font-bricolage text-gray-600 h-10 rounded-lg font-medium"
                  >
                    Price on request
                  </Button>
                ) : isAuth || isValid ? (
                  activation ? (
                    date?.from && date?.to ? (
                      hasDateOverlap() ? (
                        <Button
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                          onClick={() =>
                            toast.error(
                              "Selected date overlaps with other bookings",
                            )
                          }
                        >
                          Reserve
                        </Button>
                      ) : formatRevDate(new Date(date?.from)) ==
                        formatRevDate(new Date(date?.to)) ? (
                        <Button
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                          onClick={() =>
                            toast.error(
                              "Checkin and Checkout date cannot be same",
                            )
                          }
                        >
                          Reserve
                        </Button>
                      ) : (
                        <Link
                          href={{
                            pathname: `/book/stay/${propertyId}`,
                            query: {
                              checkin: date?.from
                                ? format(date.from, "yyyy-MM-dd")
                                : undefined,
                              checkout: date?.to
                                ? format(date.to, "yyyy-MM-dd")
                                : undefined,
                              guests: getTotalGuests(),
                              nights: nightsCount,
                              adults: guests.adults,
                              children: guests.children,
                              infants: guests.infants,
                              checkinTime: checkinTime,
                              checkoutTime: checkoutTime,
                              propertyImage: filename,
                            },
                          }}
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                        >
                          Reserve
                        </Link>
                      )
                    ) : (
                      <Button
                        className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                        onClick={() => {
                          toast.error("Select both dates");
                        }}
                      >
                        {"Check availability"}
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                      onClick={() => {
                        toast.error("Select dates");
                      }}
                    >
                      Check availability
                    </Button>
                  )
                ) : (
                  <Button
                    className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                    // onClick={() => toast.error("Check if you are logged in")}
                  >
                    Check availability
                  </Button>
                )}
              </div>
              {(date?.from || date?.to) && (
                <>
                  <div className="text-center text-sm text-gray-600 mt-2">
                    You won't be charged yet
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between ">
                      <div className=" text-sm ">
                        {priceLabel} x {nightsCount}{" "}
                        night
                        {nightsCount !== 1 ? "s" : ""}
                      </div>
                      <div className="text-sm">
                        {totalLabel}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      {/* <div className="underline text-sm">
                      Majestic Escape Service Fee
                    </div>
                    <div className="text-sm">
                      ₹
                      {calculateServicFee(
                        pricePerNight * nightsCount
                      ).toLocaleString("en-IN")}
                    </div> */}
                    </div>

                    <div className="flex justify-between pt-4 border-t ">
                      <div>Total before taxes</div>
                      <div>{totalLabel}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className=" justify-center hidden p-4 border-t">
              <Button
                variant="ghost"
                className="text-sm flex items-center gap-1"
              >
                <Flag className="h-4 w-4" />
                Report this listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>,
      getModalRoot(),
    );
  } else {
    return (
      <div
        id="modal"
        className={
          openPriceModal
            ? "slide-up border rounded-xl shadow-lg isolate z-[9999]"
            : "hidden md:block border rounded-xl shadow-lg"
        }
      >
        <Card className="">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-semibold font-bricolage">
                    {priceLabel}
                  </span>
                  {hasPrice ? (
                    <span className="text-gray-600"> per night</span>
                  ) : null}
                </div>
                <div
                  onClick={() => setOpenPriceModal(false)}
                  className="md:hidden"
                >
                  <X />
                </div>
              </div>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <div className="border border-gray-300 rounded-lg mb-4">
                  {/* Anchor = the whole date row, so the calendar centres on the card
                      (two triggers alone anchored it to CHECK-OUT and it spilled right). */}
                  <PopoverAnchor ref={dateRowRef} className="grid grid-cols-2 divide-x divide-gray-300">
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full text-left p-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen hover:bg-gray-50 transition-colors rounded-tl-lg">
                        <span className="block text-xs font-semibold uppercase">
                          CHECK-IN
                        </span>
                        <span className="block mt-1 text-base">
                          {activation
                            ? date?.from
                              ? formatDate(date.from)
                              : "Add date"
                            : "Add Date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full text-left p-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen hover:bg-gray-50 transition-colors rounded-tr-lg">
                        <span className="block text-xs font-semibold uppercase">
                          CHECK-OUT
                        </span>
                        <span className="block mt-1 text-base">
                          {activation
                            ? date?.to
                              ? formatDate(date.to)
                              : "Add date"
                            : "Add date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                  </PopoverAnchor>

                  {/* <div
                className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-b-lg flex justify-between items-center"
                onClick={toggleGuestsDropdown}
              >
                <div>
                  <div className="text-xs font-semibold uppercase">GUESTS</div>
                  <div className="mt-1 text-base">{getGuestsText()}</div>
                </div>
                <div>
                  {showGuestsDropdown ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div> */}
                  <div ref={guestsRef} className="relative">
                    <div
                      className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-b-lg flex justify-between items-center"
                      onClick={toggleGuestsDropdown}
                    >
                      <div>
                        <div className="text-xs font-semibold uppercase">
                          GUESTS
                        </div>
                        <div className="mt-1 text-base">{getGuestsText()}</div>
                      </div>
                      {showGuestsDropdown ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>

                    {showGuestsDropdown && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 left-0 right-0 mt-2">
                        <div className="">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Adults</div>
                                <div className="text-sm text-gray-600">
                                  Age 18+
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("adults", guests.adults - 1)
                                  }
                                  disabled={guests.adults <= 1}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.adults}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("adults", guests.adults + 1)
                                  }
                                  disabled={getTotalGuests() >= allowedGuests}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Children</div>
                                <div className="text-sm text-gray-600">
                                  Ages 2-12
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange(
                                      "children",
                                      guests.children - 1,
                                    )
                                  }
                                  disabled={guests.children <= 0}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.children}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange(
                                      "children",
                                      guests.children + 1,
                                    )
                                  }
                                  disabled={getTotalGuests() >= allowedGuests}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Infants</div>
                                <div className="text-sm text-gray-600">
                                  Under 2
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    onGuestChange("infants", guests.infants - 1)
                                  }
                                  disabled={guests.infants <= 0}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center">
                                  {guests.infants}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    if (guests.infants < 5) {
                                      onGuestChange(
                                        "infants",
                                        guests.infants + 1,
                                      );
                                    }
                                  }}
                                >
                                  +
                                </Button>
                              </div>
                            </div>

                            {/* <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Pets</div>
                    <div className="text-sm text-gray-600">
                      Bringing a service animal?
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets - 1)}
                      disabled={guests.pets <= 0}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.pets}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div> */}

                            <div className="text-sm text-gray-600 pt-2 border-t">
                              {/* This place has a maximum of 2 guests, not including infants.
                  Pets aren't allowed. */}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="default"
                                className="bg-primaryGreen hover:brightGreen"
                                onClick={toggleGuestsDropdown}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <CardCalendarContent
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                  rowRef={dateRowRef}
                  className="w-auto h-auto overflow-y-auto p-0 z-[1000001] origin-[--radix-popover-content-transform-origin] motion-reduce:!animate-none"
                >
                  {/* Hidden on short windows so the whole calendar fits on screen
                      without scrolling (the CHECK-IN / CHECK-OUT labels already say it). */}
                  <div className="p-4 border-b [@media(max-height:700px)]:hidden">
                    <h3 className="text-base font-semibold">Select dates</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Add your travel dates for exact pricing
                    </div>
                  </div>
                  {/* The calendar is always rendered, so the popover keeps its size (no
                      jump) while the booked dates load; until then it is covered and
                      cannot be clicked. */}
                  <div className="p-4 relative" aria-busy={loading || undefined}>
                    {loading ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80" role="status">
                        <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full animate-spin motion-reduce:animate-none"></div>
                        <p className="text-sm mt-2 text-gray-600">
                          Loading dates...
                        </p>
                      </div>
                    ) : null}
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={activation ? date : undefined}
                        onSelect={onDateSelect}
                        numberOfMonths={isMobile ? 1 : 2}
                        disabled={[
                          { before: new Date() }, // disable past dates
                          ...unavailableDates.map((d) => new Date(d)), // disable specific unavailable dates
                          // ...(date?.from
                          //   ? [
                          //       (d: Date) =>
                          //         d.toDateString() === date.from!.toDateString(),
                          //     ]
                          //   : []),
                        ]}
                        classNames={{
                          day_selected:
                            "bg-black text-white hover:bg-black hover:text-white ",
                          day_range_middle:
                            "aria-selected:bg-gray-100 aria-selected:text-black",
                          day_range_end:
                            "bg-black text-white hover:bg-black hover:text-white",
                          day_range_start:
                            "bg-black text-white hover:bg-black hover:text-white",
                        }}
                      />
                  </div>
                  <div className="p-4 [@media(max-height:700px)]:py-3 flex justify-between border-t">
                    <Button
                      variant="ghost"
                      disabled={!date?.from}
                      onClick={() => onDateSelect(undefined)}
                    >
                      Clear dates
                    </Button>
                    <Button
                      className="bg-primaryGreen hover:bg-brightGreen text-white"
                      onClick={() => setCalendarOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardCalendarContent>
              </Popover>

              <div onClick={() => hasPrice && createReserveRecord()}>
                {!hasPrice ? (
                  <Button
                    disabled
                    className="w-full flex justify-center items-center text-center py-3 px bg-gray-300 text-base font-bricolage text-gray-600 h-10 rounded-lg font-medium"
                  >
                    Price on request
                  </Button>
                ) : isAuth || isValid ? (
                  activation ? (
                    date?.from && date?.to ? (
                      hasDateOverlap() ? (
                        <Button
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                          onClick={() =>
                            toast.error(
                              "Selected date overlaps with other bookings",
                            )
                          }
                        >
                          Reserve
                        </Button>
                      ) : formatRevDate(new Date(date?.from)) ==
                        formatRevDate(new Date(date?.to)) ? (
                        <Button
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                          onClick={() =>
                            toast.error(
                              "Checkin and Checkout date cannot be same",
                            )
                          }
                        >
                          Reserve
                        </Button>
                      ) : (
                        <Link
                          href={{
                            pathname: `/book/stay/${propertyId}`,

                            query: {
                              checkin: date?.from
                                ? format(date.from, "yyyy-MM-dd")
                                : undefined,
                              checkout: date?.to
                                ? format(date.to, "yyyy-MM-dd")
                                : undefined,
                              guests: getTotalGuests(),
                              nights: nightsCount,
                              adults: guests.adults,
                              children: guests.children,
                              infants: guests.infants,
                              checkinTime: checkinTime,
                              checkoutTime: checkoutTime,
                              propertyImage: filename,
                            },
                          }}
                          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                        >
                          Reserve
                        </Link>
                      )
                    ) : (
                      <Button
                        className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                        onClick={() => {
                          toast.error("Select both dates");
                        }}
                      >
                        {"Check availability"}
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                      onClick={() => {
                        toast.error("Select dates");
                      }}
                    >
                      Check availability
                    </Button>
                  )
                ) : (
                  <Button
                    className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                    // onClick={() => toast.error("Check if you are logged in")}
                  >
                    Check availability
                  </Button>
                )}
              </div>
              {(date?.from || date?.to) && (
                <>
                  <div className="text-center text-sm text-gray-600 mt-2">
                    You won't be charged yet
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between ">
                      <div className=" text-sm ">
                        {priceLabel} x {nightsCount}{" "}
                        night
                        {nightsCount !== 1 ? "s" : ""}
                      </div>
                      <div className="text-sm">
                        {totalLabel}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      {/* <div className="underline text-sm">
                      Majestic Escape Service Fee
                    </div>
                    <div className="text-sm">
                      ₹
                      {calculateServicFee(
                        pricePerNight * nightsCount
                      ).toLocaleString("en-IN")}
                    </div> */}
                    </div>

                    <div className="flex justify-between pt-4 border-t ">
                      <div>Total before taxes</div>
                      <div>{totalLabel}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className=" justify-center hidden p-4 border-t">
              <Button
                variant="ghost"
                className="text-sm flex items-center gap-1"
              >
                <Flag className="h-4 w-4" />
                Report this listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
