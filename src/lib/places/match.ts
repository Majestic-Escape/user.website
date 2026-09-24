// Destination suggestions, matched locally against the index served by
// GET /api/v1/places/index (server.me services/placeSearch.clientIndex):
// one ~44 KB download per session, zero requests per keystroke.
//
// The server stays authoritative: a picked suggestion is sent as `placeId`
// and resolved there; typed text without a pick is resolved there too.
import { boundedEditDistance, compactKey, fuzzyBudget, normalizePlaceText } from "./normalize";

export type PlaceType = "state" | "district" | "taluka" | "city" | "town" | "village" | "area" | "beach" | "island" | "place";

export type PlaceSuggestion = {
  id: string;
  name: string;
  type: PlaceType;
  label: string; // "North Goa, Goa"
  aliases: string[];
  stays: number;
  popK: number;
};

type Entry = PlaceSuggestion & {
  nameKey: string;
  nameCompact: string;
  nameWords: string[];
  aliasKeys: string[];
  aliasCompacts: string[];
  labelKey: string;
};

export type PlacesIndex = { entries: Entry[]; byId: Map<string, Entry> };

const TYPES: Record<string, PlaceType> = { s: "state", d: "district", k: "taluka", c: "city", t: "town", v: "village", a: "area", b: "beach", i: "island", l: "place" };
// Among equally good matches: states, cities, districts before villages.
const TYPE_WEIGHT: Record<PlaceType, number> = { state: 0, city: 1, district: 2, town: 3, taluka: 4, village: 5, beach: 5, island: 5, area: 5, place: 5 };
const MAX_ROWS = 20000;

/** Validates the payload; anything malformed yields null (free-text fallback). */
export function buildPlacesIndex(payload: unknown): PlacesIndex | null {
  if (!payload || typeof payload !== "object") return null;
  const { labels, rows } = payload as { labels?: unknown; rows?: unknown };
  if (!Array.isArray(labels) || !Array.isArray(rows) || rows.length > MAX_ROWS) return null;
  const entries: Entry[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 6) continue;
    const [id, name, t, li, aliases, stays, popK] = row;
    if (typeof id !== "string" || typeof name !== "string" || !name || id.length > 80) continue;
    const type = TYPES[String(t)] || "town";
    const label = typeof li === "number" && typeof labels[li] === "string" ? (labels[li] as string) : "";
    const aliasList = typeof aliases === "string" && aliases ? aliases.split("|").filter(Boolean) : [];
    const nameKey = normalizePlaceText(name);
    const aliasKeys = aliasList.map(normalizePlaceText).filter(Boolean);
    entries.push({
      id,
      name,
      type,
      label,
      aliases: aliasList,
      stays: typeof stays === "number" && stays > 0 ? stays : 0,
      popK: typeof popK === "number" && popK > 0 ? popK : 0,
      nameKey,
      nameCompact: compactKey(nameKey),
      nameWords: nameKey.split(" "),
      aliasKeys,
      aliasCompacts: aliasKeys.map(compactKey),
      labelKey: normalizePlaceText(label),
    });
  }
  if (!entries.length) return null;
  return { entries, byId: new Map(entries.map((e) => [e.id, e])) };
}

function wordPrefix(words: string[], queryWords: string[]): boolean {
  // every typed word starts some name word, in order: "north g" → "North Goa"
  let w = 0;
  for (const qw of queryWords) {
    while (w < words.length && !words[w].startsWith(qw)) w++;
    if (w === words.length) return false;
    w++;
  }
  return true;
}

function score(e: Entry, qn: string, qc: string, qWords: string[]): number {
  if (e.nameKey === qn || e.nameCompact === qc) return 0;
  if (e.aliasKeys.includes(qn) || e.aliasCompacts.includes(qc)) return 1;
  if (e.nameKey.startsWith(qn) || e.nameCompact.startsWith(qc)) return 2;
  if (wordPrefix(e.nameWords, qWords)) return 3;
  if (e.aliasKeys.some((a) => a.startsWith(qn)) || e.aliasCompacts.some((a) => a.startsWith(qc))) return 4;
  return -1;
}

