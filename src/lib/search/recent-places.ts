// The last few destinations picked from suggestions, per browser. Names and
// ids only — never coordinates, never free text (which could be anything a
// user typed). Storage failures (private mode, blocked site data) are
// ignored: the list is a convenience.
import { isArray, readJSON } from "@/lib/storage";

const KEY = "me:recentPlaces";
const MAX = 5;

export type RecentPlace = { id: string; name: string; label: string };

const valid = (v: unknown): v is RecentPlace[] =>
  isArray(v) &&
  v.every((x) => x && typeof x === "object" && typeof (x as RecentPlace).id === "string" && typeof (x as RecentPlace).name === "string");

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readRecentPlaces(): RecentPlace[] {
  return readJSON<RecentPlace[]>(storage(), KEY, [], valid).slice(0, MAX);
}

export function rememberPlace(place: RecentPlace) {
  const s = storage();
  if (!s || !place.id.match(/^(st|gn|l):/)) return;
  const next = [{ id: place.id, name: place.name.slice(0, 80), label: (place.label || "").slice(0, 120) }, ...readRecentPlaces().filter((p) => p.id !== place.id)].slice(0, MAX);
  try {
    s.setItem(KEY, JSON.stringify(next));
  } catch {
    // quota / blocked storage: ignore
  }
}
