// "Near me": the browser's position, rounded to 2 decimals (~1 km) right
// here, before it can reach a URL, a request, a log or recent searches.
// Only ever called from an explicit click.
export type NearMeError = "unsupported" | "insecure" | "denied" | "unavailable" | "timeout";

export const NEAR_ME_MESSAGES: Record<NearMeError, string> = {
  unsupported: "Your browser can't share its location. Type a place instead.",
  insecure: "Location is only available on a secure connection. Type a place instead.",
  denied: "Location access is turned off for this site. Allow it in your browser settings, or type a place.",
  unavailable: "We couldn't find your location right now. Type a place instead.",
  timeout: "Finding your location took too long. Try again, or type a place.",
};

export function getRoundedPosition(timeoutMs = 10000): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return reject("unsupported" as NearMeError);
    if (!window.isSecureContext) return reject("insecure" as NearMeError);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lng = Math.round(pos.coords.longitude * 100) / 100;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return reject("unavailable" as NearMeError);
        resolve({ lat, lng });
      },
      (err) => {
        reject((err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.TIMEOUT ? "timeout" : "unavailable") as NearMeError);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
    );
  });
}
