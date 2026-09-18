// Batch P — the home catalogue's two reads, shaped once for both sides:
// the client `queryFn`s (through the same-origin /api/v1 rewrite) and the
// server prefetch (lib/server/catalogue.ts, straight to the backend). Same
// keys, same normalised shapes, so a server snapshot hydrates the exact
// query the client would otherwise fetch.
import { destinationCities } from "@/lib/data/destinations";

export type CatalogueCard = {
  _id: string;
  title?: string;
  propertyType?: string;
  basePrice?: number;
  photos?: string[];
  address?: { city?: string; state?: string; country?: string };
  averageRating?: number;
  reviewCount?: number;
  [key: string]: unknown;
};

export type CityCount = { city: string; count: number };

export const FRONT_STAYS_PATH = "/properties/front/dynamic";
export const COUNT_STAYS_PATH = `/properties/countstays?city=${destinationCities}`;

// Defence in depth: the backend never sends the chat widget's vector fields
// any more, but a snapshot rendered against an older backend must not carry
// 40 KB of floats per card into the HTML either.
const VECTOR_FIELDS = ["embedding", "embeddingUpdatedAt", "embeddingVersion"] as const;
function stripVector(card: CatalogueCard): CatalogueCard {
  if (!VECTOR_FIELDS.some((k) => k in card)) return card;
  const copy: CatalogueCard = { ...card };
  for (const k of VECTOR_FIELDS) delete copy[k];
  return copy;
}

export function normalizeFrontStays(data: unknown): CatalogueCard[] {
  const list = (data as { properties?: unknown } | null)?.properties;
  return Array.isArray(list) ? (list as CatalogueCard[]).map(stripVector) : [];
}

export function normalizeCountStays(result: unknown): CityCount[] {
  const list = (result as { data?: unknown } | null)?.data;
  return Array.isArray(list) ? (list as CityCount[]) : [];
}
