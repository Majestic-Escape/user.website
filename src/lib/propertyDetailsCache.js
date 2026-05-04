const STORAGE_KEY = "me:propertyDetailsCache:v1";
const MAX_ENTRIES = 50;

const isBrowser = () => typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const readMap = () => {
  if (!isBrowser()) return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeMap = (map) => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota or serialization error — silently degrade
  }
};

export const getInitialPropertyDetails = () => readMap();

export const getCachedProperty = (propertyId) => {
  if (!propertyId) return null;
  const map = readMap();
  return map[propertyId] || null;
};

export const setCachedProperty = (propertyId, property) => {
  if (!propertyId || !property) return;
  const map = readMap();
  if (!map[propertyId] && Object.keys(map).length >= MAX_ENTRIES) {
    // LRU-by-insertion: drop the oldest key
    const oldestKey = Object.keys(map)[0];
    if (oldestKey) delete map[oldestKey];
  }
  map[propertyId] = property;
  writeMap(map);
};
