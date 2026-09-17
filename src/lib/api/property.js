// Direct (non-cached) fetchers for the listing and its blocked dates.
//
// These exist for the one moment where "fast from cache" is the wrong
// answer: right before money changes hands. Checkout calls them on Confirm
// to re-price and re-check availability against the live API, so a stale
// cached listing can never be what the customer is charged for. They use
// plain fetch with `cache: "no-store"` and never touch React Query.
//
// Note: until server.me recomputes price/availability itself (Batch S), this
// is a UX safeguard, not a security control.

import { readStoredToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function authHeaders() {
  const token = readStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Listing document, or throws (ApiError with `status` for HTTP failures,
// plain Error for network failures). The public and Bearer responses are
// byte-identical (checked), so one React Query entry — queryKeys.property(id)
// — serves the stay page, checkout and any other reader.
export async function fetchProperty(id, { fresh = false } = {}) {
  if (!id) throw new Error("Property ID is missing");
  const response = await fetch(`${API_URL}/properties/${id}`, {
    method: "GET",
    ...(fresh ? { cache: "no-store" } : {}),
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch property (status: ${response.status})`,
      response.status,
    );
  }
  const result = await response.json();
  if (!result?.data) throw new Error("Property data missing in response");
  return result.data;
}

// Unconditional network hit for the pre-payment re-check.
export function fetchLatestProperty(id) {
  return fetchProperty(id, { fresh: true });
}

// Latest blocked nights for a listing as "YYYY-MM-DD" strings (the server
// lists every booked night, checkout day excluded). Throws on failure.
export async function fetchLatestAvailability(id) {
  if (!id) throw new Error("Property ID is missing");
  const response = await fetch(`${API_URL}/booking/check-dates/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch availability (status: ${response.status})`,
      response.status,
    );
  }
  const result = await response.json();
  return Array.isArray(result?.data) ? result.data : [];
}
