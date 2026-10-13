// "More stays hosted by …" / "Similar stays nearby" on the stay page.
//
// GET /properties/:id/related (server.me docs/related-stays.md) returns
// { host: Card[≤12], nearby: Card[≤8], nearbyScope, sourceHostId }. The
// payload is untrusted: it is validated on the server render (page.jsx) and
// again by the browser fallback fetch with this one function, so both paths
// render exactly the same thing. A card that does not validate is dropped;
// a payload whose shape is wrong is rejected as a whole (null).

export const RELATED_PATH = (id: string) => `/properties/${encodeURIComponent(id)}/related`;
export const HOST_ROW_MAX = 12;
export const NEARBY_ROW_MAX = 8;
export const RELATED_TIMEOUT_MS = 2500; // server render
export const RELATED_CLIENT_TIMEOUT_MS = 5000; // each browser attempt

export type RelatedCard = {
  _id: string;
  title: string;
  propertyType: string | null;
  photo: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  basePrice: number | null;
  guests: number | null;
  bedrooms: number | null;
  averageRating: number | null;
  reviewCount: number;
  distanceKm: number | null;
};

export type NearbyScope = "near" | "mixed" | "wide" | null;

export type RelatedStays = {
  host: RelatedCard[];
  nearby: RelatedCard[];
  nearbyScope: NearbyScope;
  sourceHostId: string | null;
  // The API could not answer (the stay is not public, or it changed while
  // the rows were built): no rows now, and never kept as "nothing related"
  // — the server render passes null instead, so the browser asks again.
  unavailable: boolean;
};

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const text = (v: unknown, max = 200): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
const positive = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
const photoUrl = (v: unknown): string | null => {
  const s = text(v, 2048);
  return s && /^https:\/\//i.test(s) ? s : null;
};

function readCard(raw: unknown, withDistance: boolean): RelatedCard | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r._id === "string" && OBJECT_ID.test(r._id) ? r._id : null;
  const title = text(r.title);
  if (!id || !title) return null;
  const a = r.address && typeof r.address === "object" ? (r.address as Record<string, unknown>) : {};
  const rating = typeof r.averageRating === "number" && Number.isFinite(r.averageRating) && r.averageRating >= 0 && r.averageRating <= 5 ? r.averageRating : null;
  const reviews = typeof r.reviewCount === "number" && Number.isInteger(r.reviewCount) && r.reviewCount > 0 ? r.reviewCount : 0;
  const d = typeof r.distanceKm === "number" && Number.isFinite(r.distanceKm) && r.distanceKm >= 0 && r.distanceKm <= 300 ? r.distanceKm : null;
  return {
    _id: id,
    title,
    propertyType: text(r.propertyType, 60),
    photo: Array.isArray(r.photos) ? photoUrl(r.photos[0]) : null,
    city: text(a.city, 80),
    district: text(a.district, 80),
    state: text(a.state, 80),
    basePrice: positive(r.basePrice),
    guests: positive(r.guests),
    bedrooms: positive(r.bedrooms),
    averageRating: reviews > 0 ? rating : null,
    reviewCount: reviews,
    distanceKm: withDistance ? d : null,
  };
}

function readRow(raw: unknown, max: number, withDistance: boolean, seen: Set<string>, sourceId: string): RelatedCard[] {
  const out: RelatedCard[] = [];
  for (const item of raw as unknown[]) {
    if (out.length >= max) break;
    const c = readCard(item, withDistance);
    if (!c || c._id === sourceId || seen.has(c._id)) continue;
    seen.add(c._id);
    out.push(c);
  }
  return out;
}

/**
 * The related rows for the stay `sourceId`, or null when the payload is not
 * the documented shape. Cards are capped, de-duplicated across both rows and
 * never the stay itself.
 */
export function readRelatedStays(raw: unknown, sourceId: string): RelatedStays | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.host) || !Array.isArray(r.nearby)) return null;
  const scope = r.nearbyScope;
  if (scope !== null && scope !== "near" && scope !== "mixed" && scope !== "wide") return null;
  const hostId = r.sourceHostId;
  if (hostId !== null && !(typeof hostId === "string" && OBJECT_ID.test(hostId))) return null;
  if (r.unavailable !== undefined && typeof r.unavailable !== "boolean") return null;
  if (r.unavailable === true) return { host: [], nearby: [], nearbyScope: null, sourceHostId: null, unavailable: true };
  const seen = new Set<string>();
  const host = readRow(r.host, HOST_ROW_MAX, false, seen, sourceId);
  const nearby = readRow(r.nearby, NEARBY_ROW_MAX, true, seen, sourceId);
  return { host, nearby, nearbyScope: nearby.length ? scope : null, sourceHostId: hostId, unavailable: false };
}

// --- card copy (shared by the card and scripts/check-related.mjs) ----------

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Villa · 4 guests" / "Villa" / "4 guests" / "" */
export function stayFacts(c: Pick<RelatedCard, "propertyType" | "guests">): string {
  const parts: string[] = [];
  if (c.propertyType) parts.push(cap(c.propertyType));
  if (c.guests) parts.push(`${c.guests} ${c.guests === 1 ? "guest" : "guests"}`);
  return parts.join(" · ");
}

/** "Panaji, Goa". Hosts who typed the state as the city have their locality in district (same rule as StayCard). */
export function stayPlace(c: Pick<RelatedCard, "city" | "district" | "state">): string {
  const sameAsState = c.city && c.state && c.district && c.city.toLowerCase() === c.state.toLowerCase();
  const city = sameAsState ? c.district : c.city;
  return [city, c.state].filter(Boolean).map((s) => cap(String(s))).join(", ");
}

/** "About 3.2 km from this stay" — distances are between approximate points. */
export function distanceCopy(km: number | null): string {
  if (km === null) return "";
  if (km < 1) return "Less than 1 km from this stay";
  return `About ${km < 10 ? km.toFixed(1) : Math.round(km)} km from this stay`;
}

export const HOST_ROW_TITLE = (name: string) => `More stays hosted by ${name}`;
export const NEARBY_ROW_TITLE = "Similar stays nearby";
/** Never "within 25 km" / "closest": the API widened the search. */
export const nearbySubtitle = (scope: NearbyScope) =>
  scope === "mixed" || scope === "wide" ? "More options farther away" : null;
