import "server-only";
// Batch P — server prefetch of the home catalogue.
//
// The home and /stays pages render their listing grid and destination
// counts from this snapshot, so the first HTML carries the cards (no
// skeleton → fetch waterfall). The two fetches are cached by Next.js under
// the `listings` tag for 5 minutes; the backend purges that tag on every
// public listing change (POST /api/revalidate), and they carry the fresh
// bypass so a regeneration after a purge can never be refilled from a
// stale edge copy of the API response.
//
// Failures are swallowed on purpose: without a snapshot the client falls
// back to exactly the old behaviour (skeletons, then its own fetch).
import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { PUBLIC, PUBLIC_LONG } from "@/lib/query-presets";
import { COUNT_STAYS_PATH, FRONT_STAYS_PATH, normalizeCountStays, normalizeFrontStays } from "@/lib/catalogue";

export const CATALOGUE_REVALIDATE_SECONDS = 300;
const FETCH_TIMEOUT_MS = 6000;

function backendBase(): string | null {
  const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  return base && /^https?:\/\//.test(base) ? base.replace(/\/$/, "") : null;
}

async function fetchCatalogue(path: string, tags: string[]): Promise<unknown> {
  const base = backendBase();
  if (!base) throw new Error("no absolute backend base on the server");
  const url = `${base}${path}${path.includes("?") ? "&" : "?"}fresh=1`;
  const headers: Record<string, string> = {};
  if (process.env.CATALOGUE_FRESH_SECRET) headers["x-catalogue-fresh"] = process.env.CATALOGUE_FRESH_SECRET;
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

// Dehydrated React Query state for the home catalogue, or null when the
// backend could not be reached (the client then fetches as before).
export async function prefetchCatalogue(): Promise<DehydratedState | null> {
  const qc = new QueryClient();
  const results = await Promise.allSettled([
    qc.fetchQuery({
      queryKey: queryKeys.frontStays(null),
      queryFn: async () => normalizeFrontStays(await fetchCatalogue(FRONT_STAYS_PATH, ["listings"])),
      staleTime: PUBLIC.staleTime,
    }),
    qc.fetchQuery({
      queryKey: queryKeys.countStays,
      queryFn: async () => normalizeCountStays(await fetchCatalogue(COUNT_STAYS_PATH, ["listings"])),
      staleTime: PUBLIC_LONG.staleTime,
    }),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[catalogue] prefetch failed:", r.reason && r.reason.message);
  }
  const state = dehydrate(qc); // successful queries only
  return state.queries.length ? state : null;
}
