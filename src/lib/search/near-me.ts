// "Near me": the browser's position, rounded to 2 decimals (~1 km) right
// here, before it can reach a URL, a request, a log or recent searches.
// Only ever called from an explicit click.
//
// The browser alone decides whether to ask. Chrome shows a full prompt, a
// small "Use your location?" chip in the address bar (its quiet UI after a
// site's prompts were dismissed a few times), or nothing at all when the site
// is blocked or auto-blocked after repeated dismissals — then the request
// fails at once as PERMISSION_DENIED. The UI therefore says what it is waiting
// for ("allow it in the prompt") and, on failure, tells a dismissed request
// (try again) from a blocked one (how to re-allow) using the Permissions API.
export type NearMeError = "unsupported" | "insecure" | "denied" | "dismissed" | "unavailable" | "timeout";
export type LocationPermission = "granted" | "prompt" | "denied" | "unknown";

export const NEAR_ME_MESSAGES: Record<NearMeError, string> = {
  unsupported: "Your browser can't share its location. Type a place instead.",
  insecure: "Location is only available on a secure connection. Type a place instead.",
  denied:
    "Location is blocked for this site. To allow it, tap the icon next to the web address (or open your browser's site settings), set Location to Allow, then tap “Stays near me” again — or type a place.",
  dismissed: "The location request was closed. Tap “Stays near me” and choose Allow — or type a place.",
  unavailable: "We couldn't find your location right now. Type a place instead.",
  timeout: "Finding your location took too long. Try again, or type a place.",
};

/** The site's location permission, without asking; "unknown" where the Permissions API can't tell. */
export async function locationPermission(): Promise<LocationPermission> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state === "granted" || status.state === "prompt" || status.state === "denied" ? status.state : "unknown";
  } catch {
    return "unknown"; // older Safari: no geolocation permission query
  }
}

/** Calls `onChange` whenever the site's location permission changes (e.g. re-allowed in settings). */
export function watchLocationPermission(onChange: (state: LocationPermission) => void): () => void {
  let status: PermissionStatus | null = null;
  let cancelled = false;
  const handler = () => {
    if (status) onChange(status.state === "granted" || status.state === "prompt" || status.state === "denied" ? status.state : "unknown");
  };
  try {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((s) => {
        if (cancelled) return;
        status = s;
        s.addEventListener("change", handler);
      })
      .catch(() => {});
  } catch {
    // no Permissions API: nothing to watch
  }
  return () => {
    cancelled = true;
    status?.removeEventListener("change", handler);
  };
}

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
      // the timeout only runs once permission is granted; waiting on the prompt never times out
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
    );
  });
}

/**
 * The whole "near me" request with progress: `onStage("asking")` while the
 * browser waits for the visitor's answer, `onStage("locating")` once allowed.
 * A PERMISSION_DENIED with the permission still at "prompt" means the request
 * was dismissed or ignored (not blocked).
 */
export async function requestNearMe(onStage: (stage: "asking" | "locating") => void): Promise<{ lat: number; lng: number }> {
  const before = await locationPermission();
  onStage(before === "prompt" ? "asking" : "locating");
  const stop = before === "prompt" ? watchLocationPermission((s) => s === "granted" && onStage("locating")) : () => {};
  try {
    return await getRoundedPosition();
  } catch (e) {
    if (e === "denied" && (await locationPermission()) === "prompt") throw "dismissed" as NearMeError;
    throw e;
  } finally {
    stop();
  }
}
