// Calendar sync (SyncGuard) API wrappers for the host calendar page.
// Every call carries the host's bearer token; the server decides ownership.
// No URL or token is ever logged or stored in the browser.
import { readStoredToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class SyncApiError extends Error {
  constructor(message, status, code, extra) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra || {};
  }
}

async function call(method, path, body) {
  const token = readStoredToken();
  let res;
  try {
    res = await fetch(`${API_URL}/calendarSync${path}`, {
      method,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new SyncApiError("We couldn't reach Majestic Escape. Check your connection and try again.", 0, "NETWORK");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const { message, code, statusCode, success, ...extra } = json || {};
    throw new SyncApiError(message || "Something went wrong. Please try again.", res.status, code, extra);
  }
  return json;
}

export const listConnections = (propertyId) => call("GET", `/properties/${propertyId}/connections`).then((r) => r.data);
export const connectCalendar = (propertyId, { channel, url, name }) => call("POST", `/properties/${propertyId}/connections`, { channel, url, name });
export const updateConnection = (id, patch) => call("PATCH", `/connections/${id}`, patch);
export const syncConnectionNow = (id) => call("POST", `/connections/${id}/sync`);
export const rotateExportLink = (id) => call("POST", `/connections/${id}/rotate-export`);
export const confirmExportAdded = (id) => call("POST", `/connections/${id}/confirm-export`);
export const disconnectCalendar = (id, { acknowledge, releaseBlocks }) => call("POST", `/connections/${id}/disconnect`, { acknowledge, releaseBlocks });
export const releaseBlocks = (id) => call("POST", `/connections/${id}/release-blocks`, { acknowledge: true });
export const explainDate = (propertyId, date) => call("GET", `/properties/${propertyId}/explain?date=${encodeURIComponent(date)}`).then((r) => r.data);
