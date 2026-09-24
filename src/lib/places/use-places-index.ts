"use client";
// The destination suggestion index, fetched once — and only once the
// destination field is first opened — then kept for the session. If it
// cannot be loaded (old API, outage, offline, malformed payload) the field
// keeps working as plain text: search still resolves the text server-side.
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { buildPlacesIndex, type PlacesIndex } from "./match";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TIMEOUT_MS = 8000;

async function fetchPlacesIndex(): Promise<PlacesIndex | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/places/index`, { signal: ctrl.signal });
    if (!res.ok) {
      const err = new Error(`places index ${res.status}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return buildPlacesIndex(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

export function usePlacesIndex(enabled: boolean) {
  const q = useQuery({
    queryKey: queryKeys.placesIndex,
    queryFn: fetchPlacesIndex,
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    // one retry for a network blip / 5xx; a 4xx (an API without the index) is final
    retry: (count, err) => {
      const status = (err as { status?: number } | null)?.status;
      return !(typeof status === "number" && status >= 400 && status < 500) && count < 1;
    },
  });
  return { index: q.data ?? null, loading: enabled && q.isPending, unavailable: q.isError || (q.isSuccess && !q.data) };
}
