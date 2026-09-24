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
