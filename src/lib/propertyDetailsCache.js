// Listing summaries for chat rows and thread headers (/messages, /host/inbox):
// title, first photo, type, city/state, nightly price and the host's first
// name and photo — the only fields those pages read.
//
// Kept in localStorage so a conversation row is complete on the first frame,
// also after the browser was closed and reopened. It is public listing data
// (the same the stay page shows), so it is not tied to an account. Entries
// are refreshed in the background by the pages as before and ignored after
// MAX_AGE_MS; at most MAX_ENTRIES are kept, oldest dropped first.
const STORAGE_KEY = "me:propertyDetailsCache:v2";
const LEGACY_SESSION_KEY = "me:propertyDetailsCache:v1";
const MAX_ENTRIES = 50;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const str = (v, max = 300) => (typeof v === "string" && v ? v.slice(0, max) : undefined);

/** The chat pages' view of a listing — nothing else is persisted. */
export const toChatProperty = (p) => {
  if (!p || typeof p !== "object") return null;
  const image = [p.images?.[0], p.photos?.[0], p.image].find((x) => typeof x === "string" && x);
  const price = Number(p.basePrice ?? p.price?.base);
  return {
    _id: str(p._id, 64),
    title: str(p.title ?? p.name, 200),
    images: image ? [image.slice(0, 1000)] : [],
    propertyType: str(p.propertyType ?? p.type, 60),
    address: { city: str(p.address?.city ?? p.city, 120), state: str(p.address?.state ?? p.state, 120) },
    basePrice: Number.isFinite(price) && price > 0 ? price : undefined,
    host: p.host
      ? { firstName: str(p.host.firstName, 60), profilePicture: str(p.host.profilePicture, 1000) }
      : undefined,
  };
};

const readMap = () => {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeMap = (map) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota or serialization error — silently degrade
  }
};

/** { [propertyId]: summary } for the fresh entries, to seed page state. */
export const getInitialPropertyDetails = () => {
  if (!isBrowser()) return {};
  try {
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // ignore
  }
  const now = Date.now();
  const out = {};
  for (const [id, entry] of Object.entries(readMap())) {
    if (entry && entry.data && now - (entry.savedAt || 0) < MAX_AGE_MS) out[id] = entry.data;
  }
  return out;
};

export const getCachedProperty = (propertyId) => {
  if (!propertyId) return null;
  const entry = readMap()[propertyId];
  return entry && entry.data && Date.now() - (entry.savedAt || 0) < MAX_AGE_MS ? entry.data : null;
};

export const setCachedProperty = (propertyId, property) => {
  const data = toChatProperty(property);
  if (!propertyId || !data) return;
  const map = readMap();
  delete map[propertyId]; // re-insert as newest
  const ids = Object.keys(map);
  for (let i = 0; i <= ids.length - MAX_ENTRIES; i++) delete map[ids[i]];
  map[propertyId] = { savedAt: Date.now(), data };
  writeMap(map);
};