function fuzzy(e: Entry, qc: string, budget: number): boolean {
  // a typo in what has been typed so far: compare with the same-length
  // prefix of the name ("panjm" ~ "panaj|i", "vasko" ~ "vasco")
  for (const key of [e.nameCompact, ...e.aliasCompacts]) {
    if (key[0] !== qc[0]) continue; // a first-letter typo is rare; skipping it keeps 4–5 letter prefixes precise
    for (let len = qc.length - 1; len <= qc.length + 1; len++) {
      if (len < 1 || len > key.length) continue;
      if (boundedEditDistance(qc, key.slice(0, len), budget) <= budget) return true;
    }
  }
  return false;
}

type Hit = [Entry, number];

function rank([a, as]: Hit, [b, bs]: Hit): number {
  return (
    as - bs ||
    (b.stays > 0 ? 1 : 0) - (a.stays > 0 ? 1 : 0) ||
    TYPE_WEIGHT[a.type] - TYPE_WEIGHT[b.type] ||
    b.popK - a.popK ||
    a.name.length - b.name.length ||
    (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  );
}

/** Up to `limit` suggestions for what has been typed ("colva, goa" filters by parent). */
export function suggestPlaces(index: PlacesIndex | null, query: string, limit = 8): PlaceSuggestion[] {
  if (!index) return [];
  const [headRaw, ...quals] = String(query || "").split(",");
  const qn = normalizePlaceText(headRaw);
  if (!qn) return [];
  const qc = compactKey(qn);
  const qWords = qn.split(" ");
  // "Colva, Goa" narrows to Goa; "Goa, India" / "Goa state" add nothing
  const qualKeys = quals.map(normalizePlaceText).filter((q) => q && q !== "india" && q !== "state");
  const inParents = (e: Entry) => qualKeys.every((q) => e.labelKey.includes(q));
  const hits: Hit[] = [];
  for (const e of index.entries) {
    const s = score(e, qn, qc, qWords);
    if (s >= 0 && inParents(e)) hits.push([e, s]);
  }
  // Typos only from 5 letters: "panj" must not suggest Punjab or Panipat.
  const budget = qc.length >= 5 ? fuzzyBudget(qc.length) : 0;
  if (hits.length < 3 && budget) {
    const seen = new Set(hits.map((h) => h[0].id));
    for (const e of index.entries) {
      if (!seen.has(e.id) && inParents(e) && fuzzy(e, qc, budget)) hits.push([e, 5]);
    }
  }
  hits.sort(rank);
  return hits.slice(0, limit).map((h) => strip(h[0]));
}

/** Places with the most stays (localities before regions) — shown before typing. */
export function popularPlaces(index: PlacesIndex | null, limit = 6): PlaceSuggestion[] {
  if (!index) return [];
  return index.entries
    .filter((e) => e.stays > 0 && e.type !== "state" && e.type !== "district" && e.type !== "taluka")
    .sort((a, b) => b.stays - a.stays || b.popK - a.popK || (a.name < b.name ? -1 : 1))
    .slice(0, limit)
    .map(strip);
}

export function placeById(index: PlacesIndex | null, id: string | null | undefined): PlaceSuggestion | null {
  if (!index || !id) return null;
  const e = index.byId.get(id);
  return e ? strip(e) : null;
}

function strip(e: Entry): PlaceSuggestion {
  return { id: e.id, name: e.name, type: e.type, label: e.label, aliases: e.aliases, stays: e.stays, popK: e.popK };
}

/** Human type word for the second line of a suggestion. */
export function placeTypeLabel(type: PlaceType): string {
  switch (type) {
    case "state":
      return "State";
    case "district":
      return "District";
    case "taluka":
      return "Taluka";
    case "beach":
      return "Beach";
    case "island":
      return "Island";
    case "city":
      return "City";
    default:
      return "";
  }
}
