// What a stay search holds besides its filters, shared by the desktop pill
// and the phone search sheet: guest counting and summaries, today's date for
// the calendars, and reading the current search back out of a /filter URL so
// the fields show what the results were searched for.
import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import { parseSearchDate } from "./search-url";

export type Guests = { adults: number; children: number; infants: number };
export type GuestKey = keyof Guests;
export const NO_GUESTS: Guests = { adults: 0, children: 0, infants: 0 };

export const GUEST_ROWS: { key: GuestKey; label: string; hint: string }[] = [
  { key: "adults", label: "Adults", hint: "Ages 13 or above" },
  { key: "children", label: "Children", hint: "Ages 2–12" },
  { key: "infants", label: "Infants", hint: "Under 2" },
];

/**
 * Guests that count toward a stay's capacity. Infants don't — the same rule
 * the booking widget applies ("maximum of N guests, not including infants").
 */
export function capacityGuests(g: Guests): number {
  return g.adults + g.children;
}

/** "2 guests, 1 infant" — "" when nobody has been added. */
export function guestSummary(g: Guests): string {
  const n = capacityGuests(g);
  const parts: string[] = [];
  if (n > 0) parts.push(`${n} guest${n === 1 ? "" : "s"}`);
  if (g.infants > 0) parts.push(`${g.infants} infant${g.infants === 1 ? "" : "s"}`);
  return parts.join(", ");
}

/**
 * One step of a guest counter. Children and infants travel with an adult, so
 * adding one when there are no adults adds an adult too, and the last adult
 * can't be removed while they're on the trip.
 */
export function stepGuests(g: Guests, key: GuestKey, delta: 1 | -1): Guests {
  const next = { ...g, [key]: Math.max(0, g[key] + delta) };
  if (delta > 0 && key !== "adults" && next.adults === 0) next.adults = 1;
  return next;
}

export function canDecrease(g: Guests, key: GuestKey): boolean {
  if (g[key] <= 0) return false;
  return !(key === "adults" && g.adults === 1 && (g.children > 0 || g.infants > 0));
}

export function sanitizeGuests(value: unknown): Guests {
  const v = (value ?? {}) as Record<string, unknown>;
  const n = (x: unknown) => {
    const k = Math.floor(Number(x));
    return Number.isFinite(k) && k > 0 ? Math.min(k, 99) : 0;
  };
  return { adults: n(v.adults), children: n(v.children), infants: n(v.infants) };
}

export type StayRange = { from: Date | undefined; to: Date | undefined };

/** Which end the next tap sets: "to" edits check-out while keeping check-in. */
export type RangeFocus = "from" | "to";

/**
 * Airbnb-style range picking: the first tap is check-in, the next later day
 * check-out; tapping again after a full range (or on / before check-in)
 * starts a new one, unless check-out is being edited.
 */
export function nextRange(range: StayRange, day: Date, focus: RangeFocus): StayRange {
  const { from, to } = range;
  if (from && day > from && (!to || focus === "to")) return { from, to: day };
  return { from: day, to: undefined };
}

export function nightsLabel(range: StayRange): string {
  if (range.from && range.to) {
    const n = differenceInCalendarDays(range.to, range.from);
    return `${n} night${n === 1 ? "" : "s"} · ${format(range.from, "d MMM")} – ${format(range.to, "d MMM")}`;
  }
  return range.from ? "Now pick your check-out date" : "Pick your check-in date";
}

/** Days before today can't be picked; today can (a same-day booking). */
export function isPastDay(date: Date): boolean {
  return date < startOfToday();
}

export type UrlSearch = {
  searchTerm: string;
  placeId: string | null;
  near: { lat: number; lng: number } | null;
  from: Date | undefined;
  to: Date | undefined;
  guests: Guests;
};

/**
 * The search a /filter URL describes (see buildFilterUrl): `location` is the
 * label, `placeId` the picked place, `lat`/`lng` "near me", `adults` the
 * capacity total and `senior` the adult count (legacy names, kept).
 */
export function searchFromParams(p: URLSearchParams): UrlSearch {
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  const hasPoint = p.has("lat") && p.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);
  const placeId = p.get("placeId");
  const children = Number(p.get("children")) || 0;
  const total = Number(p.get("adults")) || 0;
  const adults = Number(p.get("senior")) || Math.max(0, total - children);
  let from = parseSearchDate(p.get("from"));
  let to = parseSearchDate(p.get("to"));
  if (from && to && to <= from) to = undefined;
  if (!from) to = undefined;
  if (from && isPastDay(from)) from = to = undefined; // an old link: dates are gone
  return {
    searchTerm: hasPoint ? "Nearby" : (p.get("location") || "").slice(0, 100),
    placeId: !hasPoint && placeId && placeId.length <= 90 ? placeId : null,
    near: hasPoint ? { lat, lng } : null,
    from,
    to,
    guests: sanitizeGuests({ adults, children, infants: p.get("infants") }),
  };
}
