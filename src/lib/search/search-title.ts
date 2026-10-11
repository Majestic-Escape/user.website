// Result-page wording from the server's reading of a search (pure, so
// scripts/check-search.mjs can test it).
export type SearchTitleMeta = {
  mode: "all" | "place" | "nearby" | "near" | "text";
  query: string | null;
  place: { name: string } | null;
  propertyType?: string | null;
};

const PLURAL: Record<string, string> = {
  villa: "Villas",
  hotel: "Hotels",
  apartment: "Apartments",
  house: "Houses",
  guesthouse: "Guesthouses",
  farmhouse: "Farmhouses",
  cottage: "Cottages",
  cabin: "Cabins",
  bungalow: "Bungalows",
  condo: "Condos",
  townhouse: "Townhouses",
  treehouse: "Treehouses",
  houseboat: "Houseboats",
  tent: "Tents",
  yurt: "Yurts",
  dome: "Domes",
  lighthouse: "Lighthouses",
};

/** "Villas" for a type named in the search, else "Stays". */
export function staysNoun(propertyType: string | null | undefined): string {
  return (propertyType && PLURAL[propertyType]) || "Stays";
}

/**
 * The empty-result message when a place (or "near me") has nothing in or
 * around it — said once, in the result box, with what to try next. Null for
 * every other empty result (a name nobody matched keeps its own message).
 */
export function emptyResultCopy(meta: (SearchTitleMeta & { reason?: string | null }) | null, hasDates = false): { title: string; hint: string } | null {
  if (!meta) return null;
  const noun = staysNoun(meta.propertyType).toLowerCase();
  if (meta.mode === "near") {
    if (meta.reason === "filters") return { title: `No ${noun} near you match your filters`, hint: "Try removing a filter, or a town or district." };
    if (meta.reason === "dates") return { title: `No ${noun} near you are free on ${hasDates ? "your dates" : "those dates"}`, hint: "Try other dates, or a town or district." };
    return { title: `No ${noun} near you yet`, hint: "Try a town or district, or one of these destinations." };
  }
  if (meta.mode !== "nearby" || !meta.place) return null;
  const where = `in or near ${meta.place.name}`;
  if (meta.reason === "filters") return { title: `No ${noun} ${where} match your filters`, hint: "Try removing a filter, or another destination." };
  if (meta.reason === "dates") return { title: `No ${noun} ${where} are free on ${hasDates ? "your dates" : "those dates"}`, hint: "Try other dates, or another destination." };
  return { title: `No ${noun} ${where} yet`, hint: "We're adding new stays regularly. Meanwhile, try one of these destinations." };
}

export function searchTitle(meta: SearchTitleMeta | null): string {
  if (!meta) return "Discover Our Finest Stays";
  const noun = staysNoun(meta.propertyType);
  if (meta.mode === "place" && meta.place) return `${noun} in ${meta.place.name}`;
  if (meta.mode === "nearby" && meta.place) return `${noun} near ${meta.place.name}`;
  if (meta.mode === "near") return `${noun} near you`;
  if (meta.mode === "text" && meta.query) return `Stays matching “${meta.query}”`;
  if (meta.mode === "all" && meta.propertyType) return noun;
  return "Discover Our Finest Stays";
}
