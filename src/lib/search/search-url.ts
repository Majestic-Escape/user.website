// One builder for /filter URLs and one reader for their dates.
//
// Every search entry point (desktop pill, mobile sheet, filters modal) used
// to hand-assemble the query string: the destination went in unencoded
// ("Colva & Benaulim" broke the URL) and dates as toLocaleDateString(),
// which is "24/9/2026" in an Indian browser — new Date() cannot parse that,
// so any check-in after the 12th failed and earlier ones swapped day and
// month. URLs now carry calendar dates as yyyy-MM-dd; links in the old
// format still open (parseSearchDate).
import { format } from "date-fns";

export type FilterUrlInput = {
  location?: string;
  placeId?: string | null;
  near?: { lat: number; lng: number } | null;
  from?: Date | null;
  to?: Date | null;
  totalGuests?: number;
  adults?: number;
  children?: number;
  infants?: number;
  propertyType?: string | null;
  priceMin?: number | string | null;
  priceMax?: number | string | null;
  placeType?: string | null;
  amenities?: string[];
  bedrooms?: number | string | null;
  beds?: number | string | null;
  bathrooms?: number | string | null;
  bookingType?: string | boolean | null;
  checkinType?: string | boolean | null;
  pets?: string | boolean | null;
};

/** A calendar day as yyyy-MM-dd in the browser's own calendar. */
export function formatSearchDate(d: Date | null | undefined): string {
  return d && !Number.isNaN(d.getTime()) ? format(d, "yyyy-MM-dd") : "";
}

export function buildFilterUrl(input: FilterUrlInput): string {
  const p = new URLSearchParams();
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === false || value === "" || value === 0) return;
    p.set(key, String(value));
  };
  set("location", input.location?.trim());
  set("placeId", input.placeId);
  if (input.near) {
    // ~1 km: an exact position never enters a URL, history or a server log
    set("lat", (Math.round(input.near.lat * 100) / 100).toFixed(2));
    set("lng", (Math.round(input.near.lng * 100) / 100).toFixed(2));
  }
  set("from", formatSearchDate(input.from));
  set("to", formatSearchDate(input.to));
  set("adults", input.totalGuests);
  set("senior", input.adults);
  set("children", input.children);
  set("infants", input.infants);
  set("propertyType", input.propertyType);
  set("priceMin", input.priceMin);
  set("priceMax", input.priceMax);
  // "Any type" is no filter at all (as a filter it would hide listings with no type set)
  set("placeType", input.placeType && input.placeType !== "Any type" ? input.placeType.replaceAll(" ", "_") : "");
  set("amenities", (input.amenities || []).map((x) => x.toLowerCase().replaceAll(" ", "_")).join(","));
  set("bedrooms", input.bedrooms);
  set("beds", input.beds);
  set("bathrooms", input.bathrooms);
  set("bookingType", input.bookingType);
  set("checkinType", input.checkinType);
  set("pets", input.pets);
  const qs = p.toString();
  return qs ? `/filter?${qs}` : "/filter";
}

// Day/month order of the browser's locale ("dmy" for en-IN, "mdy" for en-US).
function localeOrder(): "dmy" | "mdy" | "ymd" {
  try {
    const parts = new Intl.DateTimeFormat().formatToParts(new Date(2000, 10, 22));
    const order = parts.filter((x) => x.type === "day" || x.type === "month" || x.type === "year").map((x) => x.type[0]).join("");
    if (order === "mdy") return "mdy";
    if (order.startsWith("y")) return "ymd";
  } catch {
    // ignore
  }
  return "dmy";
}

function calendarDate(y: number, m: number, d: number): Date | undefined {
  if (!y || !m || !d || m > 12 || d > 31) return undefined;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : undefined;
}

/**
 * yyyy-MM-dd (current links) or a legacy toLocaleDateString() value
 * ("24/9/2026", "9/24/2026", "24.9.2026", "2026/9/24"). Ambiguous legacy
 * values (both parts ≤ 12) follow this browser's own locale — the same
 * browser most likely produced the link. Invalid → undefined.
 */
export function parseSearchDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const s = String(value).trim().slice(0, 40);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return calendarDate(+iso[1], +iso[2], +iso[3]);
  const nums = s.match(/\d+/g);
  if (!nums || nums.length !== 3) return undefined;
  const [a, b, c] = nums.map(Number);
  if (nums[0].length === 4) return calendarDate(a, b, c);
  if (nums[2].length !== 4) return undefined;
  if (a > 12) return calendarDate(c, b, a); // day first
  if (b > 12) return calendarDate(c, a, b); // month first
  return localeOrder() === "mdy" ? calendarDate(c, a, b) : calendarDate(c, b, a);
}
